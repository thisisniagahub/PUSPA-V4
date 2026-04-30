# PUSPA OpenClaw Bridge Security

Runtime bridge facts to verify on VPS:

```text
Service: puspa-openclaw-bridge.service
Local health: http://127.0.0.1:18181/health
Public route: https://operator.gangniaga.my/puspa-bridge/
```

## Policy

- `/health` may be public/simple, but it must not expose internal metadata.
- All data/action endpoints require server-side `Authorization: Bearer <bridge-token>`.
- CORS is not auth; bearer verification must run server-side.
- Do not use wildcard CORS on protected endpoints.
- Add rate limiting by IP and path.
- Add audit logs for protected requests.
- Never log request bodies for sensitive endpoints.
- Never print token values.

## CORS allowlist

```text
https://puspa.gangniaga.my
https://operator.gangniaga.my
https://puspa-v4.vercel.app  # only while still used
```

## Required audit fields

```text
timestamp
method
path
origin
authorized true/false
status
durationMs
```

## App-side behavior

PUSPA-V4 sends `OPENCLAW_BRIDGE_TOKEN` to the bridge as a bearer token from `src/lib/openclaw.ts`. The bridge itself must verify that token; app headers alone are not a security boundary.
