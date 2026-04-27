import { db } from '@/lib/db'
import type { HermesToolDefinition } from './types'

// ============================================================
// Tool: query_stats
// ============================================================
const queryStatsTool: HermesToolDefinition = {
  name: 'query_stats',
  description: 'Query aggregate statistics from PUSPA database. Returns counts and totals for modules like members, cases, donations, donors, volunteers, programmes.',
  parameters: {
    module: {
      type: 'string',
      description: 'Which module to query: members, cases, donations, donors, volunteers, programmes, disbursements, compliance',
      required: true,
      enum: ['members', 'cases', 'donations', 'donors', 'volunteers', 'programmes', 'disbursements', 'compliance'],
    },
  },
  handler: async (args) => {
    const mod = args.module as string
    switch (mod) {
      case 'members': {
        const [total, active, inactive] = await Promise.all([
          db.member.count(),
          db.member.count({ where: { status: 'active' } }),
          db.member.count({ where: { status: { not: 'active' } } }),
        ])
        const incomeAgg = await db.member.aggregate({ _avg: { monthlyIncome: true }, _sum: { householdSize: true } })
        return { total, active, inactive, avgIncome: Math.round(incomeAgg._avg.monthlyIncome || 0), totalHousehold: incomeAgg._sum.householdSize || 0 }
      }
      case 'cases': {
        const [total, pending, approved, closed, rejected] = await Promise.all([
          db.case.count(),
          db.case.count({ where: { status: { in: ['draft', 'submitted', 'verifying', 'verified', 'scoring', 'scored'] } } }),
          db.case.count({ where: { status: 'approved' } }),
          db.case.count({ where: { status: 'closed' } }),
          db.case.count({ where: { status: 'rejected' } }),
        ])
        const amountAgg = await db.case.aggregate({ _sum: { amount: true } })
        return { total, pending, approved, closed, rejected, totalAmount: amountAgg._sum.amount || 0 }
      }
      case 'donations': {
        const [total, confirmed, pending] = await Promise.all([
          db.donation.count(),
          db.donation.count({ where: { status: 'confirmed' } }),
          db.donation.count({ where: { status: 'pending' } }),
        ])
        const amountAgg = await db.donation.aggregate({ _sum: { amount: true }, where: { status: 'confirmed' } })
        const byFundType = await db.donation.groupBy({ by: ['fundType'], _sum: { amount: true }, _count: true, where: { status: 'confirmed' } })
        return { total, confirmed, pending, totalAmount: amountAgg._sum.amount || 0, byFundType: byFundType.map(f => ({ type: f.fundType, amount: f._sum.amount || 0, count: f._count })) }
      }
      case 'donors': {
        const [total, active] = await Promise.all([
          db.donor.count(),
          db.donor.count({ where: { status: 'active' } }),
        ])
        const bySegment = await db.donor.groupBy({ by: ['segment'], _count: true })
        return { total, active, bySegment: bySegment.map(s => ({ segment: s.segment, count: s._count })) }
      }
      case 'volunteers': {
        const [total, active] = await Promise.all([
          db.volunteer.count(),
          db.volunteer.count({ where: { status: 'active' } }),
        ])
        const hoursAgg = await db.volunteer.aggregate({ _sum: { totalHours: true } })
        return { total, active, totalHours: hoursAgg._sum.totalHours || 0 }
      }
      case 'programmes': {
        const [total, active] = await Promise.all([
          db.programme.count(),
          db.programme.count({ where: { status: 'active' } }),
        ])
        const budgetAgg = await db.programme.aggregate({ _sum: { budget: true, totalSpent: true } })
        return { total, active, totalBudget: budgetAgg._sum.budget || 0, totalSpent: budgetAgg._sum.totalSpent || 0 }
      }
      case 'disbursements': {
        const [total, pending, completed] = await Promise.all([
          db.disbursement.count(),
          db.disbursement.count({ where: { status: 'pending' } }),
          db.disbursement.count({ where: { status: 'completed' } }),
        ])
        const amountAgg = await db.disbursement.aggregate({ _sum: { amount: true } })
        return { total, pending, completed, totalAmount: amountAgg._sum.amount || 0 }
      }
      case 'compliance': {
        const [total, completed, pending] = await Promise.all([
          db.complianceChecklist.count(),
          db.complianceChecklist.count({ where: { isCompleted: true } }),
          db.complianceChecklist.count({ where: { isCompleted: false } }),
        ])
        return { total, completed, pending, score: total > 0 ? Math.round((completed / total) * 100) : 0 }
      }
      default:
        return { error: `Unknown module: ${mod}` }
    }
  },
}

// ============================================================
// Tool: search_members
// ============================================================
const searchMembersTool: HermesToolDefinition = {
  name: 'search_members',
  description: 'Search PUSPA members (asnaf) by name, IC number, or status. Returns matching member profiles.',
  parameters: {
    query: { type: 'string', description: 'Search term (name or IC number)', required: true },
    status: { type: 'string', description: 'Filter by status: active, inactive', required: false },
  },
  handler: async (args) => {
    const query = args.query as string
    const status = args.status as string | undefined
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { ic: { contains: query } },
        { memberNumber: { contains: query } },
      ]
    }
    const members = await db.member.findMany({
      where,
      take: 10,
      select: { id: true, memberNumber: true, name: true, ic: true, phone: true, city: true, state: true, monthlyIncome: true, householdSize: true, status: true },
    })
    return { count: members.length, members }
  },
}

// ============================================================
// Tool: search_cases
// ============================================================
const searchCasesTool: HermesToolDefinition = {
  name: 'search_cases',
  description: 'Search PUSPA cases by status, priority, category, or case number. Returns matching cases.',
  parameters: {
    status: { type: 'string', description: 'Filter by status: draft, submitted, verifying, verified, scoring, scored, approved, disbursing, disbursed, follow_up, closed, rejected', required: false },
    priority: { type: 'string', description: 'Filter by priority: urgent, high, normal, low', required: false },
    category: { type: 'string', description: 'Filter by category: zakat, sedekah, wakaf, infak, government_aid', required: false },
  },
  handler: async (args) => {
    const where: Record<string, unknown> = {}
    if (args.status) where.status = args.status
    if (args.priority) where.priority = args.priority
    if (args.category) where.category = args.category
    const cases = await db.case.findMany({
      where,
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, caseNumber: true, title: true, status: true, priority: true, category: true, amount: true, applicantName: true, createdAt: true },
    })
    return { count: cases.length, cases }
  },
}

// ============================================================
// Tool: get_donations_summary
// ============================================================
const getDonationsSummaryTool: HermesToolDefinition = {
  name: 'get_donations_summary',
  description: 'Get donation summary with totals by fund type and recent donations. Useful for financial overview.',
  parameters: {
    period: { type: 'string', description: 'Time period: this_month, this_year, all_time', required: false },
  },
  handler: async (args) => {
    const period = (args.period as string) || 'all_time'
    const now = new Date()
    let dateFilter: Date | undefined

    if (period === 'this_month') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === 'this_year') {
      dateFilter = new Date(now.getFullYear(), 0, 1)
    }

    const where = { status: 'confirmed', ...(dateFilter ? { donatedAt: { gte: dateFilter } } : {}) }

    const [totalAmount, totalCount] = await Promise.all([
      db.donation.aggregate({ _sum: { amount: true }, where }),
      db.donation.count({ where }),
    ])

    const byFundType = await db.donation.groupBy({
      by: ['fundType'],
      _sum: { amount: true },
      _count: true,
      where,
    })

    const recentDonations = await db.donation.findMany({
      where,
      orderBy: { donatedAt: 'desc' },
      take: 5,
      select: { donationNumber: true, donorName: true, amount: true, fundType: true, donatedAt: true, isAnonymous: true },
    })

    return {
      totalAmount: totalAmount._sum.amount || 0,
      totalCount,
      byFundType: byFundType.map(f => ({ type: f.fundType, amount: f._sum.amount || 0, count: f._count })),
      recentDonations: recentDonations.map(d => ({
        ...d,
        donorName: d.isAnonymous ? 'Tanpa Nama' : d.donorName,
      })),
    }
  },
}

// ============================================================
// Tool: list_programmes
// ============================================================
const listProgrammesTool: HermesToolDefinition = {
  name: 'list_programmes',
  description: 'List PUSPA programmes with their status, budget, and beneficiary counts.',
  parameters: {
    status: { type: 'string', description: 'Filter by status: active, planned, completed, suspended', required: false },
  },
  handler: async (args) => {
    const where: Record<string, unknown> = {}
    if (args.status) where.status = args.status
    const programmes = await db.programme.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, category: true, status: true, budget: true, totalSpent: true, targetBeneficiaries: true, actualBeneficiaries: true, location: true },
    })
    return { count: programmes.length, programmes }
  },
}

// ============================================================
// Tool: compliance_status
// ============================================================
const complianceStatusTool: HermesToolDefinition = {
  name: 'compliance_status',
  description: 'Get compliance checklist progress with category breakdown and pending items.',
  parameters: {},
  handler: async () => {
    const [total, completed] = await Promise.all([
      db.complianceChecklist.count(),
      db.complianceChecklist.count({ where: { isCompleted: true } }),
    ])
    const byCategory = await db.complianceChecklist.groupBy({
      by: ['category'],
      _count: true,
      _sum: { isCompleted: true },
    })
    const pendingItems = await db.complianceChecklist.findMany({
      where: { isCompleted: false },
      take: 10,
      select: { id: true, category: true, item: true, description: true },
    })
    return {
      total,
      completed,
      pending: total - completed,
      score: total > 0 ? Math.round((completed / total) * 100) : 0,
      byCategory,
      pendingItems,
    }
  },
}

// ============================================================
// Tool: explain_module
// ============================================================
const explainModuleTool: HermesToolDefinition = {
  name: 'explain_module',
  description: 'Get a description of what a PUSPA module does and how to use it.',
  parameters: {
    module: { type: 'string', description: 'The module/view ID to explain', required: true },
  },
  handler: async (args) => {
    const { getModuleDescription } = await import('./module-descriptions')
    return getModuleDescription(args.module as string)
  },
}

// ============================================================
// Tool Registry
// ============================================================
export const hermesTools: HermesToolDefinition[] = [
  queryStatsTool,
  searchMembersTool,
  searchCasesTool,
  getDonationsSummaryTool,
  listProgrammesTool,
  complianceStatusTool,
  explainModuleTool,
]

export async function executeToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  const tool = hermesTools.find(t => t.name === toolName)
  if (!tool) {
    return { error: `Unknown tool: ${toolName}` }
  }
  try {
    return await tool.handler(args)
  } catch (error: any) {
    console.error(`Hermes tool error [${toolName}]:`, error)
    return { error: error?.message || 'Tool execution failed' }
  }
}

// Build tool descriptions for the system prompt
export function getToolDescriptions(): string {
  return hermesTools.map(t => {
    const params = Object.entries(t.parameters)
      .map(([name, p]) => `  - ${name} (${p.type}${p.required ? ', required' : ''}): ${p.description}`)
      .join('\n')
    return `**${t.name}**: ${t.description}\nParameters:\n${params}`
  }).join('\n\n')
}
