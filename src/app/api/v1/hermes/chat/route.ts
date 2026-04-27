import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { buildHermesSystemPrompt } from '@/lib/hermes/prompt'
import { executeToolCall, hermesTools } from '@/lib/hermes/tools'
import { detectLocale } from '@/lib/hermes/lang-detect'
import { callLLM, streamLLM, getProviderConfig } from '@/lib/hermes/providers'
import type { ProviderId } from '@/lib/hermes/providers'
import { buildMemoryContext, extractAndStoreMemories } from '@/lib/hermes/memory'
import { findMatchingSkills, buildSkillsContext, recordSkillUsage } from '@/lib/hermes/skills'
import { db } from '@/lib/db'
import type { HermesChatRequest } from '@/lib/hermes/types'

export const runtime = 'nodejs'

// ============================================================
// Non-streaming chat endpoint
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    const userId = session.user.id
    const userRole = session.user.role

    const body: HermesChatRequest = await request.json()
    const { messages, currentView, locale: requestLocale, stream } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Mesej diperlukan' }, { status: 400 })
    }

    // Detect language
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()
    const locale = requestLocale || (lastUserMsg ? detectLocale(lastUserMsg.content) : 'ms')

    // Get provider config
    const providerConfig = await getProviderConfig(userId)

    // If streaming requested, use SSE
    if (stream && (providerConfig.provider === 'openrouter' || providerConfig.provider === 'ollama')) {
      return handleStreamingChat({
        messages, currentView, userRole, locale, userId, providerConfig,
      })
    }

    // Build context
    const systemPrompt = buildHermesSystemPrompt({ currentView, userRole, locale })
    const memoryContext = await buildMemoryContext(userId)
    const skillsContext = await buildSkillsContext(userId)

    // Find matching skills
    const matchingSkills = lastUserMsg ? await findMatchingSkills(lastUserMsg.content, userId) : []

    // Build tool descriptions
    const toolDescriptions = hermesTools.map(t => {
      const params = Object.entries(t.parameters)
        .map(([name, p]) => `${name}: ${p.type}${p.required ? ' (required)' : ''} — ${p.description}`)
        .join('; ')
      return `[${t.name}](${params}): ${t.description}`
    }).join('\n')

    // Build skill tools
    const skillTools = matchingSkills.length > 0
      ? `\n\n## Active Skills\n${matchingSkills.map(s =>
          `[skill:${s.name}](instruction: string): Execute the "${s.name}" skill — ${s.description}`
        ).join('\n')}`
      : ''

    const fullSystemMessage = `${systemPrompt}

${memoryContext ? `\n${memoryContext}\n` : ''}
${skillsContext ? `\n${skillsContext}\n` : ''}

## Available Data Tools
You have these tools to query REAL data from the database. Respond with a JSON tool call embedded in your response using this exact format:

<<TOOL:tool_name>>{"param1":"value1","param2":"value2"}<</TOOL>>

For example: <<TOOL:query_stats>>{"module":"members"}<</TOOL>>

Available tools:
${toolDescriptions}
${skillTools}

IMPORTANT: 
- Use tools whenever users ask about numbers, statistics, or data
- Only use ONE tool call per response
- After getting tool results, provide a clear, formatted answer
- If you don't need a tool, just respond normally without any <<TOOL>> tags`

    const allMessages = [
      { role: 'system' as const, content: fullSystemMessage },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    ]

    // Call LLM with the selected provider
    const startTime = Date.now()
    const result = await callLLM({
      provider: providerConfig.provider,
      messages: allMessages,
      model: providerConfig.model,
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl,
    })

    let assistantContent = result.content || 'Maaf, saya tidak dapat memproses permintaan anda.'

    // Check for tool calls and execute them
    const toolCallRegex = /<<TOOL:(\w+)>>([\s\S]*?)<<\/TOOL>>/
    const toolMatch = assistantContent.match(toolCallRegex)

    let toolResult: unknown = null
    let toolName: string | undefined
    let finalContent = assistantContent

    if (toolMatch) {
      toolName = toolMatch[1]
      let toolArgs: Record<string, unknown> = {}
      try {
        toolArgs = JSON.parse(toolMatch[2].trim())
      } catch {
        toolArgs = {}
      }

      // Execute the tool
      toolResult = await executeToolCall(toolName, toolArgs)

      // Ask LLM to format the response with tool results
      const formatMessages = [
        { role: 'system' as const, content: fullSystemMessage },
        { role: 'user' as const, content: messages[messages.length - 1]?.content || '' },
        { role: 'assistant' as const, content: `I called tool ${toolName} with args ${JSON.stringify(toolArgs)} and got this result:\n\n${JSON.stringify(toolResult, null, 2)}\n\nPlease format a helpful response based on this data. Respond in ${locale === 'ms' ? 'Bahasa Melayu' : 'English'}.` },
      ]

      const formatResult = await callLLM({
        provider: providerConfig.provider,
        messages: formatMessages,
        model: providerConfig.model,
        apiKey: providerConfig.apiKey,
        baseUrl: providerConfig.baseUrl,
      })

      finalContent = formatResult.content || assistantContent.replace(toolCallRegex, '').trim()

      // Record skill usage if matched
      if (matchingSkills.length > 0) {
        for (const skill of matchingSkills) {
          await recordSkillUsage(skill.id, true)
        }
      }
    }

    // Extract and store memories
    if (lastUserMsg) {
      await extractAndStoreMemories({
        userId,
        userMessage: lastUserMsg.content,
        assistantMessage: finalContent,
        provider: providerConfig.provider,
        model: providerConfig.model,
      }).catch(() => {}) // Non-blocking

      // Save conversation to DB
      await saveConversationTurn(userId, {
        currentView: currentView || 'dashboard',
        provider: providerConfig.provider,
        model: providerConfig.model,
        userMessage: lastUserMsg.content,
        assistantMessage: finalContent,
        toolName,
        toolResult,
        latencyMs: Date.now() - startTime,
      }).catch(() => {}) // Non-blocking
    }

    return NextResponse.json({
      success: true,
      data: {
        message: {
          role: 'assistant',
          content: finalContent,
        },
        toolResult: toolResult ? { name: toolName, result: toolResult } : undefined,
        provider: providerConfig.provider,
        model: result.model,
        latencyMs: result.latencyMs,
      },
    })
  } catch (error: any) {
    console.error('Hermes chat error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Hermes mengalami masalah teknikal' },
      { status: 500 },
    )
  }
}

// ============================================================
// Streaming handler (SSE)
// ============================================================
async function handleStreamingChat(params: {
  messages: HermesChatRequest['messages']
  currentView: string
  userRole: string
  locale: 'ms' | 'en'
  userId: string
  providerConfig: { provider: ProviderId; model: string; apiKey?: string; baseUrl?: string }
}): Promise<NextResponse> {
  const { messages, currentView, userRole, locale, userId, providerConfig } = params

  const systemPrompt = buildHermesSystemPrompt({ currentView, userRole, locale })
  const memoryContext = await buildMemoryContext(userId)
  const skillsContext = await buildSkillsContext(userId)

  const toolDescriptions = hermesTools.map(t => {
    const params = Object.entries(t.parameters)
      .map(([name, p]) => `${name}: ${p.type}${p.required ? ' (required)' : ''} — ${p.description}`)
      .join('; ')
    return `[${t.name}](${params}): ${t.description}`
  }).join('\n')

  const fullSystemMessage = `${systemPrompt}

${memoryContext ? `\n${memoryContext}\n` : ''}
${skillsContext ? `\n${skillsContext}\n` : ''}

## Available Data Tools
When users ask about data, respond with a JSON tool call embedded in your response using this exact format:
<<TOOL:tool_name>>{"param1":"value1"}<</TOOL>>

Available tools:
${toolDescriptions}

IMPORTANT: 
- Use tools whenever users ask about numbers, statistics, or data
- Only use ONE tool call per response
- If you don't need a tool, just respond normally without any <<TOOL>> tags`

  const allMessages = [
    { role: 'system' as const, content: fullSystemMessage },
    ...messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content,
    })),
  ]

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamLLM({
          provider: providerConfig.provider,
          messages: allMessages,
          model: providerConfig.model,
          apiKey: providerConfig.apiKey,
          baseUrl: providerConfig.baseUrl,
          onChunk: (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
          },
        })

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: error?.message || 'Stream error' })}\n\n`))
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// ============================================================
// Helper: Save conversation turn to DB
// ============================================================
async function saveConversationTurn(userId: string, data: {
  currentView: string
  provider: string
  model: string
  userMessage: string
  assistantMessage: string
  toolName?: string
  toolResult?: unknown
  latencyMs: number
}) {
  // Find or create conversation
  let conversation = await db.hermesConversation.findFirst({
    where: { userId, updatedAt: { gte: new Date(Date.now() - 3600000) } }, // Last hour
    orderBy: { updatedAt: 'desc' },
  })

  if (!conversation) {
    const title = data.userMessage.slice(0, 50) + (data.userMessage.length > 50 ? '...' : '')
    conversation = await db.hermesConversation.create({
      data: {
        userId,
        title,
        viewContext: data.currentView,
        provider: data.provider,
        model: data.model,
      },
    })
  }

  // Save user message
  await db.hermesMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: data.userMessage,
    },
  })

  // Save assistant message
  await db.hermesMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'assistant',
      content: data.assistantMessage,
      toolCalls: data.toolName ? JSON.stringify([{ name: data.toolName }]) : null,
      toolResults: data.toolResult ? JSON.stringify(data.toolResult) : null,
      provider: data.provider,
      model: data.model,
      latencyMs: data.latencyMs,
    },
  })

  // Update conversation
  await db.hermesConversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  })
}
