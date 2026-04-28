import { NextRequest, NextResponse } from 'next/server'
import { signUpWithSupabase } from '@/lib/supabase/auth'
import { requireRole } from '@/lib/auth'
import type { AppRole } from '@/lib/auth-shared'

export async function POST(request: NextRequest) {
  try {
    // Only admins can create new users
    await requireRole(request, ['admin', 'developer'])

    const body = await request.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const name = typeof body?.name === 'string' ? body.name : ''
    const role = typeof body?.role === 'string' ? body.role as AppRole : 'staff'

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Emel, kata laluan dan nama diperlukan' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Kata laluan mestilah sekurang-kurangnya 8 aksara' },
        { status: 400 },
      )
    }

    const result = await signUpWithSupabase(email, password, name, role)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Pendaftaran gagal' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
      },
    })
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string }
    if (err.status === 401 || err.status === 403) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.status },
      )
    }
    console.error('Supabase signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Ralat pelayan dalaman' },
      { status: 500 },
    )
  }
}
