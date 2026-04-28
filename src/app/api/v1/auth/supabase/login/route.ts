import { NextRequest, NextResponse } from 'next/server'
import { signInWithSupabase } from '@/lib/supabase/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Emel dan kata laluan diperlukan' },
        { status: 400 },
      )
    }

    const result = await signInWithSupabase(email, password)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Log masuk gagal' },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
      },
    })
  } catch (error) {
    console.error('Supabase login error:', error)
    return NextResponse.json(
      { success: false, error: 'Ralat pelayan dalaman' },
      { status: 500 },
    )
  }
}
