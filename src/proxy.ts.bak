import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getAuthSecret } from '@/lib/auth-shared'

function buildUnauthorizedApiResponse() {
  return NextResponse.json(
    {
      success: false,
      error: 'Sesi tidak sah atau pengguna belum log masuk',
    },
    { status: 401 },
  )
}

export default async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  })

  if (token?.sub && token.isActive !== false) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return buildUnauthorizedApiResponse()
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set(
    'callbackUrl',
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  )

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/((?!api/auth|login|public|puspa-logo-official.png|puspa-logo-transparent.png|puspa-logo.png|_next/static|_next/image|favicon.ico).*)',
  ],
}
