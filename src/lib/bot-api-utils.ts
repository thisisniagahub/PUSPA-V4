export function parsePagination(searchParams: URLSearchParams, defaults = { limit: 50, maxLimit: 100 }) {
  const rawLimit = Number.parseInt(searchParams.get('limit') || String(defaults.limit), 10)
  const rawOffset = Number.parseInt(searchParams.get('offset') || '0', 10)
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? defaults.limit : rawLimit, 1), defaults.maxLimit)
  const offset = Math.max(Number.isNaN(rawOffset) ? 0 : rawOffset, 0)
  return { limit, offset }
}

export function maskPhone(value?: string | null) {
  if (!value) return null
  const clean = value.trim()
  if (clean.length <= 4) return '****'
  return `${clean.slice(0, 3)}****${clean.slice(-2)}`
}

export function maskEmail(value?: string | null) {
  if (!value) return null
  const [user, domain] = value.split('@')
  if (!user || !domain) return '[REDACTED]'
  return `${user.slice(0, 2)}***@${domain}`
}

export function maskIc(value?: string | null) {
  if (!value) return null
  const clean = value.replace(/\D/g, '')
  if (clean.length <= 4) return '************'
  return `********${clean.slice(-4)}`
}

export function incomeBand(value?: number | null) {
  if (value == null) return null
  if (value < 1000) return '<1000'
  if (value < 2000) return '1000-1999'
  if (value < 3000) return '2000-2999'
  if (value < 5000) return '3000-4999'
  return '5000+'
}
