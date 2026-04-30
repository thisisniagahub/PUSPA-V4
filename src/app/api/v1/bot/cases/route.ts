import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination } from '@/lib/bot-api-utils'
import { requireBotAuth, botAuthErrorResponse } from '@/lib/bot-middleware'

function summarizeText(value?: string | null) {
  if (!value) return null
  return value.length > 180 ? `${value.slice(0, 177)}...` : value
}

export async function GET(request: NextRequest) {
  try {
    await requireBotAuth(request, 'cases')
  } catch (error) {
    return botAuthErrorResponse(error)
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const { limit, offset } = parsePagination(searchParams)

    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority

    const [cases, total] = await Promise.all([
      db.case.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          member: {
            select: { id: true, name: true, memberNumber: true },
          },
          assignee: {
            select: { id: true, name: true },
          },
        },
      }),
      db.case.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        cases: cases.map((caseItem) => ({
          id: caseItem.id,
          title: caseItem.title,
          summary: summarizeText(caseItem.description),
          status: caseItem.status,
          priority: caseItem.priority,
          category: caseItem.category,
          member: caseItem.member,
          assignee: caseItem.assignee,
          createdAt: caseItem.createdAt,
          updatedAt: caseItem.updatedAt,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + cases.length < total,
        },
      },
    })
  } catch (error) {
    console.error('[BOT_CASES]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}
