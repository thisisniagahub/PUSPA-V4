# 🌺 PUSPA V4 — Project Context & Instructions

This file serves as the foundational mandate for all AI agent interactions within the PUSPA-V4 project. It defines the architecture, development standards, and operational workflows of the platform.

---

## 🏛️ Project Overview

**PUSPA V4 (Pertubuhan Urus Peduli Asnaf)** is an AI-integrated NGO management platform built for the Malaysian NGO PUSPA. It automates daily operations, case processing, and regulatory compliance for asnaf (needy) community services.

### Core Architecture
- **Next.js 16 (App Router):** High-performance React framework.
- **SPA Routing:** Unlike traditional Next.js file-based routing, PUSPA V4 uses a **single root page (`/`)** with a Zustand-driven `ViewRenderer` that dynamically imports module pages.
- **State Management:** Zustand (with persistence) handles global app state, sidebar, views, and AI session state.
- **ORM:** Prisma 6 with multi-DB URL resolution (SQLite for dev, PostgreSQL for prod).
- **Styling:** Tailwind CSS 4 with a Zinc/Emerald/Black design system.
- **AI Engine (PUSPA AI/OpenClaw):** OpenClaw-first assistant using model `openclaw/puspacare` integrated via OpenClaw Gateway. Optimized for multi-channel NGO operations with a modern UI shell. Z.AI is intentionally unsupported.

---

## 🚀 Building and Running

### Development
- **Prerequisites:** Node.js ≥ 18, Bun ≥ 1.0.
- **Install:** `bun install`
- **Environment:** `cp .env.example .env` (Ensure `DATABASE_URL`, `OPENCLAW_GATEWAY_URL`, and `OPENCLAW_GATEWAY_TOKEN` are set).
- **Database Setup:** `bun run db:push` then `bun run db:seed`.
- **Run:** `bun run dev` (port `3000`) or `./node_modules/.bin/next dev -p 3001` for the current local preview when port 3000 is occupied.

### Production
- **Build:** `bun run build` (Generates Prisma client and standalone Next.js build).
- **Start:** `bun run start`.
- **PostgreSQL Migration:** Set `DATABASE_PROVIDER=postgresql` and use `bun run db:push`.

---

## 🛠️ Development Conventions

### Code Style & Patterns
- **TypeScript Strict:** All code must be strictly typed. Avoid `any`.
- **Component Slots:** Use the `PluginSlot` and `ViewRenderer` patterns for module extensibility.
- **Client/Server Boundaries:** Use `'use client'` and `'use server'` directives appropriately. Most module pages are client components rendered via `ViewRenderer`.
- **UI Components:** Use **shadcn/ui** primitives (Radix UI) located in `src/components/ui`.
- **API First:** Backend logic should reside in `src/app/api/v1`. Avoid complex logic in server actions unless necessary for simple form submissions.
- **Password Security:** Use the custom `scrypt` hashing implementation in `src/lib/password.ts` (not bcrypt).

### Module Development
- Modules are located in `src/modules/{viewId}`.
- Add new views to `viewLabels` in `src/types/index.ts` and `sidebar-config.ts`.
- Module pages are lazily loaded. Ensure they export a default component.

### OpenClaw AI Integration
- **Gateway First:** Integration is managed via the OpenClaw Gateway at `operator.gangniaga.my`.
- **UI Layer:** Chat interface and execution traces are managed in `src/components/openclaw-agent`.
- **State:** AI session and provider configuration are stored in `src/stores/openclaw-store.ts`.
- **Tooling:** All future database tools must be registered through the OpenClaw Gateway or the specific API handlers in `src/app/api/v1/openclaw`.

### Database Operations
- **Prisma Client:** Always import `db` from `@/lib/db`.
- **Audit Logs:** Use `writeAuditLog` from `@/lib/audit.ts` for all sensitive write operations.

---

## 📂 Key Directory Map

- `src/app/api/v1`: REST API endpoints (80+ routes).
- `src/modules`: Feature modules (lazy-loaded SPA "pages").
- `src/lib/openclaw-agent`: AI Assistant provider types and quick actions.
- `src/components/openclaw-agent`: React components for the AI interface.
- `src/stores`: Zustand global state management.
- `src/components/ui`: Shared shadcn/ui components.
- `prisma/`: Database schemas (SQLite and PostgreSQL variants).

---

## 🤖 AI Agent Guidelines

1. **Context Awareness:** When working on a module, check `src/modules/AGENTS.md`, `src/components/sidebar/sidebar-config.ts`, `src/components/view-renderer.tsx`, and any relevant module config file.
2. **Safety:** Never expose `psbot_*` keys or session secrets.
3. **Bilingual Support:** UI labels should prefer Bahasa Melayu with English fallbacks. AI responses should detect user language.
4. **Tool Integrity:** Ensure any new database models are reflected in the corresponding API routes used by the OpenClaw Gateway.

---

<div align="center">

**PUSPA V4 — Cerdas. Mesra. Sentiasa di sisi anda.**

</div>

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
