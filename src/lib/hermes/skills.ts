// ============================================================
// Hermes Agent — Self-Improving Skills System
// Inspired by NousResearch Hermes Agent SKILL.md format
// Skills are learned from interactions and improve over time
// ============================================================

import { db } from '@/lib/db'

export interface SkillEntry {
  id: string
  name: string
  description: string
  category: string
  instructions: string
  triggerPatterns: string[]
  version: number
  usageCount: number
  successRate: number
  source: string
  isActive: boolean
  userId: string | null
  createdAt: string
  updatedAt: string
}

// Create a new skill
export async function createSkill(params: {
  name: string
  description: string
  category?: string
  instructions: string
  triggerPatterns?: string[]
  source?: string
  userId?: string
  conversationId?: string
}): Promise<SkillEntry> {
  const skill = await db.hermesSkill.create({
    data: {
      name: params.name,
      description: params.description,
      category: params.category || 'general',
      instructions: params.instructions,
      triggerPatterns: params.triggerPatterns ? JSON.stringify(params.triggerPatterns) : null,
      source: params.source || 'auto',
      userId: params.userId,
      conversationId: params.conversationId,
    },
  })

  return {
    ...skill,
    triggerPatterns: skill.triggerPatterns ? JSON.parse(skill.triggerPatterns) : [],
  } as SkillEntry
}

// List all active skills
export async function listSkills(params?: {
  category?: string
  userId?: string
  activeOnly?: boolean
}): Promise<SkillEntry[]> {
  const where: Record<string, unknown> = {}

  if (params?.activeOnly !== false) where.isActive = true
  if (params?.category) where.category = params.category
  if (params?.userId) where.userId = params.userId

  const skills = await db.hermesSkill.findMany({
    where,
    orderBy: [
      { usageCount: 'desc' },
      { successRate: 'desc' },
      { updatedAt: 'desc' },
    ],
  })

  return skills.map(s => ({
    ...s,
    triggerPatterns: s.triggerPatterns ? JSON.parse(s.triggerPatterns) : [],
  })) as SkillEntry[]
}

// Get a specific skill
export async function getSkill(skillId: string): Promise<SkillEntry | null> {
  const skill = await db.hermesSkill.findUnique({ where: { id: skillId } })
  if (!skill) return null
  return {
    ...skill,
    triggerPatterns: skill.triggerPatterns ? JSON.parse(skill.triggerPatterns) : [],
  } as SkillEntry
}

// Record skill usage (increment count, update success rate)
export async function recordSkillUsage(skillId: string, success: boolean): Promise<void> {
  const skill = await db.hermesSkill.findUnique({ where: { id: skillId } })
  if (!skill) return

  const newCount = skill.usageCount + 1
  const newRate = (skill.successRate * skill.usageCount + (success ? 1 : 0)) / newCount

  await db.hermesSkill.update({
    where: { id: skillId },
    data: {
      usageCount: newCount,
      successRate: Math.round(newRate * 100) / 100,
      updatedAt: new Date(),
    },
  })
}

// Find matching skills for a user query
export async function findMatchingSkills(query: string, userId?: string): Promise<SkillEntry[]> {
  const skills = await listSkills({ activeOnly: true, userId })

  const queryLower = query.toLowerCase()
  return skills.filter(skill => {
    // Check trigger patterns
    if (skill.triggerPatterns.length > 0) {
      return skill.triggerPatterns.some(p => queryLower.includes(p.toLowerCase()))
    }
    // Fallback: check name and description
    return queryLower.includes(skill.name.toLowerCase()) ||
           queryLower.includes(skill.description.toLowerCase())
  })
}

// Build skills context block for system prompt (inspired by Hermes Agent's build_skills_system_prompt)
export async function buildSkillsContext(userId?: string): Promise<string> {
  const skills = await listSkills({ activeOnly: true, userId })

  if (skills.length === 0) return ''

  const lines = skills.map(s => {
    const emoji = s.category === 'data-query' ? '📊' :
                  s.category === 'navigation' ? '🧭' :
                  s.category === 'workflow' ? '⚡' :
                  s.category === 'analysis' ? '🔍' : '🛠️'
    return `${emoji} **${s.name}** (v${s.version}, used ${s.usageCount}x, ${Math.round(s.successRate * 100)}% success): ${s.description}`
  })

  return `## Available Skills (Self-Learned)
The following skills have been learned from previous interactions. Use them when relevant:
${lines.join('\n')}

After completing a complex task (5+ tool calls), fixing a tricky error, or discovering a non-trivial workflow, consider saving the approach as a skill using the \`skill_manage\` tool.`
}

// Auto-create a skill from a successful interaction
export async function autoCreateSkill(params: {
  name: string
  description: string
  instructions: string
  triggerPatterns: string[]
  category?: string
  userId?: string
  conversationId?: string
}): Promise<SkillEntry | null> {
  // Check if a similar skill already exists
  const existing = await db.hermesSkill.findFirst({
    where: { name: params.name, isActive: true },
  })

  if (existing) {
    // Update existing skill instead of creating duplicate
    await db.hermesSkill.update({
      where: { id: existing.id },
      data: {
        instructions: params.instructions,
        triggerPatterns: JSON.stringify(params.triggerPatterns),
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    })
    return getSkill(existing.id)
  }

  return createSkill(params)
}

// Seed default skills
export async function seedDefaultSkills(): Promise<void> {
  const defaults = [
    {
      name: 'organization-overview',
      description: 'Memberikan ringkasan keseluruhan organisasi PUSPA dengan statistik terkini',
      category: 'data-query',
      instructions: `1. Gunakan tool query_stats untuk mendapatkan statistik semua modul
2. Susun data dalam format ringkasan yang mudah dibaca
3. Sertakan jumlah ahli, kes, donasi, program, dan pematuhan
4. Gunakan format angka Malaysia (RM, koma untuk ribu)
5. Akhiri dengan cadangan tindakan`,
      triggerPatterns: ['ringkasan', 'overview', 'keseluruhan', 'summary'],
      source: 'manual',
    },
    {
      name: 'urgent-cases',
      description: 'Mencari dan memaparkan kes-kes yang memerlukan tindakan segera',
      category: 'data-query',
      instructions: `1. Gunakan search_cases dengan priority=urgent
2. Jika tiada kes urgent, cari kes dengan status submitted/verifying
3. Paparkan dalam format jadual dengan nombor kes, tajuk, keutamaan, status
4. Sertakan cadangan tindakan untuk setiap kes
5. Tanya jika pengguna ingin navigasi ke modul Kes Bantuan`,
      triggerPatterns: ['urgent', 'segera', 'keutamaan', 'critical', 'penting'],
      source: 'manual',
    },
    {
      name: 'donation-analysis',
      description: 'Menganalisis data donasi mengikut jenis dana, tempoh, dan trend',
      category: 'analysis',
      instructions: `1. Gunakan get_donations_summary dengan period yang diminta
2. Pecahkan mengikut jenis dana (zakat, sedekah, wakaf, infak)
3. Bandingkan dengan tempoh sebelumnya jika boleh
4. Paparkan trend dan cadangan peningkatan
5. Sertakan 5 donasi terkini sebagai contoh`,
      triggerPatterns: ['analisis donasi', 'donation analysis', 'trend donasi', 'pecahan donasi'],
      source: 'manual',
    },
    {
      name: 'member-search',
      description: 'Mencari ahli asnaf berdasarkan nama, IC, atau status',
      category: 'data-query',
      instructions: `1. Ekstrak istilah carian dari permintaan pengguna
2. Gunakan search_members dengan parameter yang sesuai
3. Paparkan keputusan dalam format kad ringkas
4. Jika tiada keputusan, cadangkan carian alternatif
5. Tanya jika pengguna ingin melihat profil lengkap`,
      triggerPatterns: ['cari ahli', 'search member', 'carian', 'find member', 'profil ahli'],
      source: 'manual',
    },
    {
      name: 'compliance-check',
      description: 'Menyemak status pematuhan dan item yang belum selesai',
      category: 'data-query',
      instructions: `1. Gunakan compliance_status untuk mendapatkan data terkini
2. Kira skor pematuhan sebagai peratusan
3. Senaraikan item yang belum selesai mengikut kategori
4. Sertakan keutamaan untuk setiap item tertunggak
5. Cadangkan tindakan pemulihan`,
      triggerPatterns: ['pematuhan', 'compliance', 'audit', 'semakan', 'status ros'],
      source: 'manual',
    },
  ]

  for (const skill of defaults) {
    const existing = await db.hermesSkill.findFirst({
      where: { name: skill.name, source: 'manual' },
    })

    if (!existing) {
      await createSkill(skill)
    }
  }
}
