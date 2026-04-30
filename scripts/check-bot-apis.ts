const baseUrl = (process.env.PUSPACARE_APP_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const token = process.env.PUSPACARE_BOT_API_KEY

if (!token) {
  console.error('PUSPACARE_BOT_API_KEY is required')
  process.exit(1)
}

const endpoints = ['/api/v1/bot/health', '/api/v1/bot/context', '/api/v1/bot/dashboard']

for (const endpoint of endpoints) {
  const startedAt = Date.now()
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    })
    const payload = await response.json().catch(() => null)
    console.log(JSON.stringify({
      endpoint,
      status: response.status,
      success: Boolean(payload?.success),
      latencyMs: Date.now() - startedAt,
    }))
  } catch (error) {
    console.log(JSON.stringify({
      endpoint,
      status: 0,
      success: false,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : 'Unknown error',
    }))
  }
}
