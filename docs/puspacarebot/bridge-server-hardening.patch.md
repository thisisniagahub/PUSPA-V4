# Bridge Server Hardening Patch Guide

The bridge server source was not found inside `/mnt/g/PUSPA-V4`; apply this to the VPS/source-of-truth that runs `puspa-openclaw-bridge.service`.

## Required behavior

```text
GET /health -> 200 { ok: true } with no internal metadata
GET/POST /snapshot without token -> 401
GET/POST protected endpoint with invalid token -> 401
GET/POST protected endpoint with valid token -> allowed
```

## Pseudocode

```ts
const allowedOrigins = new Set([
  'https://puspa.gangniaga.my',
  'https://operator.gangniaga.my',
  'https://puspa-v4.vercel.app',
])

function corsFor(origin?: string) {
  if (!origin || !allowedOrigins.has(origin)) return {}
  return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
}

function assertBearer(req) {
  const expected = process.env.PUSPA_OPENCLAW_BRIDGE_TOKEN || process.env.OPENCLAW_BRIDGE_TOKEN
  const auth = req.headers.authorization || ''
  const supplied = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!expected || !supplied || !constantTimeEqual(supplied, expected)) throw unauthorized
}
```

Keep `/health` separate from protected data/action endpoints.
