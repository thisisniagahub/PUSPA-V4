import { NextResponse } from 'next/server'
import { AuthorizationError, requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  DEFAULT_OPENCLAW_BRIDGE_URL,
  DEFAULT_OPENCLAW_AGENT_MODEL,
  getOpenClawBridgeHeaders,
  getOpenClawGatewayToken,
  getOpenClawGatewayUrl,
  isOpenClawGatewayConfigured,
} from '@/lib/openclaw'

const DEFAULT_GATEWAY_URL = 'https://operator.gangniaga.my'
const BRIDGE_TIMEOUT_MS = 4000

function hasSupabasePublicConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  )
}

function sanitizeError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return message
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/(token|secret|key|password)=([^\s&]+)/gi, '$1=[REDACTED]')
    .slice(0, 240)
}

async function checkDb() {
  const startedAt = Date.now()
  try {
    await db.$queryRaw`SELECT 1`
    return { ok: true, latencyMs: Date.now() - startedAt }
  } catch (error) {
    return { ok: false, latencyMs: Date.now() - startedAt, error: sanitizeError(error) }
  }
}

async function fetchBridgeSnapshot() {
  const baseUrl = (process.env.OPENCLAW_BRIDGE_URL || DEFAULT_OPENCLAW_BRIDGE_URL).replace(/\/$/, '')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), BRIDGE_TIMEOUT_MS)
  const startedAt = Date.now()

  try {
    const response = await fetch(`${baseUrl}/snapshot`, {
      method: 'GET',
      cache: 'no-store',
      headers: getOpenClawBridgeHeaders(),
      signal: controller.signal,
    })
    const payload = await response.json().catch(() => null)
    const gateway = payload?.data?.gateway

    return {
      ok: response.ok && !!payload?.ok,
      latencyMs: Date.now() - startedAt,
      status: gateway?.status || (response.ok ? 'reachable' : 'bridge-error'),
      gateway,
      generatedAt: payload?.data?.generatedAt,
      error: response.ok ? gateway?.error : payload?.error || `Bridge returned HTTP ${response.status}`,
    }
  } catch (error) {
    return { ok: false, latencyMs: Date.now() - startedAt, status: 'offline', error: sanitizeError(error) }
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET(request: Request) {
  try {
    await requireRole(request, ['developer'])

    const [dbCheck, bridgeCheck, botKeys, lastError, lastSuccess] = await Promise.all([
      checkDb(),
      fetchBridgeSnapshot(),
      db.botApiKey.findMany({
        where: { isActive: true },
        orderBy: { lastUsedAt: 'desc' },
        take: 1,
        select: { id: true, name: true, keyPrefix: true, role: true, lastUsedAt: true },
      }).catch(() => []),
      db.executionEvent.findFirst({
        where: { status: 'failed' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, type: true, summary: true, errorCode: true, createdAt: true },
      }).catch(() => null),
      db.executionEvent.findFirst({
        where: { status: 'success', type: { contains: 'model' } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, type: true, summary: true, createdAt: true },
      }).catch(() => null),
    ])

    const gatewayUrl = getOpenClawGatewayUrl()
    const gatewayConfigured = isOpenClawGatewayConfigured()
    const tokenConfigured = Boolean(getOpenClawGatewayToken())
    const gateway = bridgeCheck.gateway
    const appOk = dbCheck.ok && hasSupabasePublicConfig()
    const bridgeOk = bridgeCheck.ok
    const gatewayOk = Boolean(gateway?.connected) || (bridgeOk && gatewayConfigured)
    const overall = appOk && bridgeOk && gatewayOk ? 'ok' : dbCheck.ok ? 'degraded' : 'fail'

    return NextResponse.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        overall,
        app: {
          db: dbCheck,
          supabaseAuth: {
            ok: hasSupabasePublicConfig(),
            configured: hasSupabasePublicConfig(),
          },
        },
        openclaw: {
          bridge: {
            ok: bridgeOk,
            status: bridgeCheck.status,
            latencyMs: bridgeCheck.latencyMs,
            url: process.env.OPENCLAW_BRIDGE_URL ? '[configured]' : DEFAULT_OPENCLAW_BRIDGE_URL,
            error: bridgeCheck.error,
          },
          gateway: {
            ok: gatewayOk,
            configured: gatewayConfigured,
            tokenConfigured,
            url: gateway?.gatewayUrl || gatewayUrl || DEFAULT_GATEWAY_URL,
            healthUrl: gateway?.healthUrl || `${DEFAULT_GATEWAY_URL}/health`,
            latencyMs: gateway?.latencyMs || 0,
            status: gateway?.status || 'unknown',
            error: gateway?.error,
          },
          model: {
            ok: Boolean(lastSuccess),
            model: process.env.OPENCLAW_AGENT_MODEL || process.env.OPENCLAW_MODEL || DEFAULT_OPENCLAW_AGENT_MODEL,
            lastSuccessfulProbeAt: lastSuccess?.createdAt ?? null,
          },
        },
        bot: {
          tokenConfigured: botKeys.length > 0,
          activeKeySeen: botKeys.length > 0,
          lastAction: botKeys[0]
            ? {
                at: botKeys[0].lastUsedAt,
                name: botKeys[0].name,
                keyPrefix: botKeys[0].keyPrefix,
                role: botKeys[0].role,
              }
            : null,
        },
        ops: {
          lastError,
          lastSuccessfulModelProbe: lastSuccess,
        },
      },
    })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { success: false, error: sanitizeError(error) },
      { status: 500 },
    )
  }
}
