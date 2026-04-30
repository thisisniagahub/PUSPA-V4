import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestIp, writeAuditLog } from '@/lib/audit'
import { maskIc } from '@/lib/bot-api-utils'
import { requireBotAuth, botAuthErrorResponse } from '@/lib/bot-middleware'

const ecossRpaSchema = z.object({
  icNumber: z.string().min(4).max(24),
  memberName: z.string().max(160).optional(),
  actionType: z.string().min(1).max(80),
  details: z.record(z.string(), z.unknown()).optional().default({}),
})

export async function POST(req: NextRequest) {
  let bot

  try {
    bot = await requireBotAuth(req, 'ops')
  } catch (error) {
    return botAuthErrorResponse(error)
  }

  try {
    const parsed = ecossRpaSchema.parse(await req.json())

    await writeAuditLog({
      action: 'bot.ecoss_rpa.blocked',
      entity: 'ExternalRpa',
      ipAddress: getRequestIp(req),
      details: {
        botId: bot.id,
        botName: bot.name,
        actionType: parsed.actionType,
        icMasked: maskIc(parsed.icNumber),
        reason: 'approval_required',
      },
    })

    return NextResponse.json(
      {
        success: false,
        error: 'eCOSS RPA execution requires Bo/admin approval and is currently disabled',
        data: {
          status: 'blocked',
          icMasked: maskIc(parsed.icNumber),
          actionType: parsed.actionType,
          requiredFlow: 'preview -> Bo/admin approval -> execute with audit log',
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

    console.error('[BOT_ECOSS_RPA]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process eCOSS RPA request' },
      { status: 500 },
    )
  }
}
