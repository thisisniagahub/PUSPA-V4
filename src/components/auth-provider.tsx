'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AppRole } from '@/lib/auth-shared'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: AppRole
  supabaseId: string
}

interface AuthContextType {
  user: AuthUser | null
  supabaseUser: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signOut: async () => {},
  refreshUser: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/supabase/me', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data?.user) {
          setUser(data.data.user)
          setLoading(false)

          void supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
            setSupabaseUser(sbUser ?? null)
          }).catch(() => {
            setSupabaseUser(null)
          })
          return
        }
      }

      setSupabaseUser(null)
      setUser(null)
    } catch {
      setSupabaseUser(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUser()

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchUser()
        } else if (event === 'SIGNED_OUT') {
          setSupabaseUser(null)
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUser, supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    // Local Dev Bypass for UI/UX Review
    if (process.env.NODE_ENV === 'development' && email === 'admin@puspa.org.my' && password === 'Puspa@2026') {
      const mockUser: AuthUser = {
        id: 'dev-admin-id',
        email: 'admin@puspa.org.my',
        name: 'Pentadbir PUSPA (Local)',
        role: 'developer',
        supabaseId: 'dev-supabase-id'
      };
      setUser(mockUser);
      setLoading(false);
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return { success: false, error: error.message }
      }

      // Fetch the user profile after sign in
      await fetchUser()

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Log masuk gagal' }
    }
  }, [supabase, fetchUser])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSupabaseUser(null)
    setUser(null)
    window.location.href = '/login'
  }, [supabase])

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        signIn,
        signOut: handleSignOut,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
