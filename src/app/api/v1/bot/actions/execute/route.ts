import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestIp, writeAuditLog } from '@/lib/audit'
import { botActionExecuteSchema } from '@/lib/bot-actions'
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
    const parsed = botActionExecuteSchema.parse(body)

    await writeAuditLog({
      action: 'bot_action_execute_blocked',
      entity: 'BotAction',
      entityId: parsed.approvedActionId,
      ipAddress: getRequestIp(request),
      details: {
        botId: bot.id,
        botName: bot.name,
        actionType: parsed.actionType,
        reason: 'approval_storage_not_implemented',
      },
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Bot action execution is not enabled yet',
        data: {
          approvedActionId: parsed.approvedActionId,
          actionType: parsed.actionType,
          status: 'blocked',
          reason: 'Persistent approval storage is required before execution can mutate data.',
          requiredFlow: 'preview -> Bo/admin approval -> persisted approval record -> execute',
        },
      },
      { status: 501 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 },
      )
    }

    console.error('[BOT_ACTION_EXECUTE]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process bot action execution request' },
      { status: 500 },
    )
  }
}
