// ============================================================
// Hermes Agent — Safe ID Generation
// Generates sequential numbers from existing unique number columns
// and exposes retry helpers for callers that create records.
// ============================================================

import { db } from '@/lib/db'

type SupportedModel = 'member' | 'case' | 'donation' | 'disbursement' | 'volunteer' | 'donor'

type ModelConfig = {
  prefix: string
  idField: string
}

const MODEL_CONFIG: Record<SupportedModel, ModelConfig> = {
  member: { prefix: 'PUSPA', idField: 'memberNumber' },
  case: { prefix: 'KES', idField: 'caseNumber' },
  donation: { prefix: 'DON', idField: 'donationNumber' },
  disbursement: { prefix: 'DISB', idField: 'disbursementNumber' },
  volunteer: { prefix: 'VOL', idField: 'volunteerNumber' },
  donor: { prefix: 'DR', idField: 'donorNumber' },
}

function isSupportedModel(model: string): model is SupportedModel {
  return model in MODEL_CONFIG
}

function parseNextNumber(existingId: string | null | undefined): number {
  if (!existingId) return 1

  const lastPart = existingId.split('-').at(-1) ?? ''
  const numericPart = lastPart.match(/(\d+)/)?.[1]
  return numericPart ? Number.parseInt(numericPart, 10) + 1 : 1
}

async function findLatestId(model: SupportedModel, prefix: string): Promise<string | null> {
  const startsWith = `${prefix}-`

  switch (model) {
    case 'member': {
      const record = await db.member.findFirst({
        select: { memberNumber: true },
        where: { memberNumber: { startsWith } },
        orderBy: { memberNumber: 'desc' },
      })
      return record?.memberNumber ?? null
    }
    case 'case': {
      const record = await db.case.findFirst({
        select: { caseNumber: true },
        where: { caseNumber: { startsWith } },
        orderBy: { caseNumber: 'desc' },
      })
      return record?.caseNumber ?? null
    }
    case 'donation': {
      const record = await db.donation.findFirst({
        select: { donationNumber: true },
        where: { donationNumber: { startsWith } },
        orderBy: { donationNumber: 'desc' },
      })
      return record?.donationNumber ?? null
    }
    case 'disbursement': {
      const record = await db.disbursement.findFirst({
        select: { disbursementNumber: true },
        where: { disbursementNumber: { startsWith } },
        orderBy: { disbursementNumber: 'desc' },
      })
      return record?.disbursementNumber ?? null
    }
    case 'volunteer': {
      const record = await db.volunteer.findFirst({
        select: { volunteerNumber: true },
        where: { volunteerNumber: { startsWith } },
        orderBy: { volunteerNumber: 'desc' },
      })
      return record?.volunteerNumber ?? null
    }
    case 'donor': {
      const record = await db.donor.findFirst({
        select: { donorNumber: true },
        where: { donorNumber: { startsWith } },
        orderBy: { donorNumber: 'desc' },
      })
      return record?.donorNumber ?? null
    }
  }
}

async function idExists(model: SupportedModel, id: string): Promise<boolean> {
  switch (model) {
    case 'member':
      return Boolean(await db.member.findUnique({ where: { memberNumber: id }, select: { id: true } }))
    case 'case':
      return Boolean(await db.case.findUnique({ where: { caseNumber: id }, select: { id: true } }))
    case 'donation':
      return Boolean(await db.donation.findUnique({ where: { donationNumber: id }, select: { id: true } }))
    case 'disbursement':
      return Boolean(await db.disbursement.findUnique({ where: { disbursementNumber: id }, select: { id: true } }))
    case 'volunteer':
      return Boolean(await db.volunteer.findUnique({ where: { volunteerNumber: id }, select: { id: true } }))
    case 'donor':
      return Boolean(await db.donor.findUnique({ where: { donorNumber: id }, select: { id: true } }))
  }
}

function fallbackId(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Generate a sequential ID by reading the current maximum padded ID.
 *
 * Important: callers that immediately create records should prefer
 * generateUniqueId/createWithGeneratedUniqueValue-style retries around the
 * actual insert so database unique constraints remain the final authority.
 */
export async function generateSequentialId(prefix: string, model: string): Promise<string> {
  if (!isSupportedModel(model)) return fallbackId(prefix)

  const effectivePrefix = prefix || MODEL_CONFIG[model].prefix
  const latestId = await findLatestId(model, effectivePrefix)
  const nextNum = parseNextNumber(latestId)
  return `${effectivePrefix}-${nextNum.toString().padStart(4, '0')}`
}

/**
 * Generate a unique ID with bounded retries. This avoids dynamic Prisma model
 * access and works for all Hermes-supported numbered models.
 */
export async function generateUniqueId(prefix: string, model: string, maxRetries = 5): Promise<string> {
  if (!isSupportedModel(model)) return fallbackId(prefix)

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const id = await generateSequentialId(prefix, model)
    if (!(await idExists(model, id))) return id
  }

  return fallbackId(prefix || MODEL_CONFIG[model].prefix)
}

// Backwards compatibility alias.
export const generateNumber = generateUniqueId
