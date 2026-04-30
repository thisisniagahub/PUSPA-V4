import { PrismaClient } from '@prisma/client'

const baseUrl = (process.env.PUSPACARE_APP_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const token = process.env.PUSPACARE_BOT_API_KEY
const approveInDb = process.env.PUSPACARE_BOT_APPROVE_IN_DB === 'true'

if (!token) {
  console.error('PUSPACARE_BOT_API_KEY is required')
  process.exit(1)
}

type JsonRecord = Record<string, unknown>

async function postJson(endpoint: string, body: JsonRecord) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)
  return { status: response.status, payload }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

const previewRequest = {
  actionType: 'create_case',
  targetEntity: 'Case',
  reason: 'Local smoke test for persistent bot approval flow',
  requestedBy: 'local-smoke',
  payload: {
    title: 'Local approval smoke test',
    token: 'must-be-redacted',
  },
}

async function main() {
  const preview = await postJson('/api/v1/bot/actions/preview', previewRequest)
  console.log(JSON.stringify({ step: 'preview', status: preview.status, success: Boolean(preview.payload?.success) }))
  assert(preview.status === 200, `preview expected 200, got ${preview.status}`)
  assert(preview.payload?.success === true, 'preview success expected true')
  assert(typeof preview.payload?.data?.approvedActionId === 'string', 'preview must return persisted approvedActionId')
  assert(preview.payload?.data?.status === 'waiting_user', 'preview status must be waiting_user')
  assert(preview.payload?.data?.payloadSummary?.token === '[REDACTED]', 'preview must redact sensitive payload')

  const approvedActionId = preview.payload.data.approvedActionId as string

  const blocked = await postJson('/api/v1/bot/actions/execute', {
    approvedActionId,
    actionType: 'create_case',
    approvalNote: 'should not execute before admin approval',
  })
  console.log(JSON.stringify({ step: 'execute_before_approval', status: blocked.status, success: Boolean(blocked.payload?.success), reason: blocked.payload?.data?.reason }))
  assert(blocked.status === 409, `execute before approval expected 409, got ${blocked.status}`)
  assert(blocked.payload?.data?.status === 'waiting_user', 'blocked execute must report waiting_user')

  if (approveInDb) {
    const db = new PrismaClient()
    try {
      await db.$transaction([
        db.executionEvent.create({
          data: {
            workItemId: approvedActionId,
            type: 'approval_approved',
            summary: 'Local smoke approval granted',
            detail: JSON.stringify({ decision: 'approve', comment: 'local smoke test' }),
            status: 'success',
          },
        }),
        db.workItem.update({
          where: { id: approvedActionId },
          data: { status: 'in_progress', nextAction: 'Approved for bot execution', startedAt: new Date() },
        }),
      ])
    } finally {
      await db.$disconnect()
    }

    const executed = await postJson('/api/v1/bot/actions/execute', {
      approvedActionId,
      actionType: 'create_case',
      approvalNote: 'local smoke approved execution',
    })
    console.log(JSON.stringify({ step: 'execute_after_approval', status: executed.status, success: Boolean(executed.payload?.success), executionStatus: executed.payload?.data?.status }))
    assert(executed.status === 200, `execute after approval expected 200, got ${executed.status}`)
    assert(executed.payload?.data?.status === 'completed', 'approved execute must complete work item safely')

    const repeated = await postJson('/api/v1/bot/actions/execute', {
      approvedActionId,
      actionType: 'create_case',
      approvalNote: 'local smoke duplicate execution attempt',
    })
    console.log(JSON.stringify({ step: 'execute_duplicate', status: repeated.status, success: Boolean(repeated.payload?.success), reason: repeated.payload?.data?.reason }))
    assert(repeated.status === 409, `duplicate execute expected 409, got ${repeated.status}`)
    assert(repeated.payload?.data?.reason === 'already_executed', 'duplicate execute must be idempotently blocked')
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
