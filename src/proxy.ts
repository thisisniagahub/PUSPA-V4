import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
  '/api/v1/auth/supabase/login',
  '/api/v1/auth/supabase/logout',
  '/api/v1/auth/supabase/me',
  '/api/v1/auth/supabase/signup',
  '/api/v1/auth/supabase/seed',
])

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // --- Supabase Auth Session Refresh ---
  // Refresh the Supabase auth session on every request so the user
  // stays authenticated. This is the recommended pattern from Supabase
  // for SSR apps.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
  })

  // IMPORTANT: Do not add any logic between createServerClient and
  // supabase.auth.getUser() — doing so can cause random log-outs.
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser()

  // --- Auth logic ---
  if (PUBLIC_API_PATHS.has(pathname)) {
    return supabaseResponse
  }

  // If user has a valid Supabase session, allow through
  if (supabaseUser) {
    return supabaseResponse
  }

  // Bot API routes use API key auth, not session auth
  if (pathname.startsWith('/api/v1/bot/')) {
    return supabaseResponse
  }

  // Unauthenticated API access — return 401
  if (pathname.startsWith('/api/')) {
    return buildUnauthorizedApiResponse()
  }

  // Static assets — just pass through
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/)) {
    return supabaseResponse
  }

  // Login page — allow access (redirect to home if authenticated is handled client-side)
  if (pathname === '/login') {
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
