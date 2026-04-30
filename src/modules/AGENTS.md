# MODULE LAYER KNOWLEDGE BASE

## OVERVIEW
`src/modules` holds the main product screens rendered inside the root shell. These files behave like pages, but most of them are not direct URLs.

## STRUCTURE
```text
src/modules/
├── <business-domain>/page.tsx   # main user-facing module entry
├── openclaw/*                   # developer-only AI Ops views
├── ops-conductor/page.tsx       # orchestration cockpit
└── docs/page.tsx                # in-app operator guide
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add a feature screen | `src/modules/<feature>/page.tsx` | Default export is the screen entry |
| Make a module reachable | `../types/index.ts`, `../components/view-renderer.tsx`, `../components/sidebar/sidebar-config.ts`, optional module `config.ts(x)` | Folder alone is not enough |
| Add role gating | `../lib/access-control.ts`, `../components/sidebar/sidebar-config.ts`, server API guards | Sidebar visibility is not authorization |
| Change OpenClaw developer views | `openclaw/*` | Pairs with `/api/v1/openclaw/*` |
| Change ops conductor | `ops-conductor/page.tsx` | Pairs with `/api/v1/ops/*` |
| Change product guidance/docs | `docs/page.tsx` | Large in-repo guide surface |

## CONVENTIONS
- Module IDs must stay aligned across folder name, `ViewId`, `ViewRenderer`, sidebar items, command palette, and module config files.
- A module screen usually exports one default component from `page.tsx`.
- Many modules are intentionally large container files; only extract shared logic when it will be reused outside the module.
- Shared state, auth, API clients, and domain helpers belong in `src/stores`, `src/lib`, or `src/components`, not duplicated inside multiple modules.
- Developer-only surfaces live under `openclaw/*` and `ops-conductor/page.tsx`; those modules depend on `/api/v1/openclaw/*` and `/api/v1/ops/*`.
- `asnafpreneur` is special: it exists here as a shell module and also under `src/app/asnafpreneur`.
- `docs/page.tsx` is a real source of operator guidance; keep product docs changes close to the module behavior they describe.

## ANTI-PATTERNS
- Do not assume a new folder in `src/modules` is reachable without shell + sidebar wiring.
- Do not move shared primitive styling into modules; use `src/components/ui` or `src/components`.
- Do not change a module ID in one place only.
- Do not turn every module into a separate route segment unless the product explicitly needs a real URL boundary.

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
