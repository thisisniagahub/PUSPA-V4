# Task 2 - Rebrand HermesFab to PUSPA AI Assistant

## Summary
Rebranded the `HermesFab` component from emerald "Hermes" styling to purple/violet "PUSPA AI Assistant" theme.

## Changes Made to `/mnt/g/PUSPA-V4/src/components/hermes/hermes-fab.tsx`

1. **Shape**: `rounded-2xl` → `rounded-full` on button + pulse ring (circular FAB)
2. **Background gradient**: `#7c3aed → #9333ea → #6d28d9` (violet-600/purple range) replacing emerald
3. **Pulse ring**: `bg-violet-400/30` replacing `bg-emerald-400/30`
4. **Focus ring**: `focus:ring-violet-400` replacing `focus:ring-emerald-400`
5. **Icon**: `Flower2` (PUSPA flower) replacing `Sparkles`
6. **aria-label**: "Buka PUSPA AI" replacing "Buka Hermes AI"
7. **Green online dot**: Added in bottom-right corner when closed (ping + solid circle with white border)
8. **Provider indicator**: Moved to bottom-left (`-left-1`) to avoid overlap with green dot

## Preserved
- Same component name and export (`HermesFab`)
- Unread badge with red count
- All Framer Motion animations (spring entry, hover/tap scale, icon rotation transitions)
- AnimatePresence for smooth icon/badge transitions

---

## Current Alignment Note (2026-04-30)

This historical agent context is retained for traceability, but the current active PUSPA-V4 baseline is:

- Repo root: `/mnt/g/PUSPA-V4`.
- Local preview: usually `./node_modules/.bin/next dev -p 3001` when port 3000 is busy.
- Auth: Supabase Auth is primary via `/api/v1/auth/supabase/*`, synced to Prisma users; protected routes should use server-side auth helpers.
- Route guard: `src/middleware.ts` is active in this workspace; Next.js middleware-to-proxy migration remains a future compatibility task.
- PUSPA AI/Hermes: OpenClaw-first, no Z.AI fallback. Current app env should include redacted aliases for both `HERMES_OPENAI_*` and `OPENCLAW_*`, with model `openclaw/puspacare`.
- Validation baseline: `bun x tsc --noEmit --pretty false` and `bun run build` passed after the latest alignment fixes.
