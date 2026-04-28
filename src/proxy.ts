import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
  '/api/v1/auth/supabase/login',
  '/api/v1/auth/supabase/logout',
  '/api/v1/auth/supabase/me',
])

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // --- Supabase Auth Session Refresh ---
  // Refresh the Supabase auth session on every request so the user
  // stays authenticated. This is the recommended pattern from Supabase
  // for SSR apps (replaces the old middleware approach).
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do not add any logic between createServerClient and
  // supabase.auth.getUser() — doing so can cause random log-outs.
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser()

  // --- Existing auth logic ---
  if (PUBLIC_API_PATHS.has(pathname)) {
    return supabaseResponse
  }

  // Check for NextAuth session cookie
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  // If user has either NextAuth session or Supabase session, allow through
  if (sessionToken || supabaseUser) {
    return supabaseResponse
  }

  if (pathname.startsWith('/api/v1/bot/')) {
    return supabaseResponse
  }

  if (pathname.startsWith('/api/')) {
    return buildUnauthorizedApiResponse()
  }

  // Static assets — just pass through
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/)) {
    return supabaseResponse
  }

  // Unauthenticated page access — redirect to login
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
