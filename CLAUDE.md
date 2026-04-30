# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PUSPA V4 is a Next.js 16 NGO management platform with an AI assistant (OpenClaw), SQLite for development and PostgreSQL for production via Prisma 6.

## Common Commands

```bash
# Development
bun run dev              # Start dev server on port 3000 with Turbopack
./node_modules/.bin/next dev -p 3001  # Common local preview when 3000 is busy

# Build & Production
bun run build            # Generate Prisma client + Next.js production build
bun run start            # Start standalone production server

# Database
bun run db:push           # Push Prisma schema (dev with SQLite)
bun run db:seed          # Seed demo data (15 members, 15 cases, etc.)
bun run db:generate      # Regenerate Prisma client

# Linting
bun run lint             # ESLint with Next.js config
```

## Architecture: SPA Routing

Unlike traditional Next.js file-based routing, PUSPA V4 uses a **single root page** (`src/app/page.tsx`) with Zustand-driven SPA routing via `ViewRenderer`:

```
User clicks nav item
  → useAppStore.setView(viewId)
  → ViewRenderer detects currentView change
  → Dynamic import(`@/modules/${viewId}/page`)
  → Module renders with full CRUD + AI
```

All 34 modules are registered in `src/components/view-renderer.tsx` as dynamic imports. Module access is role-gated via `src/lib/access-control.ts`.

## Authentication

The app uses **Supabase Auth** (not NextAuth v4 as the README states — the codebase has been migrated). The middleware (`src/middleware.ts`) handles session refresh via `@supabase/ssr` and protects all routes except:
- `/api/v1/auth/supabase/*` (public auth endpoints)
- `/api/v1/bot/*` (bot API key authentication)
- Static assets and `/login`

## OpenClaw AI System

The AI assistant in `src/lib/openclaw-agent/` has a multi-provider transport layer:
- **OpenClaw** (default) — OpenAI-compatible gateway, usually model `openclaw/puspacare`
- **OpenRouter** — cloud with 200+ models
- **Ollama** — local privacy-first

The chat flow: `OpenClawStore → POST /api/v1/openclaw/chat → build system prompt → call LLM → parse tool calls → execute up to 5 steps → format response → extract memory → save conversation`.

Tool definitions are in `src/lib/openclaw-agent/advanced-tools.ts` (38 tools). Skills system in `src/lib/openclaw-agent/skills.ts`. Memory system in `src/lib/openclaw-agent/memory.ts`.

## Environment Variables

Minimum required in `.env`:
```env
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=change-this
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

For PostgreSQL production:
```env
DATABASE_PROVIDER=postgresql
POSTGRES_PRISMA_URL=postgresql://user:pass@host:5432/puspa
```

## Prisma Schema

Three schema files exist — the build scripts switch between them:
- `prisma/schema.prisma` — SQLite (default for dev)
- `prisma/schema.postgres.prisma` — PostgreSQL

The `vercel-build` script auto-switches schemas when `DATABASE_PROVIDER=postgresql`.

## State Management

Three Zustand stores with persist middleware:
- `puspa-app-state` — currentView, sidebar, role
- `puspa-ai-state` — OpenClaw messages, provider config
- `puspa-ops-state` — Ops Conductor work items

## Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| Staff | `staff@puspa.org.my` | `Staff@2026` |
| Admin | `admin@puspa.org.my` | `Admin@2026` |
| Developer | `dev@puspa.org.my` | `Dev@2026` |

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
