# PUSPA-V4 Production Environment Notes

This document lists environment **names and policy only**. Do not commit real values.

## Current status

Bo reported the latest production state as:

- Vercel DB env switched to Supabase pooler.
- Production login works.
- Dashboard APIs return 200.
- `/login` redirect issue patched.
- Production deploy passed.

Always verify before claiming production is healthy.

## Expected env names

- `DATABASE_URL` — Supabase/Postgres pooler URL in production.
- `DIRECT_URL` — direct/non-pooling Postgres URL when Prisma needs it.
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENCLAW_BRIDGE_URL`
- `OPENCLAW_BRIDGE_TOKEN`
- `OPENCLAW_GATEWAY_URL` or `OPENCLAW_BASE_URL`
- `OPENCLAW_GATEWAY_TOKEN` or compatible gateway API key env
- `OPENCLAW_AGENT_MODEL` / `OPENCLAW_MODEL` should resolve to `openclaw/puspacare` for PuspaCareBot behavior.

## Rotation recommendation

Because secrets were previously pasted in chat, rotate if exposed:

- Supabase DB password.
- Vercel token if exposed.
- Bridge token / bot API token if exposed.
- Any Telegram/OpenClaw tokens if exposed.

After rotation: update Vercel env, redeploy, verify login/dashboard, and smoke test bot APIs.
