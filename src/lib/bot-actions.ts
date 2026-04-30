import { z } from 'zod'
import { db } from '@/lib/db'
import { createWithGeneratedUniqueValue } from '@/lib/sequence'
import type { BotContext } from '@/lib/bot-middleware'

export const botActionTypeSchema = z.enum([
  'approve_ekyc',
  'update_member',
  'create_case',
  'delete_case',
  'mark_donation_reconciled',
  'send_message',
  'deploy_production',
])

export type BotActionType = z.infer<typeof botActionTypeSchema>

export const botActionRisk: Record<BotActionType, 'medium' | 'high' | 'critical'> = {
  approve_ekyc: 'high',
  update_member: 'high',
  create_case: 'medium',
  delete_case: 'critical',
  mark_donation_reconciled: 'high',
  send_message: 'high',
  deploy_production: 'critical',
}

export const botActionLabels: Record<BotActionType, string> = {
  approve_ekyc: 'Approve eKYC verification',
  update_member: 'Update member profile',
  create_case: 'Create case record',
  delete_case: 'Delete case record',
  mark_donation_reconciled: 'Mark donation as reconciled',
  send_message: 'Send outbound message',
  deploy_production: 'Deploy production application',
}

export const botActionPreviewSchema = z.object({
  actionType: botActionTypeSchema,
  targetEntity: z.string().min(1).max(80),
  targetEntityId: z.string().min(1).max(160).optional(),
  reason: z.string().min(1).max(1000),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
  requestedBy: z.string().min(1).max(120).optional(),
})

export const botActionExecuteSchema = z.object({
  approvedActionId: z.string().min(1).max(160),
  actionType: botActionTypeSchema,
  approvalNote: z.string().max(1000).optional(),
})

const SENSITIVE_KEY_PATTERN = /(password|secret|token|key|authorization|cookie|jwt|database|connection|string|url)/i

function sanitizeValue(key: string, value: unknown, depth = 0): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) return '[REDACTED]'
  if (depth > 4) return '[MAX_DEPTH]'
  if (typeof value === 'string') return value.length > 240 ? `${value.slice(0, 237)}...` : value
  if (Array.isArray(value)) return value.slice(0, 25).map((item) => sanitizeValue(key, item, depth + 1))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 50)
        .map(([nestedKey, nestedValue]) => [nestedKey, sanitizeValue(nestedKey, nestedValue, depth + 1)]),
    )
  }
  return value
}

export function sanitizeBotActionPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload)
      .slice(0, 50)
      .map(([key, value]) => [key, sanitizeValue(key, value)]),
  )
}

export type BotActionPreviewInput = z.infer<typeof botActionPreviewSchema>
export type BotActionExecuteInput = z.infer<typeof botActionExecuteSchema>

function buildPreviewResponse(input: BotActionPreviewInput, approvalRecord?: { id: string; status: string; workItemNumber: string }) {
  const risk = botActionRisk[input.actionType]
  const sanitizedPayload = sanitizeBotActionPayload(input.payload)

  return {
    actionId: approvalRecord?.id ?? `preview_${Date.now()}`,
    approvedActionId: approvalRecord?.id ?? null,
    approvalNumber: approvalRecord?.workItemNumber ?? null,
    actionType: input.actionType,
    label: botActionLabels[input.actionType],
    targetEntity: input.targetEntity,
    targetEntityId: input.targetEntityId ?? null,
    requestedBy: input.requestedBy ?? 'PuspaCareBot',
    reason: input.reason,
    risk,
    status: approvalRecord?.status ?? 'preview_only',
    requiresApproval: true,
    executable: false,
    approvalFlow: 'preview -> Bo/admin approval -> execute with persisted approval record',
    payloadSummary: sanitizedPayload,
    warnings: [
      'Preview endpoint does not mutate production data.',
      'Execute endpoint only runs after a persisted Bo/admin approval record is approved.',
      'Current safe executor records completion/audit status only; domain-specific mutations remain disabled until explicit executors are implemented.',
    ],
    generatedAt: new Date().toISOString(),
  }
}

export function buildBotActionPreview(input: BotActionPreviewInput) {
  return buildPreviewResponse(input)
}

async function generateBotActionWorkItemNumber() {
  let nextNum = 1
  const lastWorkItem = await db.workItem.findFirst({
    where: { workItemNumber: { startsWith: 'BA-' } },
    orderBy: { workItemNumber: 'desc' },
    select: { workItemNumber: true },
  })

  const match = lastWorkItem?.workItemNumber.match(/BA-(\d+)/)
  if (match) nextNum = parseInt(match[1], 10) + 1

  return `BA-${String(nextNum).padStart(5, '0')}`
}

function priorityForRisk(risk: 'medium' | 'high' | 'critical') {
  if (risk === 'critical') return 'urgent'
  if (risk === 'high') return 'high'
  return 'normal'
}

export async function createBotActionApproval(input: BotActionPreviewInput, bot: BotContext) {
  const preview = buildPreviewResponse(input)
  const risk = botActionRisk[input.actionType]

  const workItem = await createWithGeneratedUniqueValue({
    generateValue: generateBotActionWorkItemNumber,
    uniqueFields: ['workItemNumber'],
    create: (workItemNumber) => db.workItem.create({
      data: {
        workItemNumber,
        title: `${botActionLabels[input.actionType]} (${input.targetEntity})`,
        project: 'PUSPA',
        domain: 'bot-actions',
        sourceChannel: 'puspacarebot',
        requestText: input.reason,
        intent: input.actionType,
        status: 'waiting_user',
        priority: priorityForRisk(risk),
        currentStep: 'approval_requested',
        nextAction: `Bo/admin approval required for ${botActionLabels[input.actionType]}`,
        tags: JSON.stringify(['puspacarebot', 'approval-required', risk]),
        executionEvents: {
          create: {
            type: 'approval_requested',
            summary: `PuspaCareBot requested approval: ${botActionLabels[input.actionType]}`,
            detail: JSON.stringify({
              actionType: input.actionType,
              targetEntity: input.targetEntity,
              targetEntityId: input.targetEntityId ?? null,
              requestedBy: input.requestedBy ?? 'PuspaCareBot',
              botId: bot.id,
              botName: bot.name,
              risk,
              reason: input.reason,
              payloadSummary: preview.payloadSummary,
            }),
            toolName: 'puspacarebot.actions.preview',
            status: 'success',
          },
        },
      },
      include: { executionEvents: { orderBy: { createdAt: 'desc' }, take: 5 } },
    }),
  })

  return buildPreviewResponse(input, {
    id: workItem.id,
    status: workItem.status,
    workItemNumber: workItem.workItemNumber,
  })
}

export async function safelyExecuteApprovedBotAction(input: BotActionExecuteInput, bot: BotContext) {
  const workItem = await db.workItem.findUnique({
    where: { id: input.approvedActionId },
    include: { executionEvents: { orderBy: { createdAt: 'desc' } } },
  })

  if (!workItem || workItem.domain !== 'bot-actions') {
    return {
      ok: false as const,
      statusCode: 404,
      body: {
        success: false,
        error: 'Approved bot action was not found',
        data: { approvedActionId: input.approvedActionId, status: 'not_found' },
      },
    }
  }

  if (workItem.intent !== input.actionType) {
    return {
      ok: false as const,
      statusCode: 409,
      body: {
        success: false,
        error: 'Approved action type does not match requested execution type',
        data: {
          approvedActionId: input.approvedActionId,
          expectedActionType: workItem.intent,
          requestedActionType: input.actionType,
          status: workItem.status,
        },
      },
    }
  }

  const alreadyExecuted = workItem.executionEvents.some((event) => event.type === 'bot_action_execute_completed')
  if (alreadyExecuted) {
    return {
      ok: false as const,
      statusCode: 409,
      body: {
        success: false,
        error: 'Bot action has already been executed',
        data: {
          approvedActionId: input.approvedActionId,
          actionType: input.actionType,
          status: workItem.status,
          reason: 'already_executed',
        },
      },
    }
  }

  const hasApproval = workItem.executionEvents.some((event) => event.type === 'approval_approved')
  if (!hasApproval || workItem.status !== 'in_progress') {
    return {
      ok: false as const,
      statusCode: 409,
      body: {
        success: false,
        error: 'Bot action is waiting for Bo/admin approval',
        data: {
          approvedActionId: input.approvedActionId,
          actionType: input.actionType,
          status: workItem.status,
          reason: 'approval_required',
          requiredFlow: 'preview -> Bo/admin approval -> execute',
        },
      },
    }
  }

  await db.$transaction([
    db.executionEvent.create({
      data: {
        workItemId: workItem.id,
        type: 'bot_action_execute_completed',
        summary: `Safe bot action execution recorded: ${botActionLabels[input.actionType]}`,
        detail: JSON.stringify({
          actionType: input.actionType,
          approvalNote: input.approvalNote ?? null,
          botId: bot.id,
          botName: bot.name,
          mutationStatus: 'not_performed',
          reason: 'domain_specific_executor_not_enabled',
        }),
        toolName: 'puspacarebot.actions.execute',
        status: 'success',
      },
    }),
    db.workItem.update({
      where: { id: workItem.id },
      data: {
        status: 'completed',
        currentStep: 'safe_execution_recorded',
        nextAction: null,
        resolutionSummary: 'Approved bot action execution was recorded safely. Domain-specific data mutation was not performed.',
        completedAt: new Date(),
      },
    }),
  ])

  return {
    ok: true as const,
    statusCode: 200,
    body: {
      success: true,
      data: {
        approvedActionId: input.approvedActionId,
        actionType: input.actionType,
        status: 'completed',
        mutationStatus: 'not_performed',
        message: 'Approved bot action execution recorded safely; no domain data was mutated.',
      },
    },
  }
}
