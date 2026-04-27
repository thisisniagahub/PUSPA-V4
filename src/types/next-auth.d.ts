import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: 'staff' | 'admin' | 'developer'
      dbRole: string
      isActive: boolean
    }
  }

  interface User {
    id: string
    role: 'staff' | 'admin' | 'developer'
    dbRole: string
    isActive?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'staff' | 'admin' | 'developer'
    dbRole?: string
    isActive?: boolean
  }
}
