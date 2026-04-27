import { PrismaClient } from '@prisma/client'

function isUsableDatabaseUrl(value: string | undefined) {
  return !!value && /^(postgres|postgresql|file):/i.test(value)
}

function resolveDatabaseUrl() {
  if (isUsableDatabaseUrl(process.env.DATABASE_URL)) {
    return process.env.DATABASE_URL
  }

  return [
    process.env.POSTGRES_PRISMA_URL,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL,
  ].find(isUsableDatabaseUrl)
}

const databaseUrl = resolveDatabaseUrl()

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    ...(databaseUrl
      ? {
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        }
      : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
