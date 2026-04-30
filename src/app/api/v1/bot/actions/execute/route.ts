import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestIp, writeAuditLog } from '@/lib/audit'
import { botActionExecuteSchema, safelyExecuteApprovedBotAction } from '@/lib/bot-actions'
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
    const execution = await safelyExecuteApprovedBotAction(parsed, bot)

    await writeAuditLog({
      action: execution.ok ? 'bot_action_execute_completed' : 'bot_action_execute_rejected',
      entity: 'BotAction',
      entityId: parsed.approvedActionId,
      ipAddress: getRequestIp(request),
      details: {
        botId: bot.id,
        botName: bot.name,
        actionType: parsed.actionType,
        resultStatus: execution.body.data?.status,
        mutationStatus: execution.ok ? execution.body.data?.mutationStatus : undefined,
      },
    })

    return NextResponse.json(execution.body, { status: execution.statusCode })
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
