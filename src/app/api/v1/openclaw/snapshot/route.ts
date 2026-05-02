import { NextResponse } from 'next/server'
import { AuthorizationError, requireRole } from '@/lib/auth'
import { DEFAULT_OPENCLAW_BRIDGE_URL, getOpenClawBridgeHeaders, type OpenClawSnapshot } from '@/lib/openclaw'

function sanitizeBridgeError(error: unknown) {
  if (typeof error !== 'string') return 'Failed to reach OpenClaw bridge'
  return error
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/(token|secret|key|password)=([^\s&]+)/gi, '$1=[REDACTED]')
    .slice(0, 240)
}

function createOfflineSnapshot(baseUrl: string, error: string): OpenClawSnapshot {
  const generatedAt = new Date().toISOString()

  return {
    generatedAt,
    controlUrl: baseUrl,
    gateway: {
      connected: false,
      status: 'offline',
      latencyMs: 0,
      gatewayUrl: baseUrl,
      healthUrl: `${baseUrl}/health`,
      error,
    },
    channels: {
      total: 0,
      connected: 0,
      items: [],
    },
    models: {
      defaultModel: null,
      resolvedDefault: null,
      fallbacks: [],
      aliases: {},
      allowedCount: 0,
      oauthProviders: [],
    },
    agents: [],
    automation: {
      cron: [],
      tasks: {
        total: 0,
        byStatus: {},
        byRuntime: {},
        recent: [],
      },
    },
    plugins: {
      entries: [],
      webhookRoutes: [],
    },
    mcp: {
      servers: [],
    },
  }
}

export async function GET(request: Request) {
  const baseUrl = (process.env.OPENCLAW_BRIDGE_URL || DEFAULT_OPENCLAW_BRIDGE_URL).replace(/\/$/, '')

  try {
    await requireRole(request, ['developer'])
    const response = await fetch(`${baseUrl}/snapshot`, {
      method: 'GET',
      cache: 'no-store',
      headers: getOpenClawBridgeHeaders(),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || !payload?.ok || !payload?.data) {
      return NextResponse.json({
        success: true,
        data: createOfflineSnapshot(baseUrl, sanitizeBridgeError(payload?.error || `Bridge returned HTTP ${response.status}`)),
      })
    }

    return NextResponse.json({
      success: true,
      data: payload.data as OpenClawSnapshot,
    })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: error.status })
    }
    return NextResponse.json({
      success: true,
      data: createOfflineSnapshot(baseUrl, sanitizeBridgeError(error instanceof Error ? error.message : 'Failed to reach OpenClaw bridge')),
    })
  }
}
