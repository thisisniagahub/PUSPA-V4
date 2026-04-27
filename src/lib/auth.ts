import { getServerSession, type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { getAuthSecret, normalizeUserRole, type AppRole } from '@/lib/auth-shared'
import { hashPassword, isPasswordHash, verifyPassword } from '@/lib/password'

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

async function getCurrentUserSnapshot(userId?: string | null) {
  if (!userId) {
    return null
  }

  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isActive: true,
      name: true,
      role: true,
    },
  })
}

export const authOptions: NextAuthOptions = {
  secret: getAuthSecret(),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'PUSPA Credentials',
      credentials: {
        email: {
          label: 'Emel',
          type: 'email',
        },
        password: {
          label: 'Kata Laluan',
          type: 'password',
        },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password

        if (!email || !password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user || !user.isActive) {
          return null
        }

        let isValidPassword = await verifyPassword(password, user.password)

        if (!isValidPassword && !isPasswordHash(user.password) && user.password === password) {
          const migratedHash = await hashPassword(password)

          await db.user.update({
            where: { id: user.id },
            data: { password: migratedHash },
          })

          isValidPassword = true
        }

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: normalizeUserRole(user.role),
          dbRole: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }

      const currentUser = await getCurrentUserSnapshot(token.sub)

      if (!currentUser || !currentUser.isActive) {
        throw new Error('SESSION_USER_INVALID')
      }

      token.name = currentUser.name
      token.email = currentUser.email
      token.role = normalizeUserRole(currentUser.role)
      token.dbRole = currentUser.role
      token.isActive = currentUser.isActive

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ''
        session.user.role = normalizeUserRole(typeof token.role === 'string' ? token.role : undefined)
        session.user.dbRole =
          typeof token.dbRole === 'string' && token.dbRole.length > 0
            ? token.dbRole
            : session.user.role
        session.user.isActive = token.isActive !== false
      }

      return session
    },
  },
}

export function getServerAuthSession() {
  return getServerSession(authOptions)
}

export async function requireAuth(_request?: Request) {
  const session = await getServerAuthSession()

  if (!session?.user?.id) {
    throw new AuthorizationError('Sesi tidak sah atau pengguna belum log masuk', 401)
  }

  const currentUser = await getCurrentUserSnapshot(session.user.id)

  if (!currentUser || !currentUser.isActive) {
    throw new AuthorizationError('Sesi tidak sah atau pengguna belum log masuk', 401)
  }

  session.user.id = currentUser.id
  session.user.email = currentUser.email
  session.user.name = currentUser.name
  session.user.role = normalizeUserRole(currentUser.role)
  session.user.dbRole = currentUser.role
  session.user.isActive = currentUser.isActive

  return session
}

export async function requireRole(_request: Request | undefined, roles: AppRole[]) {
  const session = await requireAuth(_request)

  if (!roles.includes(session.user.role)) {
    throw new AuthorizationError('Anda tidak mempunyai kebenaran untuk tindakan ini', 403)
  }

  return session
}
