export type AppRole = 'staff' | 'admin' | 'developer'

let cachedGeneratedSecret: string | null = null

/**
 * Generates a secure random secret for authentication fallback.
 * This is used only during development or build phase when NEXTAUTH_SECRET is missing.
 */
function getGeneratedSecret(): string {
  if (cachedGeneratedSecret) return cachedGeneratedSecret

  // Use Web Crypto API (available in modern Node.js and Browsers)
  const cryptoObj =
    typeof globalThis !== 'undefined'
      ? globalThis.crypto
      : typeof crypto !== 'undefined'
        ? crypto
        : null

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const randomValues = new Uint8Array(32)
    cryptoObj.getRandomValues(randomValues)
    cachedGeneratedSecret = Array.from(randomValues)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return cachedGeneratedSecret
  }

  // Fallback for Node.js if global crypto is not available
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCrypto = require('crypto')
      if (nodeCrypto && typeof nodeCrypto.randomBytes === 'function') {
        cachedGeneratedSecret = nodeCrypto.randomBytes(32).toString('hex')
        return cachedGeneratedSecret!
      }
    } catch {
      // Fall through
    }
  }

  throw new Error('Secure random number generation not available for authentication secret')
}

export function normalizeUserRole(role?: string | null): AppRole {
  const normalized = role?.toLowerCase()

  if (normalized === 'developer') {
    return 'developer'
  }

  if (normalized === 'admin' || normalized === 'finance') {
    return 'admin'
  }

  return 'staff'
}

/**
 * Returns the authentication secret for signing tokens.
 * Prioritizes the NEXTAUTH_SECRET environment variable.
 */
export function getAuthSecret(): string {
  const envSecret = process.env.NEXTAUTH_SECRET
  if (envSecret && envSecret.trim().length > 0) {
    return envSecret
  }

  const isProduction = process.env.NODE_ENV === 'production'
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

  // In production runtime (not build phase), the secret MUST be provided
  if (isProduction && !isBuildPhase) {
    throw new Error('NEXTAUTH_SECRET environment variable is required in production runtime')
  }

  // Fallback for development or build phase to allow the application to start
  const fallbackSecret = getGeneratedSecret()

  if (typeof window === 'undefined') {
    console.warn(
      `[AUTH] NEXTAUTH_SECRET is not set. Using a temporary generated secret for ${
        isBuildPhase ? 'build' : 'development'
      }.`,
    )
  }

  return fallbackSecret
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3001'
}
