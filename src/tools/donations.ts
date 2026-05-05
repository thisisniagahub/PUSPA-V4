// FILE: /home/kali/PUSPA-V4-NEW/src/tools/donations.ts
// Real domain tool: Donation queries for Hermes AI

import { z } from 'zod'
import { db } from '@/lib/db'

/**
 * Get recent donations with optional limit
 * Donor info is stored as flat fields (donorName, donorIC, etc.)
 * Masks sensitive info (IC, phone, email)
 */
export async function getRecentDonations(limit: number = 10) {
  try {
    const donations = await db.donation.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        donationNumber: true,
        amount: true,
        fundType: true, // FIXED: was 'category'
        method: true, // FIXED: was 'paymentMethod'
        status: true,
        createdAt: true,
        donorName: true,
        donorIC: true, // Mask this
        donorPhone: true, // Mask this
        donorEmail: true, // Mask this
      },
    })

    // Mask sensitive data
    return donations.map((d) => ({
      id: d.id,
      donationNumber: d.donationNumber,
      amount: d.amount,
      fundType: d.fundType,
      method: d.method,
      status: d.status,
      createdAt: d.createdAt,
      donor: {
        name: d.donorName,
        ic: maskIC(d.donorIC),
        phone: maskPhone(d.donorPhone),
        email: maskEmail(d.donorEmail),
      },
    }))
  } catch (error) {
    console.error('[Tool: getRecentDonations] Error:', error)
    return []
  }
}

/**
 * Get donation statistics for current month
 * Returns totals grouped by fundType
 */
export async function getDonationStats() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get all donations for current month
    const donations = await db.donation.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        amount: true,
        fundType: true, // FIXED: was 'category'
        status: true,
      },
    })

    // Group by fundType
    const stats: Record<string, { count: number; total: number; completed: number }> = {}

    for (const d of donations) {
      const cat = d.fundType || 'uncategorized'
      if (!stats[cat]) {
        stats[cat] = { count: 0, total: 0, completed: 0 }
      }
      stats[cat].count++
      stats[cat].total += d.amount
      if (d.status === 'completed') {
        stats[cat].completed++
      }
    }

    // Calculate totals
    const totalAmount = Object.values(stats).reduce((sum, s) => sum + s.total, 0)
    const totalCount = Object.values(stats).reduce((sum, s) => sum + s.count, 0)

    return {
      month: now.toLocaleString('ms-MY', { month: 'long', year: 'numeric' }),
      totalAmount,
      totalCount,
      byFundType: stats, // FIXED: was 'byCategory'
    }
  } catch (error) {
    console.error('[Tool: getDonationStats] Error:', error)
    return {
      month: '',
      totalAmount: 0,
      totalCount: 0,
      byFundType: {},
    }
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

function maskEmail(email: string | null): string {
  if (!email) return 'N/A'
  const [local, domain] = email.split('@')
  if (!domain) return email
  const maskedLocal = local.length <= 2 ? local : local.slice(0, 2) + '***'
  return `${maskedLocal}@${domain}`
}

// ============================================================
// Tool Definitions (for Vercel AI SDK)
// ============================================================

export const getRecentDonationsTool = {
  description: 'Get recent donations (default: 10). Donor info is masked. Uses flat fields (donorName, donorIC, etc.).',
  parameters: z.object({
    limit: z.number().optional().describe('Number of recent donations to fetch (default: 10)'),
  }),
  execute: async (args: { limit?: number }) => {
    return await getRecentDonations(args.limit || 10)
  },
}

export const getDonationStatsTool = {
  description: 'Get donation statistics for current month, grouped by fundType (zakat, sadaqah, etc.).',
  parameters: z.object({}),
  execute: async () => {
    return await getDonationStats()
  },
}
