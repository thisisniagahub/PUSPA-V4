import { NextRequest, NextResponse } from 'next/server'
import { seedSupabaseAuthUsers } from '@/lib/supabase/auth'
import { requireRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Only developers can seed auth users
    await requireRole(request, ['developer'])

    const results = await seedSupabaseAuthUsers()

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string }
    if (err.status === 401 || err.status === 403) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.status },
      )
    }
    console.error('Seed auth users error:', error)
    return NextResponse.json(
      { success: false, error: 'Ralat pelayan dalaman' },
      { status: 500 },
    )
  }
}
