import { NextRequest, NextResponse } from 'next/server'

function buildUnauthorizedApiResponse() {
  return NextResponse.json(
    {
      success: false,
      error: 'Sesi tidak sah atau pengguna belum log masuk',
    },
    { status: 401 },
  )
}

const PUBLIC_API_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/me',
])

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  if (sessionToken) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/v1/bot/')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return buildUnauthorizedApiResponse()
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set(
    'callbackUrl',
    `${pathname}${request.nextUrl.search}`,
  )

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/((?!api/auth|login|public|puspa-logo-official.png|puspa-logo-transparent.png|puspa-logo.png|_next/static|_next/image|favicon.ico).*)',
  ],
}
