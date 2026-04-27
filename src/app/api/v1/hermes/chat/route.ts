import ZAI from 'z-ai-web-dev-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { buildHermesSystemPrompt } from '@/lib/hermes/prompt'
import { executeToolCall, hermesTools } from '@/lib/hermes/tools'
import { detectLocale } from '@/lib/hermes/lang-detect'
import type { HermesChatRequest } from '@/lib/hermes/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check - all authenticated roles can use Hermes
    const session = await requireAuth(request)
    const userRole = session.user.role

    // 2. Parse request body
    const body: HermesChatRequest = await request.json()
    const { messages, currentView, locale: requestLocale } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mesej diperlukan' },
        { status: 400 }
      )
    }

    // 3. Detect language from the latest user message
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()
    const locale = requestLocale || (lastUserMsg ? detectLocale(lastUserMsg.content) : 'ms')

    // 4. Build system prompt with context
    const systemPrompt = buildHermesSystemPrompt({ currentView, userRole, locale })

    // 5. Build tool descriptions for the LLM
    const toolDescriptions = hermesTools.map(t => {
      const params = Object.entries(t.parameters)
        .map(([name, p]) => `${name}: ${p.type}${p.required ? ' (required)' : ''} — ${p.description}`)
        .join('; ')
      return `[${t.name}](${params}): ${t.description}`
    }).join('\n')

    // 6. Prepare messages with system prompt including tool info
    const systemMessage = `${systemPrompt}

## Available Data Tools
You have these tools to query REAL data from the database. When asked about data, respond with a JSON tool call embedded in your response using this exact format:

<<TOOL:tool_name>>{"param1":"value1","param2":"value2"}<</TOOL>>

For example: <<TOOL:query_stats>>{"module":"members"}<</TOOL>>

Available tools:
${toolDescriptions}

IMPORTANT: 
- Use tools whenever users ask about numbers, statistics, or data
- Only use ONE tool call per response
- After getting tool results, provide a clear, formatted answer
- If you don't need a tool, just respond normally without any <<TOOL>> tags`

    const allMessages = [
      { role: 'assistant' as const, content: systemMessage },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    ]

    // 7. Call ZAI LLM
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: allMessages,
      thinking: { type: 'disabled' },
    })

    let assistantContent = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan anda.'

    // 8. Check for tool calls in the response and execute them
    const toolCallRegex = /<<TOOL:(\w+)>>([\s\S]*?)<<\/TOOL>>/
    const toolMatch = assistantContent.match(toolCallRegex)

    let toolResult: unknown = null
    let finalContent = assistantContent

    if (toolMatch) {
      const toolName = toolMatch[1]
      let toolArgs: Record<string, unknown> = {}
      try {
        toolArgs = JSON.parse(toolMatch[2].trim())
      } catch {
        toolArgs = {}
      }

      // Execute the tool
      toolResult = await executeToolCall(toolName, toolArgs)

      // Now ask the LLM to format a proper response with the tool results
      const formatMessages = [
        { role: 'assistant' as const, content: systemMessage },
        { role: 'user' as const, content: messages[messages.length - 1]?.content || '' },
        { role: 'assistant' as const, content: `I called tool ${toolName} with args ${JSON.stringify(toolArgs)} and got this result:\n\n${JSON.stringify(toolResult, null, 2)}\n\nPlease format a helpful response based on this data.` },
      ]

      const formatCompletion = await zai.chat.completions.create({
        messages: formatMessages,
        thinking: { type: 'disabled' },
      })

      finalContent = formatCompletion.choices[0]?.message?.content || assistantContent.replace(toolCallRegex, '').trim()
    }

    // 9. Generate suggestions based on context
    const suggestions: string[] = []

    return NextResponse.json({
      success: true,
      data: {
        message: {
          role: 'assistant',
          content: finalContent,
        },
        toolResult: toolResult ? { name: toolMatch?.[1], result: toolResult } : undefined,
        suggestions,
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
