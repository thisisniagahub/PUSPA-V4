# API SURFACE KNOWLEDGE BASE

## OVERVIEW
`src/app/api` is the real HTTP surface. `/api/route.ts` is a trivial placeholder; current application behavior lives under `/api/v1/*`, with Supabase auth endpoints under `/api/v1/auth/supabase/*` and legacy/custom auth routes retained where still wired.

## STRUCTURE
```text
src/app/api/
├── route.ts                 # placeholder root response
├── v1/auth/supabase/        # Supabase login/logout/me/signup/seed
├── v1/auth/                 # legacy/custom auth compatibility endpoints
└── v1/                      # domain routes: donors, ops, tapsecure, openclaw, openclaw, volunteers, ...
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Change login/auth flow | `v1/auth/supabase/*`, `../../lib/supabase/auth.ts`, `../../lib/auth.ts`, `../../middleware.ts` | Supabase is primary; keep fail-closed guard behavior |
| Add business endpoints | `v1/<domain>/route.ts` | Keep versioning explicit |
| Add upload/document handling | `v1/documents/*` and storage helpers | Preserve auth and storage safety; pin Node runtime only when required |
| Change OpenClaw bridge behavior | `v1/openclaw/*`, `../../lib/openclaw.ts` | Preserve graceful fallback payloads |
| Change ops orchestration APIs | `v1/ops/*` | Used by `src/modules/ops-conductor/page.tsx` |

## CONVENTIONS
- New app endpoints go under `v1`; do not grow `route.ts` at the API root.
- Response shape is typically JSON with `success`, plus `data`, `error`, or pagination metadata.
- Request validation uses Zod when bodies are non-trivial; copy that pattern instead of hand-rolling checks.
- Prisma access goes through `@/lib/db`.
- Auth-sensitive endpoints should rely on server session / role helpers from `@/lib/auth`, not client-supplied role fields.
- Auth-sensitive handlers should use `requireAuth`/`requireRole` and avoid trusting client role state.
- OpenClaw endpoints favor resilient fallback responses instead of hard failures when the bridge is offline.

## ANTI-PATTERNS
- Do not put new business handlers in `/api/route.ts`.
- Do not trust client state for authorization or role decisions.
- Do not expose raw provider errors, session details, or API keys in auth/OpenClaw/OpenClaw responses.
- Do not hardcode bridge or gateway URLs in multiple handlers; use env/default constants.
- Do not mix unrelated domain groups into a single route file just because the path is adjacent.

---

---

## Current Alignment Note (2026-04-30)

This document has been aligned with the current PUSPA-V4 workspace at `/mnt/g/PUSPA-V4`:

- Stack: Next.js 16 / React 19 / TypeScript / Prisma 6 / Bun / Tailwind 4 / shadcn-Radix.
- Local dev command in `package.json` remains `bun run dev` on port `3000`; active preview work may run with `./node_modules/.bin/next dev -p 3001` when port 3000 is occupied.
- Auth: Supabase Auth is the primary app flow via `/api/v1/auth/supabase/*`, synced to Prisma users. Legacy/custom auth endpoints may remain for compatibility, but new protected API work should use server-side helpers from `@/lib/auth`.
- Route protection: `src/middleware.ts` is the active guard in this workspace. Next.js warns the middleware convention is deprecated in favor of `proxy`, so future migration should preserve the same fail-closed behavior.
- PUSPA AI/OpenClaw: Z.AI is not supported. Provider defaults should be OpenClaw-compatible, normally `openclaw/puspacare`, with env aliases for both `OPENCLAW_OPENAI_*` and `OPENCLAW_*` names. Do not commit real API keys.
- Validation baseline after the latest alignment: `bun x tsc --noEmit --pretty false` passed and `bun run build` passed.
