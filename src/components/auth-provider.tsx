'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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
  const supabase = createClient()

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser()

      if (sbUser) {
        setSupabaseUser(sbUser)

        // Fetch the full user profile from our /me endpoint
        const res = await fetch('/api/v1/auth/supabase/me')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.user) {
            setUser(data.data.user)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } else {
        setSupabaseUser(null)
        setUser(null)
      }
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
