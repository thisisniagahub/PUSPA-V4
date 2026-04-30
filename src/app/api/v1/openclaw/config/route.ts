import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import {
  DEFAULT_OPENCLAW_AGENT_MODEL,
  getOpenClawGatewayUrl,
  isOpenClawGatewayConfigured,
} from '@/lib/openclaw'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request)

    return NextResponse.json({
      success: true,
      data: {
        provider: 'openclaw',
        model: process.env.OPENCLAW_AGENT_MODEL || process.env.OPENCLAW_MODEL || DEFAULT_OPENCLAW_AGENT_MODEL,
        hasApiKey: Boolean(process.env.OPENCLAW_GATEWAY_TOKEN || process.env.OPENCLAW_GATEWAY_PASSWORD || process.env.OPENCLAW_API_KEY),
        apiKeyPrefix: null,
        baseUrl: getOpenClawGatewayUrl(),
        isConfigured: isOpenClawGatewayConfigured(),
        docs: 'https://docs.openclaw.ai/gateway/openai-http-api',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'OpenClaw config tidak dapat dibaca' },
      { status: 500 },
    )
  }
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'OpenClaw config dikawal melalui server environment sahaja. Set OPENCLAW_GATEWAY_URL/OPENCLAW_GATEWAY_TOKEN/OPENCLAW_AGENT_MODEL.',
    },
    { status: 405 },
  )
}
