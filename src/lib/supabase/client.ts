import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const FALLBACK_SUPABASE_URL = 'http://127.0.0.1:54321'
const FALLBACK_SUPABASE_KEY = 'missing-supabase-anon-key'

function getSupabaseBrowserEnv() {
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase public env is missing; using inert local fallback client for build/dev rendering')
    }

    return {
      url: FALLBACK_SUPABASE_URL,
      key: FALLBACK_SUPABASE_KEY,
    }
  }

  return {
    url: supabaseUrl,
    key: supabaseKey,
  }
}

export function createClient() {
  const { url, key } = getSupabaseBrowserEnv()
  return createSupabaseBrowserClient(url, key)
}
