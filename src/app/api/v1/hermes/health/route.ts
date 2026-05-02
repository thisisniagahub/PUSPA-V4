import { NextResponse } from 'next/server'
import { requireRole, AuthorizationError } from '@/lib/auth'
import { getHermesRuntimeMode } from '@/lib/hermes-bridge'

export async function GET(request: Request) {
  try {
    await requireRole(request, ['admin', 'developer'])
    const mode = getHermesRuntimeMode()

    return NextResponse.json({
      success: true,
      data: {
        status: 'ok',
        runtime: mode.localOnly ? 'local-only' : 'network-enabled',
        webhooksEnabled: mode.webhooksEnabled,
        gatewayUrl: mode.gatewayUrl,
      },
    })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    return NextResponse.json({ success: false, error: 'Gagal semak status Hermes.' }, { status: 500 })
  }
}
