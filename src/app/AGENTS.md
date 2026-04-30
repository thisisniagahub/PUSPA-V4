# APP ROUTER KNOWLEDGE BASE

## OVERVIEW
`src/app` is a thin App Router layer: `/` is the authenticated shell, `/login` handles credentials, `/asnafpreneur` is the only extra real page route, and `/api/*` hosts HTTP handlers.

## STRUCTURE
```text
src/app/
├── layout.tsx          # global fonts + providers
├── page.tsx            # authenticated shell and module switcher
├── login/page.tsx      # credentials login UI
├── asnafpreneur/page.tsx
└── api/                # auth route, placeholder root API, v1 endpoints
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Change global providers or fonts | `layout.tsx` | Keep it thin; no feature logic |
| Change shell rendering | `page.tsx` | Dynamic imports, `viewLabels`, `ViewRenderer` |
| Add a new internal screen | `page.tsx` plus `src/modules/*` | Most screens do not become routes |
| Change login UX | `login/page.tsx` | Credentials flow only |
| Change route protection | `../middleware.ts`, `../lib/auth.ts` | `middleware.ts` is active now; plan future Next.js `proxy` migration carefully |

## CONVENTIONS
- `page.tsx` is a SPA-like shell inside App Router; it reads `currentView` from Zustand and renders modules dynamically.
- New internal features usually belong in `src/modules/*`, not as new `src/app/<segment>/page.tsx`.
- If a module becomes selectable from the shell, update `ViewId`, `viewLabels`, `ViewRenderer`, module config where present, and `src/components/sidebar/sidebar-config.ts` together.
- `layout.tsx` owns `AuthProvider` and `ThemeProvider`; keep page-specific state out of it.
- `page.tsx` redirects unauthenticated users to `/login`; do not duplicate auth gating ad hoc in module files.
- `asnafpreneur` is special because it exists both as a dedicated route and as a shell view.

## ANTI-PATTERNS
- Do not add a filesystem route when the feature is supposed to live behind sidebar navigation.
- Do not bury feature-specific API calls or business rules in `layout.tsx`.
- Do not treat old `src/proxy.ts.bak` notes as active. `src/middleware.ts` currently owns route guard behavior; migrate to `proxy` only as a deliberate compatibility task.
- Do not rename module IDs in `page.tsx` without updating `src/types/index.ts` and `src/components/app-sidebar.tsx`.

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
