import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'
type UserRole = string
import { requireRole, AuthorizationError } from '@/lib/auth'
import { AppRole, canAssignRole } from '@/lib/roles'

const ADMIN_ROLES: AppRole[] = ['admin', 'developer']

// GET /api/v1/users — List all users
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ADMIN_ROLES)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          avatar: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    return NextResponse.json({ success: false, error: error?.message || 'Gagal memuatkan pengguna' }, { status: 500 })
  }
}

// POST /api/v1/users — Create new user
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, ADMIN_ROLES)
    const body = await req.json()
    const { name, email, password, role, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Nama, emel dan kata laluan diperlukan' }, { status: 400 })
    }

    const targetRole = (role || 'staff') as AppRole
    if (!canAssignRole(session.user.role, targetRole)) {
      return NextResponse.json({ success: false, error: 'Anda tidak mempunyai kebenaran untuk menetapkan peranan ini' }, { status: 403 })
    }

    // Check for duplicate email
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Emel sudah wujud' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: targetRole as UserRole,
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    return NextResponse.json({ success: false, error: error?.message || 'Gagal mencipta pengguna' }, { status: 500 })
  }
}

// PUT /api/v1/users — Update user
export async function PUT(req: NextRequest) {
  try {
    const session = await requireRole(req, ADMIN_ROLES)
    const body = await req.json()
    const { id, name, email, role, phone, isActive, currentPassword, newPassword } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pengguna diperlukan' }, { status: 400 })
    }

    if (role && !canAssignRole(session.user.role, role as AppRole)) {
      return NextResponse.json({ success: false, error: 'Anda tidak mempunyai kebenaran untuk menetapkan peranan ini' }, { status: 403 })
    }

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak dijumpai' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (phone !== undefined) updateData.phone = phone
    if (isActive !== undefined) updateData.isActive = isActive

    // Password change
    if (currentPassword && newPassword) {
      const isValid = await verifyPassword(currentPassword, existing.password)
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Kata laluan semasa tidak sah' }, { status: 401 })
      }
      updateData.password = await hashPassword(newPassword)
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    return NextResponse.json({ success: false, error: error?.message || 'Gagal mengemaskini pengguna' }, { status: 500 })
  }
}

// DELETE /api/v1/users — Deactivate user
export async function DELETE(req: NextRequest) {
  try {
    await requireRole(req, ADMIN_ROLES)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pengguna diperlukan' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak dijumpai' }, { status: 404 })
    }

    // Soft delete — deactivate instead of actual delete
    const updated = await db.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    return NextResponse.json({ success: false, error: error?.message || 'Gagal memadam pengguna' }, { status: 500 })
  }
}
