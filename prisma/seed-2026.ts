import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seed2026() {
  console.log('🚀 Injecting 2026 Mock Data for UI/UX Review...')

  const currentYear = 2026
  const months = [0, 1, 2, 3, 4] // Jan to May

  // 1. Members
  for (let i = 0; i < 15; i++) {
    const month = months[Math.floor(Math.random() * months.length)]
    const day = Math.floor(Math.random() * 28) + 1
    const ic = `900101-01-${6000 + i}` // Changed to avoid collision
    await db.member.upsert({
      where: { ic },
      update: {},
      create: {
        memberNumber: `MOCK-${2026}-${i.toString().padStart(4, '0')}`,
        name: `Ahli Asnaf 2026 ${i}`,
        ic,
        phone: `012-${Math.floor(Math.random() * 10000000)}`,
        status: 'active',
        joinedAt: new Date(currentYear, month, day),
        householdSize: Math.floor(Math.random() * 5) + 1,
        monthlyIncome: Math.floor(Math.random() * 1500),
        address: `No. ${i}, Jalan Review 2026, Kuala Lumpur`,
      }
    })
  }

  // 2. Donations
  const fundTypes = ['zakat', 'sadaqah', 'waqf', 'infaq']
  for (let i = 0; i < 40; i++) {
    const month = months[Math.floor(Math.random() * months.length)]
    const day = Math.floor(Math.random() * 28) + 1
    const donationNumber = `DN-${2026}-${i.toString().padStart(4, '0')}`
    await db.donation.upsert({
      where: { donationNumber },
      update: {},
      create: {
        donationNumber,
        donorName: `Penderma Baik ${i}`,
        amount: Math.floor(Math.random() * 500) + 50,
        fundType: fundTypes[Math.floor(Math.random() * fundTypes.length)],
        status: 'confirmed',
        donatedAt: new Date(currentYear, month, day),
      }
    })
  }

  // 3. Activities
  const activityTypes = ['case', 'donation', 'member', 'programme']
  for (let i = 0; i < 10; i++) {
    await db.activity.create({
      data: {
        title: `Aktiviti Review ${i}`,
        description: `Ini adalah log aktiviti mock untuk tujuan UI/UX audit pada tahun 2026.`,
        type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
        createdAt: new Date(),
      }
    })
  }

  console.log('✅ 2026 Mock Data Injected successfully!')
  await db.$disconnect()
}

seed2026()
