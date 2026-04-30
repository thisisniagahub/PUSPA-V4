import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestIp, writeAuditLog } from '@/lib/audit'
import { botActionPreviewSchema, createBotActionApproval } from '@/lib/bot-actions'
import { requireBotAuth, botAuthErrorResponse } from '@/lib/bot-middleware'

export async function POST(request: NextRequest) {
  let bot

  try {
    bot = await requireBotAuth(request, 'ops')
  } catch (error) {
    return botAuthErrorResponse(error)
  }

  try {
    const body = await request.json()
    const parsed = botActionPreviewSchema.parse(body)
    const preview = await createBotActionApproval(parsed, bot)

    await writeAuditLog({
      action: 'bot_action_preview',
      entity: 'BotAction',
      entityId: preview.actionId,
      ipAddress: getRequestIp(request),
      details: {
        botId: bot.id,
        botName: bot.name,
        actionType: preview.actionType,
        targetEntity: preview.targetEntity,
        targetEntityId: preview.targetEntityId,
        risk: preview.risk,
        executable: preview.executable,
      },
    })

    return NextResponse.json({ success: true, data: preview })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 },
      )
    }

    console.error('[BOT_ACTION_PREVIEW]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to preview bot action' },
      { status: 500 },
    )
  }
}
