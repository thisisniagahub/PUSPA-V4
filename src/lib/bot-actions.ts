import { z } from 'zod'

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

export function buildBotActionPreview(input: z.infer<typeof botActionPreviewSchema>) {
  const risk = botActionRisk[input.actionType]
  const sanitizedPayload = sanitizeBotActionPayload(input.payload)

  return {
    actionId: `preview_${Date.now()}`,
    actionType: input.actionType,
    label: botActionLabels[input.actionType],
    targetEntity: input.targetEntity,
    targetEntityId: input.targetEntityId ?? null,
    requestedBy: input.requestedBy ?? 'PuspaCareBot',
    reason: input.reason,
    risk,
    requiresApproval: true,
    executable: false,
    approvalFlow: 'preview -> Bo/admin approval -> execute with persisted approval record',
    payloadSummary: sanitizedPayload,
    warnings: [
      'Preview endpoint does not mutate production data.',
      'Execute endpoint remains disabled until persistent approval storage is implemented.',
      'Bo/admin approval is required before any write action.',
    ],
    generatedAt: new Date().toISOString(),
  }
}
