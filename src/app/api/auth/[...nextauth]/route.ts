import { NextRequest, NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildRateLimitHeaders, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

type AuthRouteContext = {
  params: Promise<{
    nextauth: string[]
  }>
}

export async function GET(request: NextRequest, context: AuthRouteContext) {
  return handler(request, context)
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  const limit = rateLimit(request, {
    limit: 100,
    windowMs: 1 * 60 * 1000,
    keyPrefix: 'auth',
  })

  if (!limit.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Terlalu banyak percubaan log masuk. Sila cuba semula sebentar lagi.',
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(limit),
      },
    )
  }

  return handler(request, context)
}
