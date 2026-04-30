import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createOpenClawChatCompletion, type OpenClawChatMessage } from '@/lib/openclaw'

export const runtime = 'nodejs'

type OpenClawChatRequest = {
  messages?: OpenClawChatMessage[]
  currentView?: string
  locale?: 'ms' | 'en'
}

function sanitizeMessages(messages: OpenClawChatMessage[]): OpenClawChatMessage[] {
  return messages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant' || message.role === 'system'))
    .map((message) => ({
      role: message.role,
      content: String(message.content || '').slice(0, 12000),
    }))
    .filter((message) => message.content.trim().length > 0)
    .slice(-30)
}

function buildOpenClawSystemMessage(params: { role: string; currentView?: string; locale?: 'ms' | 'en' }): OpenClawChatMessage {
  const language = params.locale === 'en' ? 'English' : 'Bahasa Melayu rojak yang ringkas dan praktikal'

  return {
    role: 'system',
    content: [
      'You are PUSPA AI, powered directly by OpenClaw Gateway.',
      'Use OpenClaw agent behavior only. Do not claim to be any separate assistant framework.',
      `Reply in ${language}.`,
      `Current app view: ${params.currentView || 'dashboard'}.`,
      `Authenticated app role: ${params.role}.`,
      'Be concise, safe, and operational. Do not expose secrets, tokens, cookies, or internal credentials.',
    ].join('\n'),
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()

  try {
    const session = await requireAuth(request)
    const body = (await request.json().catch(() => ({}))) as OpenClawChatRequest
    const messages = sanitizeMessages(body.messages || [])

    if (messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Mesej diperlukan' }, { status: 400 })
    }

    const result = await createOpenClawChatCompletion(
      [
        buildOpenClawSystemMessage({
          role: session.user.role,
          currentView: body.currentView,
          locale: body.locale,
        }),
        ...messages,
      ],
      { temperature: 0.2, sessionKey: `${session.user.id}:${body.currentView || 'dashboard'}` },
    )

    return NextResponse.json({
      success: true,
      data: {
        message: {
          role: 'assistant',
          content: result.content,
        },
        provider: 'openclaw',
        model: result.model,
        usage: result.usage,
        latencyMs: Date.now() - startedAt,
      },
    })
  } catch (error: any) {
    console.error('OpenClaw chat error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'OpenClaw Gateway mengalami masalah teknikal' },
      { status: 500 },
    )
  }
}
