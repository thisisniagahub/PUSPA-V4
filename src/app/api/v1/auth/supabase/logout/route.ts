import { NextResponse } from 'next/server'
import { signOutSupabase } from '@/lib/supabase/auth'

export async function POST() {
  try {
    const result = await signOutSupabase()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Log keluar gagal' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Supabase logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Ralat pelayan dalaman' },
      { status: 500 },
    )
  }
}
