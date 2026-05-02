import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole, AuthorizationError } from '@/lib/auth'
import { getHermesRuntimeMode } from '@/lib/hermes-bridge'

const ExecuteSchema = z.object({
  task: z.string().min(3),
  currentView: z.string().optional(),
  dryRun: z.boolean().default(true),
})

export async function POST(request: Request) {
  try {
    const session = await requireRole(request, ['admin', 'developer'])
    const payload = ExecuteSchema.parse(await request.json())
    const mode = getHermesRuntimeMode()

    if (mode.localOnly && !payload.dryRun) {
      return NextResponse.json(
        { success: false, error: 'Hermes local-only mode hanya benarkan dryRun=true.' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        accepted: true,
        dryRun: payload.dryRun,
        queuedAt: new Date().toISOString(),
        actor: session.user.email,
        note: 'Bridge skeleton aktif. Sambungan execution real akan diikat ke Hermes runtime dalam fasa seterusnya.',
      },
    })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Payload tidak sah.', issues: error.flatten() }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: 'Permintaan execute Hermes gagal.' }, { status: 500 })
  }
}
