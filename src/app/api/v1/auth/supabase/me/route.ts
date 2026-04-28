import { NextResponse } from 'next/server'
import { getSupabaseAuthUser } from '@/lib/supabase/auth'

export async function GET() {
  try {
    const user = await getSupabaseAuthUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesi tidak sah' },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error('Supabase me error:', error)
    return NextResponse.json(
      { success: false, error: 'Ralat pelayan dalaman' },
      { status: 500 },
    )
  }
}
