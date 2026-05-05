// FILE: /home/kali/PUSPA-V4-NEW/src/tools/cases.ts
// Real domain tool: Case queries for Hermes AI (Simplified)

import { z } from 'zod'
import { db } from '@/lib/db'

/**
 * Get active cases with optional status filter
 */
export async function getActiveCases(status?: string) {
  try {
    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    } else {
      where.status = { in: ['pending', 'in_progress', 'under_review'] }
    }

    const cases = await db.case.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        member: true,
        assignee: true,
      },
    })

    return cases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      title: c.title,
      status: c.status,
      priority: c.priority,
      amount: c.amount,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      member: c.member ? {
        id: c.member.id,
        name: c.member.name,
        ic: maskIC(c.member.ic),
        location: [c.member.city, c.member.state].filter(Boolean).join(', ') || 'N/A',
        phone: maskPhone(c.member.phone),
      } : null,
      assignee: c.assignee ? {
        id: c.assignee.id,
        name: c.assignee.name,
      } : null,
    }))
  } catch (error) {
    console.error('[Tool: getActiveCases] Error:', error)
    return []
  }
}

/**
 * Get detailed case summary
 */
export async function getCaseSummary(caseId: string) {
  try {
    const caseData = await db.case.findUnique({
      where: { id: caseId },
      include: {
        member: true,
        caseNotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        caseDocuments: true,
      },
    })

    if (!caseData) {
      return { error: `Case with ID "${caseId}" not found.` }
    }

    return {
      id: caseData.id,
      caseNumber: caseData.caseNumber,
      title: caseData.title,
      description: caseData.description,
      status: caseData.status,
      priority: caseData.priority,
      amount: caseData.amount,
      createdAt: caseData.createdAt,
      updatedAt: caseData.updatedAt,
      member: caseData.member ? {
        id: caseData.member.id,
        name: caseData.member.name,
        ic: maskIC(caseData.member.ic),
        phone: maskPhone(caseData.member.phone),
        address: [caseData.member.address, caseData.member.city, caseData.member.state]
          .filter(Boolean)
          .join(', ') || 'N/A',
        householdSize: caseData.member.householdSize,
        monthlyIncome: caseData.member.monthlyIncome,
        maritalStatus: caseData.member.maritalStatus,
        occupation: caseData.member.occupation,
      } : null,
      recentNotes: caseData.caseNotes.map((note) => ({
        id: note.id,
        content: note.content,
        type: note.type,
        createdAt: note.createdAt,
        authorId: note.authorId,
      })),
      documentsCount: caseData.caseDocuments.length,
    }
  } catch (error) {
    console.error('[Tool: getCaseSummary] Error:', error)
    return { error: 'Failed to fetch case summary.' }
  }
}

// ============================================================
// Helper functions to mask sensitive data
// ============================================================

function maskIC(ic: string | null): string {
  if (!ic) return 'N/A'
  if (ic.length <= 3) return ic
  return '******' + ic.slice(-3)
}

function maskPhone(phone: string | null): string {
  if (!phone) return 'N/A'
  if (phone.length <= 3) return phone
  return '******' + phone.slice(-3)
}

// ============================================================
// Tool Definitions (for Vercel AI SDK)
// ============================================================

export const getActiveCasesTool = {
  description: 'Get active cases (pending/in-progress by default). Optionally filter by status.',
  parameters: z.object({
    status: z.string().optional().describe('Filter by case status (pending, in_progress, approved, rejected, etc.)'),
  }),
  execute: async (args: { status?: string }) => {
    return await getActiveCases(args.status)
  },
}

export const getCaseSummaryTool = {
  description: 'Get detailed summary of a specific case including member info and recent notes.',
  parameters: z.object({
    caseId: z.string().describe('The ID of the case to fetch'),
  }),
  execute: async (args: { caseId: string }) => {
    return await getCaseSummary(args.caseId)
  },
}
