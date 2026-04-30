import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireBotAuth, botAuthErrorResponse } from '@/lib/bot-middleware'

export async function GET(request: NextRequest) {
  let bot

  try {
    bot = await requireBotAuth(request)
  } catch (error) {
    return botAuthErrorResponse(error)
  }

  const startedAt = Date.now()

  try {
    await db.$queryRaw`SELECT 1`

    return NextResponse.json({
      success: true,
      data: {
        service: 'puspa-v4',
        app: 'ok',
        db: 'ok',
        authenticated: true,
        botApiTokenConfigured: true,
        bot: {
          id: bot.id,
          name: bot.name,
          role: bot.role,
          permissions: bot.permissions,
        },
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[BOT_HEALTH]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Bot API health check failed',
        data: {
          service: 'puspa-v4',
          app: 'degraded',
          db: 'fail',
          authenticated: true,
          botApiTokenConfigured: true,
          latencyMs: Date.now() - startedAt,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 503 },
    )
  }
}
