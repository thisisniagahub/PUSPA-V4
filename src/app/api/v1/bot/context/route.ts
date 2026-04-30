import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_OPENCLAW_AGENT_MODEL } from '@/lib/openclaw'
import { requireBotAuth, botAuthErrorResponse } from '@/lib/bot-middleware'

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value || '10', 10)
  if (Number.isNaN(parsed)) return 10
  return Math.min(Math.max(parsed, 1), 25)
}

export async function GET(request: NextRequest) {
  let bot

  try {
    bot = await requireBotAuth(request, 'ops')
  } catch (error) {
    return botAuthErrorResponse(error)
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseLimit(searchParams.get('limit'))

    const [workItemsByStatus, domainSummary, recentWorkItems, recentEvents, upcomingAutomations] = await Promise.all([
      db.workItem.groupBy({ by: ['status'], _count: { status: true } }),
      db.workItem.groupBy({
        by: ['domain'],
        _count: { domain: true },
        orderBy: { _count: { domain: 'desc' } },
      }),
      db.workItem.findMany({
        where: { status: { in: ['queued', 'in_progress', 'waiting_user', 'scheduled', 'blocked', 'failed'] } },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          workItemNumber: true,
          title: true,
          project: true,
          domain: true,
          sourceChannel: true,
          intent: true,
          status: true,
          priority: true,
          currentStep: true,
          nextAction: true,
          blockerReason: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.executionEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          workItemId: true,
          type: true,
          summary: true,
          toolName: true,
          status: true,
          latencyMs: true,
          errorCode: true,
          createdAt: true,
          workItem: {
            select: { id: true, workItemNumber: true, title: true, status: true },
          },
        },
      }),
      db.automationJob.findMany({
        where: { isEnabled: true, nextRunAt: { gte: new Date() } },
        orderBy: { nextRunAt: 'asc' },
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          kind: true,
          domain: true,
          relatedProject: true,
          workItemId: true,
          lastRunAt: true,
          nextRunAt: true,
          lastResult: true,
          failureState: true,
        },
      }),
    ])

    const byStatus = Object.fromEntries(workItemsByStatus.map((item) => [item.status, item._count.status]))
    const byDomain = Object.fromEntries(domainSummary.map((item) => [item.domain, item._count.domain]))

    return NextResponse.json({
      success: true,
      data: {
        app: {
          name: 'PUSPA-V4',
          model: DEFAULT_OPENCLAW_AGENT_MODEL,
          sourceOfTruth: 'PUSPA-V4 active repo',
          botWorkspace: 'PuspaCareBot runtime knowledge workspace',
        },
        bot: {
          id: bot.id,
          name: bot.name,
          role: bot.role,
          permissions: bot.permissions,
        },
        allowedReadOnlyEndpoints: [
          '/api/v1/bot/health',
          '/api/v1/bot/context',
          '/api/v1/bot/dashboard',
          '/api/v1/bot/cases',
          '/api/v1/bot/members',
          '/api/v1/bot/donations',
          '/api/v1/bot/ekyc',
        ],
        mutationPolicy: 'preview-only until Bo/admin approval and persisted approval storage are implemented',
        ops: {
          workItems: {
            byStatus,
            activeTotal: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
            recent: recentWorkItems,
          },
          domainSummary: byDomain,
          recentEvents,
          upcomingAutomations,
        },
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[BOT_CONTEXT]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bot context' },
      { status: 500 },
    )
  }
}
