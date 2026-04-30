import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createBotApiKey, listBotApiKeys, revokeBotApiKey } from '@/lib/bot-auth'
import { AuthorizationError, requireRole } from '@/lib/auth'

const permissionsSchema = z.object({
  dashboard: z.boolean().optional(),
  members: z.boolean().optional(),
  cases: z.boolean().optional(),
  donations: z.boolean().optional(),
  disbursements: z.boolean().optional(),
  ekyc: z.boolean().optional(),
  reports: z.boolean().optional(),
  ops: z.boolean().optional(),
  admin: z.boolean().optional(),
}).strict().default({})

const createBotKeySchema = z.object({
  name: z.string().min(1).max(120),
  role: z.enum(['bot', 'admin_bot', 'ops_bot']).optional(),
  permissions: permissionsSchema.optional(),
  expiresInDays: z.number().int().min(1).max(3650).optional(),
})

function handleAuthError(error: unknown) {
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status }
    )
  }
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ['admin'])
  } catch (error) {
    return handleAuthError(error)
  }

  try {
    const parsed = createBotKeySchema.parse(await request.json())

    const botKey = await createBotApiKey({
      name: parsed.name,
      role: parsed.role,
      permissions: parsed.permissions,
      expiresInDays: parsed.expiresInDays,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: botKey.id,
        name: botKey.name,
        role: botKey.role,
        permissions: botKey.permissions,
        keyPrefix: botKey.keyPrefix,
        rawKey: botKey.rawKey, // Only returned on creation!
        expiresAt: botKey.expiresAt,
        createdAt: botKey.createdAt,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 },
      )
    }

    console.error('[BOT_KEY_CREATE]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create bot key' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['admin'])
  } catch (error) {
    return handleAuthError(error)
  }

  try {
    const keys = await listBotApiKeys()
    return NextResponse.json({
      success: true,
      data: keys,
    })
  } catch (error) {
    console.error('[BOT_KEY_LIST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list bot keys' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole(request, ['admin'])
  } catch (error) {
    return handleAuthError(error)
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Bot key ID required' },
        { status: 400 }
      )
    }

    await revokeBotApiKey(id)

    return NextResponse.json({
      success: true,
      message: 'Bot key revoked',
    })
  } catch (error) {
    console.error('[BOT_KEY_REVOKE]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revoke bot key' },
      { status: 500 }
    )
  }
}
