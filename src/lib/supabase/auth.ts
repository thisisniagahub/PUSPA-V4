import { createClient, createAdminClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { normalizeUserRole, type AppRole } from '@/lib/auth-shared'

export type SupabaseAuthResult = {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    role: AppRole
    supabaseId: string
  }
  error?: string
}

/**
 * Sign in with email and password using Supabase Auth
 * Then sync the Supabase user with our Prisma User table
 */
export async function signInWithSupabase(email: string, password: string): Promise<SupabaseAuthResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.user) {
    return { success: false, error: 'Pengguna tidak dijumpai' }
  }

  // Sync Supabase user with our Prisma User table
  const syncedUser = await syncSupabaseUser(data.user.id, data.user.email || email)

  return {
    success: true,
    user: syncedUser,
  }
}

/**
 * Sign up a new user with Supabase Auth
 * Then create a corresponding record in our Prisma User table
 */
export async function signUpWithSupabase(
  email: string,
  password: string,
  name: string,
  role: AppRole = 'staff',
): Promise<SupabaseAuthResult> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm for admin-created users
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.user) {
    return { success: false, error: 'Gagal mencipta pengguna' }
  }

  // Create or update the Prisma User record
  const syncedUser = await syncSupabaseUser(data.user.id, data.user.email || email, name, role)

  return {
    success: true,
    user: syncedUser,
  }
}

/**
 * Sync a Supabase Auth user with our Prisma User table
 */
async function syncSupabaseUser(
  supabaseId: string,
  email: string,
  name?: string,
  role?: AppRole,
): Promise<NonNullable<SupabaseAuthResult['user']>> {
  // Try to find existing user by supabaseId or email
  let user = await db.user.findFirst({
    where: {
      OR: [
        { supabaseId },
        { email },
      ],
    },
  })

  if (user) {
    // Update existing user with supabaseId if not set
    if (!user.supabaseId) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          supabaseId,
          lastLogin: new Date(),
          ...(name ? { name } : {}),
        },
      })
    } else {
      // Just update lastLogin
      user = await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })
    }
  } else {
    // Create new user in Prisma
    const { hashPassword } = await import('@/lib/password')
    const hashedPassword = await hashPassword('temp_supabase_auth_' + Date.now()) // Placeholder - auth is via Supabase

    user = await db.user.create({
      data: {
        supabaseId,
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role: role || 'staff',
        isActive: true,
        lastLogin: new Date(),
      },
    })
  }

  if (!user.isActive) {
    throw new Error('Akaun anda telah dinyahaktifkan')
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: normalizeUserRole(user.role),
    supabaseId,
  }
}

/**
 * Get the current authenticated user from Supabase session
 */
export async function getSupabaseAuthUser(): Promise<SupabaseAuthResult['user'] | null> {
  const supabase = await createClient()

  const { data: { user: supabaseUser } } = await supabase.auth.getUser()

  if (!supabaseUser) return null

  // Find the corresponding Prisma user
  const user = await db.user.findFirst({
    where: {
      OR: [
        { supabaseId: supabaseUser.id },
        { email: supabaseUser.email },
      ],
    },
  })

  if (!user || !user.isActive) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: normalizeUserRole(user.role),
    supabaseId: supabaseUser.id,
  }
}

/**
 * Sign out from Supabase Auth
 */
export async function signOutSupabase(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Create initial Supabase Auth users for the 3 default roles
 * This should be called after the SQL migration is run
 */
export async function seedSupabaseAuthUsers() {
  const adminClient = createAdminClient()

  const defaultUsers = [
    { email: 'staff@puspa.org.my', password: 'Staff@2026', name: 'Kakitangan PUSPA', role: 'staff' as AppRole },
    { email: 'admin@puspa.org.my', password: 'Admin@2026', name: 'Pentadbir PUSPA', role: 'admin' as AppRole },
    { email: 'dev@puspa.org.my', password: 'Dev@2026', name: 'Pembangun PUSPA', role: 'developer' as AppRole },
  ]

  const results = []

  for (const userData of defaultUsers) {
    try {
      // Check if user already exists in Supabase Auth
      const { data: existingUsers } = await adminClient.auth.admin.listUsers()
      const existing = existingUsers.users.find(u => u.email === userData.email)

      if (existing) {
        results.push({ email: userData.email, status: 'already_exists', id: existing.id })
        // Sync with Prisma
        await syncSupabaseUser(existing.id, userData.email, userData.name, userData.role)
        continue
      }

      // Create user in Supabase Auth
      const { data, error } = await adminClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      })

      if (error) {
        results.push({ email: userData.email, status: 'error', error: error.message })
        continue
      }

      // Sync with Prisma
      await syncSupabaseUser(data.user.id, userData.email, userData.name, userData.role)

      results.push({ email: userData.email, status: 'created', id: data.user.id })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      results.push({ email: userData.email, status: 'error', error: message })
    }
  }

  return results
}
