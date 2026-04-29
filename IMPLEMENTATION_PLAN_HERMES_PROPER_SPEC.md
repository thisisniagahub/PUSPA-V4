# PUSPA-V4 Whole Project Implementation Plan

> **For Hermes:** Use `subagent-driven-development` skill to implement this plan task-by-task. Dispatch a fresh subagent per task, then run spec-compliance review and code-quality review before moving to the next task.

**Goal:** Stabilize and complete the whole PUSPA-V4/PuspaCare project, fix critical security/build/repo-health issues, and implement Hermes Agent integration properly according to Hermes Agent conventions and PuspaCareBot operating spec.

**Architecture:** PUSPA-V4 is a Next.js 16 / React 19 / TypeScript / Prisma / Supabase application with a module-based authenticated shell under `src/app/page.tsx`, API surface under `src/app/api/v1/*`, domain screens under `src/modules/*`, shared helpers under `src/lib/*`, and agent/Hermes surfaces under `src/components/hermes/*`, `src/lib/hermes/*`, and API endpoints. Hermes Agent must be integrated as a safe app feature: authenticated, role-gated, provider-agnostic, auditable, sanitized, and not dependent on Z.AI.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, Prisma, Supabase Auth/Storage, Zustand, Tailwind/shadcn/Radix, Bun/npm scripts, Hermes Agent concepts/tools/skills, OpenClaw bridge where applicable.

**Historical Review Baseline (2026-04-28, superseded by 2026-04-30 alignment notes):**
- Repo root: `/mnt/g/PUSPA-V4`
- Branch: `main`
- Dependency state: `node_modules` missing during review.
- Historical: `npm run lint` failed because `eslint` was not installed/resolved at review time.
- Current: `bun x tsc --noEmit --pretty false` passes after dependency/schema alignment.
- Current: `bun run build` passes locally.
- Metrics: ~712 files, ~94,301 code LOC.
- Working tree: very large churn, ~288 changed files and ~72k insertions/deletions.
- Primary blockers discovered: unauthenticated users API, role escalation risk, shell renders anonymous users, client-only module gating, Hermes XSS risk, `z-ai-web-dev-sdk` still present, production start mismatch, line-ending churn, tracked backup/scratch files.

---

## Non-Negotiable Implementation Rules

1. **Do not overwrite unrelated work.** Inspect `git status --short` before each task.
2. **Do not reformat the whole repo.** Normalize line endings only in a dedicated task/commit.
3. **Do not edit secrets into the repo.** Use env vars and redacted docs.
4. **Do not trust client-side role, Zustand state, sidebar visibility, or command palette filtering as authorization.** Server/API and shell render boundaries must enforce role.
5. **Remove Z.AI fully.** `z-ai-web-dev-sdk` must not remain as dependency or fallback because the owner has no Z.AI API key.
6. **Hermes Agent integration must be safe by default:** authenticated, role-gated, sanitized markdown, auditable tool calls, provider allowlist, no arbitrary shell exposure to normal users.
7. **Validation after meaningful code changes:** run at minimum `bun install`, `bun run lint`, `bun x tsc --noEmit --pretty false`, and `bun run build` once dependency state is repaired.
8. **Use subagents for implementation:** each task gets an implementer, then a spec reviewer, then a quality reviewer.

---

## Target Hermes Agent Specification for PUSPA-V4

Hermes inside PUSPA-V4 must behave as an app-integrated agent layer, not an unsafe raw chat box.

### Identity and Modes

Hermes/PuspaCareBot must understand these mode boundaries:

- **User/Care Mode:** warm Malay/Manglish support, no internal paths/secrets/logs, collect only needed details.
- **Admin/Operator Mode:** dashboard/case/donor/disbursement/compliance assistance, evidence-based, role-aware.
- **Developer Mode:** code/debug/build/deploy/planning tasks only for developer/admin role, with audit logs and explicit confirmation for destructive operations.

### Required Hermes Capabilities

- Authenticated chat endpoint.
- Role-gated model/tool access.
- Provider abstraction without Z.AI dependency.
- OpenClaw/Hermes provider support through configured URL/env.
- Safe markdown rendering with sanitization.
- Conversation persistence scoped to authenticated user/role/org where applicable.
- Tool registry with explicit allowlist per role.
- Audit logs for prompts, provider calls, tool calls, errors, and admin/developer actions.
- Graceful fallback when bridge/provider is offline.
- No exposure of secrets, tokens, env values, server paths, stack traces, or raw tool outputs to unauthorized users.

### Required Hermes Files / Areas

- `src/lib/hermes/provider-types.ts`
- `src/lib/hermes/providers.ts`
- `src/lib/hermes/tools.ts`
- `src/lib/hermes/skills.ts`
- `src/lib/hermes/prompt.ts`
- `src/lib/hermes/memory.ts`
- `src/lib/hermes/advanced-tools.ts`
- `src/app/api/v1/hermes/chat/route.ts`
- `src/app/api/v1/hermes/config/route.ts`
- `src/app/api/v1/hermes/conversations/route.ts`
- `src/app/api/v1/hermes/skills/route.ts`
- `src/components/hermes/*`
- `src/stores/hermes-store.ts`
- `src/modules/ai/page.tsx`
- `src/modules/openclaw/*`
- `src/modules/ops-conductor/page.tsx`

---

## Phase 0 — Freeze Scope and Clean Review Noise

### Task 0.1: Capture Current State Snapshot

**Objective:** Record the current dirty repo state before changing anything.

**Files:**
- Create: `docs/implementation/current-state-2026-04-28.md`

**Steps:**
1. Run:
   ```bash
   cd /mnt/g/PUSPA-V4
   git status --short > /tmp/puspa-status.txt
   git branch --show-current > /tmp/puspa-branch.txt
   git log --oneline -5 > /tmp/puspa-log.txt
   git diff --stat > /tmp/puspa-diff-stat.txt
   ```
2. Create a markdown note summarizing branch, latest commits, changed file count, and validation blockers.
3. Do not commit yet unless owner requests.

**Verification:**
```bash
test -f docs/implementation/current-state-2026-04-28.md
```

### Task 0.2: Add Repo EOL Policy

**Objective:** Prevent Windows/WSL CRLF/LF churn from hiding real changes.

**Files:**
- Create/Modify: `.gitattributes`

**Implementation:**
```gitattributes
# Default text normalization
* text=auto

# Source/config/docs should use LF
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.mjs text eol=lf
*.cjs text eol=lf
*.json text eol=lf
*.md text eol=lf
*.css text eol=lf
*.scss text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
*.prisma text eol=lf
*.sql text eol=lf
*.sh text eol=lf

# Windows scripts keep CRLF if any are added later
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf

# Binary/package artifacts
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.webp binary
*.ico binary
*.pdf binary
*.zip binary
*.lockb binary
```

**Verification:**
```bash
git diff -- .gitattributes
```

### Task 0.3: Remove Backup/Scratch Files From Tracking

**Objective:** Remove tracked backup and scratch files that confuse reviews and may contain stale logic.

**Files:**
- Modify: `.gitignore`
- Remove from tracking if present:
  - `prisma/schema.prisma.backup`
  - `prisma/schema.prisma.new`
  - `src/lib/bot-auth.ts.backup`
  - `src/modules/cases/page.tsx.backup`
  - `src/app/api/v1/cases/route.ts.backup`

**Implementation:**
Add to `.gitignore`:
```gitignore
# Local scratch/backup artifacts
*.bak
*.backup
*.tmp
*.old
*.new
bot-plain-secret.txt
bot-raw-key.txt
```

Run:
```bash
git rm --cached prisma/schema.prisma.backup prisma/schema.prisma.new src/lib/bot-auth.ts.backup src/modules/cases/page.tsx.backup src/app/api/v1/cases/route.ts.backup 2>/dev/null || true
```

**Verification:**
```bash
git status --short | grep -E 'backup|\.new|\.bak' || true
```
Expected: no tracked source-adjacent backup files except intentional deletions.

### Task 0.4: Decide `skills/**` Ownership

**Objective:** Resolve conflict where `.gitignore` ignores `/skills/` but many skills are tracked and modified.

**Files:**
- Modify: `.gitignore`
- Create: `docs/implementation/skills-ownership.md`

**Decision Options:**
- **Option A (recommended for app repo):** untrack `skills/**`, treat as external/vendor data.
- **Option B:** intentionally track `skills/**`, remove `/skills/` from `.gitignore`, document provenance and update workflow.

**Implementation:**
Document chosen option. Do not mass-delete until owner approves.

**Verification:**
```bash
git status --short -- skills | head -20
```

---

## Phase 1 — Dependency, Package, and Build Foundation

### Task 1.1: Remove Z.AI Dependency Completely

**Objective:** Fully remove `z-ai-web-dev-sdk` and any Z.AI fallback/provider path.

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`
- Modify: `src/lib/hermes/providers.ts`
- Modify: `src/lib/hermes/provider-types.ts`
- Search/modify any references under `src/lib/hermes/**`, `src/app/api/v1/hermes/**`, docs.

**Steps:**
1. Search:
   ```bash
   grep -R "z-ai\|z_ai\|ZAI\|GLM\|z-ai-web-dev-sdk" -n src package.json bun.lock || true
   ```
2. Remove `"z-ai-web-dev-sdk"` from `package.json`.
3. Remove dynamic import/provider fallback from `src/lib/hermes/providers.ts`.
4. Remove provider enum/type values if they exist solely for Z.AI.
5. Regenerate lockfile after dependencies are available:
   ```bash
   bun install
   ```

**Acceptance Criteria:**
- `package.json` has no `z-ai-web-dev-sdk`.
- `src/lib/hermes/providers.ts` does not import or dynamically import it.
- Hermes config does not advertise Z.AI as fallback.
- Search returns no active code references.

**Verification:**
```bash
grep -R "z-ai-web-dev-sdk\|from 'z-ai\|from \"z-ai" -n package.json bun.lock src || true
```
Expected: no active references.

### Task 1.2: Repair Dependency Install

**Objective:** Restore local `node_modules` and make lint/typecheck/build runnable.

**Files:**
- Modify: `bun.lock` only if dependency graph changes.

**Steps:**
```bash
cd /mnt/g/PUSPA-V4
bun install
```

If `bun install --frozen-lockfile` fails because package and lock are inconsistent, run plain `bun install` once and review lockfile diff.

**Verification:**
```bash
test -x node_modules/.bin/eslint
test -x node_modules/.bin/tsc
```

### Task 1.3: Fix Production Start Configuration

**Objective:** Ensure production start command matches Next.js output mode.

**Files:**
- Modify: `next.config.ts`
- Modify: `package.json` if needed.

**Preferred Implementation:**
Add standalone output if deployment expects `.next/standalone/server.js`:
```ts
const nextConfig = {
  output: 'standalone',
  // existing config remains here
}

export default nextConfig
```

Alternative: change start script to a supported `next start` flow.

**Verification:**
```bash
npm run build
ls .next/standalone/server.js .next/standalone/PUSPA-V4/server.js 2>/dev/null || true
```
At least one expected standalone server entry must exist or start script must not reference standalone.

### Task 1.4: Fix Hardcoded Script Paths

**Objective:** Make dev/start scripts portable.

**Files:**
- Modify: `start-dev.sh`
- Modify: `daemon-start.sh`
- Review: `.zscripts/*.sh`, `keep-alive.sh`, `daemon-start.sh`

**Implementation Pattern:**
```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
```

**Verification:**
```bash
bash -n start-dev.sh daemon-start.sh
```

---

## Phase 2 — Critical Authentication and Authorization

### Task 2.1: Lock Down Users API

**Objective:** Ensure all `/api/v1/users` methods require server-side admin/developer authorization.

**Files:**
- Modify: `src/app/api/v1/users/route.ts`
- Possibly modify: `src/lib/auth.ts`

**Required Behavior:**
- GET users: admin/developer only.
- POST create user: admin/developer only, with role assignment policy.
- PUT update user: admin/developer only.
- DELETE/deactivate user: admin/developer only.
- No client-supplied role can bypass server policy.

**Implementation Pattern:**
```ts
import { requireRole, AuthorizationError } from '@/lib/auth'

const ADMIN_ROLES = ['admin', 'developer'] as const

export async function GET(request: Request) {
  try {
    await requireRole(request, ADMIN_ROLES)
    // existing logic
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return Response.json({ success: false, error: error.message }, { status: error.status })
    }
    throw error
  }
}
```

**Acceptance Criteria:**
- Every exported method begins with server auth/role guard.
- Unauthorized requests receive 401/403.
- Tests or smoke scripts cover unauthenticated and authorized cases.

**Verification:**
```bash
npm run lint -- src/app/api/v1/users/route.ts
npx tsc --noEmit
```

### Task 2.2: Centralize Role Validation and Assignment Policy

**Objective:** Prevent role escalation through request bodies.

**Files:**
- Create/Modify: `src/lib/roles.ts`
- Modify: `src/app/api/v1/users/route.ts`
- Modify: `src/app/api/v1/auth/supabase/signup/route.ts`
- Modify: any route that accepts `role` from body.

**Implementation Example:**
```ts
import { z } from 'zod'

export const appRoleSchema = z.enum(['staff', 'admin', 'developer'])
export type AppRole = z.infer<typeof appRoleSchema>

export function canAssignRole(actorRole: AppRole, targetRole: AppRole): boolean {
  if (actorRole === 'developer') return true
  if (actorRole === 'admin') return targetRole === 'staff' || targetRole === 'admin'
  return false
}
```

**Acceptance Criteria:**
- Invalid role strings rejected.
- Admin cannot create developer unless explicitly allowed by business policy.
- Staff cannot assign roles.

**Verification:**
```bash
grep -R "role.*as AppRole\|body.role\|data.role" -n src/app/api src/lib | head -50
```
No unsafe role assignment should remain.

### Task 2.3: Enforce Shell Redirect for Anonymous Users

**Objective:** Prevent anonymous rendering of authenticated shell.

**Files:**
- Modify: `src/app/page.tsx`

**Required Behavior:**
- While auth loading: show loading shell.
- If `user === null` after loading/mounted: `router.replace('/login')` and render loading/null.
- Do not assign fallback staff role to anonymous users.

**Implementation Pattern:**
```tsx
const router = useRouter()

useEffect(() => {
  if (!loading && mounted && !user) {
    router.replace('/login')
  }
}, [loading, mounted, user, router])

if (!mounted || loading || !user) {
  return <LoadingShell />
}
```

**Verification:**
- Anonymous visit to `/` redirects to `/login`.
- Authenticated user sees shell.

### Task 2.4: Gate ViewRenderer Server-Truth Role

**Objective:** Prevent client state from rendering unauthorized modules.

**Files:**
- Modify: `src/components/view-renderer.tsx`
- Modify: `src/app/page.tsx` if role prop must be passed.
- Modify: `src/lib/access-control.ts`

**Required Behavior:**
- ViewRenderer receives `role` or authenticated user role.
- Before dynamic rendering, check `canAccessView(role, currentView)`.
- Unauthorized view renders clear fallback and optionally resets to dashboard.

**Implementation Pattern:**
```tsx
if (!canAccessView(role, currentView)) {
  return <UnauthorizedView attemptedView={currentView} />
}
```

**Verification:**
- Staff cannot render admin/developer views by mutating Zustand.
- Admin/developer views remain accessible to allowed roles.

### Task 2.5: Sync Sidebar, Command Palette, and Access-Control Matrix

**Objective:** Ensure module visibility and render permissions use one source of truth.

**Files:**
- Modify: `src/lib/access-control.ts`
- Modify: `src/components/sidebar/sidebar-config.ts`
- Modify: `src/components/command-palette.tsx`
- Modify: `src/types/index.ts` if needed.

**Required Fixes:**
- Add `admin: ['admin', 'developer']` or equivalent to access requirements.
- Ensure `openclaw-*`, `ops-conductor`, and developer tools are developer-only unless policy says admin too.
- Ensure command palette cannot list unauthorized modules.

**Verification:**
```bash
grep -R "admin\|openclaw-graph\|ops-conductor" -n src/lib/access-control.ts src/components/sidebar/sidebar-config.ts src/components/command-palette.tsx src/types/index.ts
```

### Task 2.6: Rate Limit Password Auth Routes

**Objective:** Add brute-force protection to active login routes.

**Files:**
- Modify: `src/app/api/v1/auth/supabase/login/route.ts`
- Modify: `src/app/api/v1/auth/login/route.ts`
- Reuse/modify: `src/lib/rate-limit.ts`

**Required Behavior:**
- Limit by IP and optionally email.
- Return generic error messages.
- Include rate-limit headers where practical.

**Verification:**
- Repeated bad login attempts eventually receive 429.
- Valid login after normal use still works.

### Task 2.7: Disable or Remove Seed Routes in Production

**Objective:** Prevent default privileged account creation in production.

**Files:**
- Modify: `src/app/api/v1/auth/supabase/seed/route.ts`
- Modify: `src/lib/supabase/auth.ts`
- Modify: `scripts/seed-users.ts`

**Required Behavior:**
- Seed route returns 404/403 in production.
- Default passwords are not hardcoded for production.
- Seed credentials come from env or generated one-time values.

**Verification:**
```bash
grep -R "Admin@2026\|Dev@2026\|Staff@2026\|supabase_auth_managed" -n src scripts prisma || true
```
Expected: no production-active defaults.

---

## Phase 3 — Hermes Agent Proper Implementation

### Task 3.1: Define Hermes Provider Contract

**Objective:** Make provider abstraction explicit, typed, and provider-agnostic.

**Files:**
- Modify: `src/lib/hermes/provider-types.ts`
- Modify: `src/lib/hermes/providers.ts`

**Required Provider Types:**
- `openclaw` / OpenAI-compatible local gateway.
- `openai` if configured.
- `openrouter` if configured.
- `mock` for dev/test only.
- No `z-ai` provider.

**Required Interface:**
```ts
export interface HermesChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
}

export interface HermesProviderRequest {
  model: string
  messages: HermesChatMessage[]
  temperature?: number
  maxTokens?: number
  tools?: HermesToolDefinition[]
  signal?: AbortSignal
}

export interface HermesProviderResponse {
  content: string
  model: string
  provider: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
  raw?: unknown
}
```

**Acceptance Criteria:**
- Provider code is free of Z.AI.
- Env/config missing results in clear safe error.
- Provider errors are redacted before returning to UI.

### Task 3.2: Implement OpenClaw/OpenAI-Compatible Hermes Provider

**Objective:** Route Hermes chat through configured OpenAI-compatible endpoint safely.

**Files:**
- Modify: `src/lib/hermes/providers.ts`
- Modify: `src/app/api/v1/hermes/config/route.ts`
- Update env docs if present.

**Required Env:**
```env
HERMES_PROVIDER=openclaw
HERMES_OPENAI_BASE_URL=http://127.0.0.1:18789/v1
HERMES_OPENAI_API_KEY=...
HERMES_MODEL=openclaw/main
```

**Implementation Requirements:**
- Use server-side env only.
- Never return API key to client.
- Timeout provider requests.
- Redact provider error details.
- Support graceful offline response for OpenClaw bridge/gateway.

**Verification:**
- With configured env, `/api/v1/hermes/chat` returns a model response.
- Without env, endpoint returns safe configuration error.

### Task 3.3: Secure Hermes Chat Endpoint

**Objective:** Make `/api/v1/hermes/chat` authenticated, role-gated, validated, and auditable.

**Files:**
- Modify: `src/app/api/v1/hermes/chat/route.ts`
- Modify: `src/lib/hermes/prompt.ts`
- Modify: `src/lib/audit.ts` or relevant audit helper.

**Required Behavior:**
- Require authenticated user.
- Determine role from server session, not body.
- Validate request body with Zod.
- Build system prompt based on mode and role.
- Apply provider/tool allowlist based on role.
- Save/audit conversation metadata.
- Return redacted errors.

**Request Schema Example:**
```ts
const chatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(12000),
  mode: z.enum(['care', 'operator', 'developer']).default('care'),
  selectedRecordId: z.string().optional(),
})
```

**Role Policy:**
- `staff`: care/operator basic, no developer tools.
- `admin`: operator, limited admin tools, no arbitrary shell.
- `developer`: developer mode and advanced tools.

**Verification:**
- Unauthenticated POST returns 401.
- Staff cannot request developer mode/tools.
- Developer can use developer mode.

### Task 3.4: Implement Hermes Tool Allowlist and Permission Boundary

**Objective:** Stop unsafe broad tool exposure and dynamic model access.

**Files:**
- Modify: `src/lib/hermes/tools.ts`
- Modify: `src/lib/hermes/advanced-tools.ts`
- Modify: `src/lib/hermes/types.ts`

**Required Tool Policy:**
```ts
const HERMES_TOOL_POLICY = {
  staff: ['search_knowledge', 'summarize_case_public'],
  admin: ['search_knowledge', 'summarize_case', 'draft_report', 'triage_case'],
  developer: ['search_knowledge', 'summarize_case', 'draft_report', 'triage_case', 'inspect_system_status'],
} as const
```

**Rules:**
- No raw shell/browser/db mutation tool exposed from app chat.
- Every tool declares: name, description, inputSchema, roles, handler.
- Every handler re-checks role server-side.
- Audit every tool call.

**Verification:**
- Search for `(db as any)[model]` and remove or isolate behind typed dispatch.
- Staff cannot execute admin/developer tools.

### Task 3.5: Split and Type Hermes Advanced Tools

**Objective:** Replace monolithic unsafe Hermes advanced tool registry.

**Files:**
- Modify: `src/lib/hermes/advanced-tools.ts`
- Optionally create:
  - `src/lib/hermes/tools/cases.ts`
  - `src/lib/hermes/tools/donors.ts`
  - `src/lib/hermes/tools/reports.ts`
  - `src/lib/hermes/tools/ops.ts`

**Required Changes:**
- Replace `(db as any)[model]` with typed functions per domain.
- Remove count+1 ID generation; use existing sequence helper or DB transaction counter.
- Keep tool outputs minimal and role-safe.

**Verification:**
```bash
grep -R "db as any\|count() + 1\|count+1" -n src/lib/hermes src/lib || true
```

### Task 3.6: Implement Hermes Conversation Persistence Safely

**Objective:** Store conversations scoped to authenticated user and redact sensitive data.

**Files:**
- Modify: `src/lib/hermes/memory.ts`
- Modify: `src/app/api/v1/hermes/conversations/route.ts`
- Modify Prisma schema only if required.

**Requirements:**
- Conversations have owner/userId.
- Admin/developer cannot read other users unless explicitly authorized.
- Do not store raw secrets/tool credentials.
- Support delete/export if practical.

**Verification:**
- User A cannot fetch User B conversation by ID.
- Conversation list returns only allowed records.

### Task 3.7: Make Hermes Prompt Match PuspaCareBot Spec

**Objective:** Ensure Hermes/PuspaCareBot identity and mode behavior follow spec.

**Files:**
- Modify: `src/lib/hermes/prompt.ts`
- Modify: `src/lib/hermes/module-descriptions.ts`
- Optionally create: `docs/PUSPACAREBOT_SPEC.md`

**Prompt Requirements:**
- Bo/TeddyBo is owner; do not call user PuspaCareBot.
- PuspaCare app vs PuspaCareBot separation.
- User/Admin/Developer modes.
- Malay/Manglish support style for user-facing responses.
- 🦞 friendly gremlin style for PuspaCareBot where appropriate.
- No internal secrets/paths/logs to normal users.
- Developer mode requires role and safe workflow.

**Verification:**
- Prompt unit snapshot or manual endpoint smoke test shows correct identity and boundaries.

### Task 3.8: Sanitize Hermes Message Rendering

**Objective:** Remove XSS risk from Hermes UI.

**Files:**
- Modify: `src/components/hermes/hermes-message.tsx`
- Modify: `src/components/hermes/hermes-message-v2.tsx`
- Modify: `package.json` if adding sanitizer dependency.

**Preferred Implementation:**
Use `react-markdown` with `rehype-sanitize` or DOMPurify. If adding dependency:
```bash
bun add rehype-sanitize
```

**Rules:**
- Never inject unsanitized model/tool/user content via `dangerouslySetInnerHTML`.
- If HTML rendering is needed, allow only safe tags.
- Links must use safe protocols only: http, https, mailto if needed.

**Verification:**
- Test message with `<img src=x onerror=alert(1)>` renders harmless text/no handler.
- No unsafe `dangerouslySetInnerHTML` remains in Hermes message components.

### Task 3.9: Harden Hermes Skills Endpoint

**Objective:** Ensure skills list/config cannot expose server filesystem or secrets.

**Files:**
- Modify: `src/app/api/v1/hermes/skills/route.ts`
- Modify: `src/lib/hermes/skills.ts`

**Requirements:**
- Auth required.
- Role-gated access to developer/internal skills.
- Do not expose absolute server paths to staff/user mode.
- Return curated skill metadata only.

**Verification:**
- Staff request gets only allowed public/operator skills.
- Developer request gets expanded list if policy allows.

### Task 3.10: Add Hermes Audit Events

**Objective:** Make Hermes actions traceable.

**Files:**
- Modify: `src/lib/audit.ts`
- Modify: `src/app/api/v1/hermes/chat/route.ts`
- Modify: `src/lib/hermes/tools.ts`

**Audit Events:**
- `hermes.chat.request`
- `hermes.chat.response`
- `hermes.chat.error`
- `hermes.tool.call`
- `hermes.tool.denied`
- `hermes.provider.error`

**Fields:**
- userId, role, mode, provider, model, conversationId, toolName, status, durationMs.
- Redact prompt content or store only controlled summary depending privacy policy.

**Verification:**
- Chat request writes audit log.
- Denied tool writes audit log.

---

## Phase 4 — API/Data/Upload Security

### Task 4.1: Align Prisma Schema Variants

**Objective:** Remove schema drift around roles/defaults.

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/schema.sqlite.prisma`
- Modify: `prisma/schema.postgres.prisma` only if generated workflow requires.

**Required Fix:**
- Align `UserRole` enum/defaults across active schemas.
- Avoid `role String default "ops"` if canonical app roles are `staff/admin/developer`.

**Verification:**
```bash
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.sqlite.prisma
npx prisma validate --schema prisma/schema.postgres.prisma
```

### Task 4.2: Harden Upload Validation

**Objective:** Prevent spoofed/SVG/active file uploads.

**Files:**
- Modify: `src/lib/uploads.ts`
- Modify API upload routes if any.

**Requirements:**
- Validate file magic bytes.
- Disallow SVG unless sanitized and explicitly needed.
- Enforce size limits server-side.
- Serve downloads with `Content-Disposition` and `X-Content-Type-Options: nosniff`.

**Verification:**
- Fake `.jpg` with text content rejected.
- SVG upload rejected for eKYC image.

### Task 4.3: Review All Auth-Sensitive API Routes

**Objective:** Ensure every sensitive endpoint has server auth/role guard.

**Files:**
- Review/modify: `src/app/api/v1/**/route.ts`

**Method:**
1. Generate route inventory.
2. Classify route as public/authenticated/admin/developer.
3. Add guards accordingly.
4. Document in `docs/implementation/api-auth-matrix.md`.

**Verification:**
```bash
grep -R "export async function" -n src/app/api/v1 | wc -l
grep -R "requireAuth\|requireRole\|getServerSession\|createServerClient" -n src/app/api/v1 | wc -l
```
Manual matrix must explain any public route.

### Task 4.4: Lock Down Caddyfile Proxy

**Objective:** Remove open query-controlled proxy behavior.

**Files:**
- Modify: `Caddyfile`

**Required Behavior:**
- Do not let public query param control upstream port.
- If dev proxy is needed, bind localhost only or strict allowlist.

**Verification:**
- No `XTransformPort` query-driven reverse proxy remains unless internally gated.

---

## Phase 5 — UI/Module Wiring/Accessibility

### Task 5.1: Consolidate Sidebar Source of Truth

**Objective:** Remove duplicated active sidebar implementations.

**Files:**
- Modify: `src/components/app-sidebar.tsx`
- Modify/use: `src/components/sidebar/sidebar-brand.tsx`
- Modify/use: `src/components/sidebar/sidebar-nav.tsx`
- Modify/use: `src/components/sidebar/sidebar-content.tsx`
- Modify/use: `src/components/sidebar/sidebar-footer.tsx`
- Modify/use: `src/components/sidebar/sidebar-config.ts`

**Required Behavior:**
- One config drives sidebar and command palette.
- Role filtering uses shared access-control policy.
- Active visual state maintains contrast.

**Verification:**
- Sidebar renders same groups before/after.
- No duplicate config arrays remain.

### Task 5.2: Fix Module Registry Consistency

**Objective:** Ensure ViewId, labels, dynamic imports, renderer, sidebar, and command palette are aligned.

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/view-renderer.tsx`
- Modify: `src/components/sidebar/sidebar-config.ts`
- Modify: `src/components/command-palette.tsx`

**Required Fixes:**
- Decide whether `openclaw-graph` is visible. Add sidebar item or remove view.
- Add a single module registry if feasible.

**Verification:**
- Script/check confirms every ViewId has label and renderer decision.

### Task 5.3: Add Command Palette Keyboard Handler

**Objective:** Make advertised Ctrl/Cmd+K shortcut work.

**Files:**
- Modify: `src/app/page.tsx` or a shell keyboard hook.

**Implementation Pattern:**
```tsx
useEffect(() => {
  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      setCommandPaletteOpen(true)
    }
  }
  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}, [setCommandPaletteOpen])
```

**Verification:**
- Ctrl+K opens command palette on Windows/Linux.
- Cmd+K opens it on macOS.

### Task 5.4: Fix Accessibility Issues Found in Review

**Objective:** Resolve obvious keyboard/ARIA/semantic issues.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/sidebar/app-sidebar.tsx`
- Modify: `src/modules/ekyc/page.tsx`
- Modify: `src/modules/settings/page.tsx`

**Required Fixes:**
- Replace invalid `div` inside `span` in shell.
- Improve active sidebar contrast.
- Make eKYC selfie upload keyboard-operable with label/button semantics.
- Add `aria-label` and `type="button"` to icon/password visibility buttons.

**Verification:**
- Manual keyboard tab through login/shell/settings/eKYC.
- ESLint accessibility rules if available.

---

## Phase 6 — Codebase Health and Modularization

### Task 6.1: Split Largest Module by Pattern

**Objective:** Establish reusable structure by refactoring one hotspot first.

**Target File:**
- `src/modules/agihan-bulan/page.tsx`

**Create Structure:**
```text
src/modules/agihan-bulan/
├── page.tsx
├── components/
│   ├── agihan-table.tsx
│   ├── agihan-filters.tsx
│   └── agihan-dialog.tsx
├── hooks/
│   └── use-agihan-data.ts
├── schemas.ts
├── types.ts
└── api.ts
```

**Rules:**
- Preserve behavior.
- No broad styling redesign.
- Commit after each extraction.

**Verification:**
- Page still renders.
- Typecheck passes.

### Task 6.2: Repeat Modularization for Other Hotspots

**Objective:** Reduce maintainability risk across large modules.

**Targets:**
- `src/modules/cases/page.tsx`
- `src/modules/ai/page.tsx`
- `src/modules/docs/page.tsx`
- `src/modules/volunteers/page.tsx`
- `src/modules/members/page.tsx`
- `src/modules/donations/page.tsx`

**Method:**
Use the same folder convention from Task 6.1.

**Verification:**
- Lint/typecheck after each module.

### Task 6.3: Replace Race-Prone Number Generation

**Objective:** Avoid duplicate IDs under concurrent creates.

**Files:**
- Modify: `src/lib/hermes/advanced-tools.ts`
- Search for similar `count()+1` patterns.
- Possibly modify: `src/lib/sequence.ts`

**Required Behavior:**
- Use DB transaction/counter/unique retry helper.
- ID generation cannot collide after deletes/concurrent creates.

**Verification:**
- Unit/integration test simulates concurrent ID requests if test infra exists.

---

## Phase 7 — Validation and Release Gate

### Task 7.1: Run Full Static Validation

**Objective:** Ensure code compiles and lint passes.

**Commands:**
```bash
cd /mnt/g/PUSPA-V4
npm run lint
npx tsc --noEmit
```

**Acceptance Criteria:**
- lint passes or remaining warnings documented and non-blocking.
- typecheck passes.

### Task 7.2: Run Full Build

**Objective:** Verify production build works.

**Command:**
```bash
npm run build
```

**Acceptance Criteria:**
- Prisma generate succeeds.
- Next build succeeds.
- Standalone output/start script expectation matches actual output.

### Task 7.3: Smoke Test Critical Flows

**Objective:** Validate behavior manually/API-level.

**Flows:**
1. Anonymous `/` redirects to `/login`.
2. Login works for test/staff/admin/developer user.
3. Staff cannot render admin/developer module.
4. Command palette does not show unauthorized modules.
5. `/api/v1/users` returns 401/403 when unauthenticated.
6. Admin/developer can use allowed user admin operations.
7. Hermes chat unauthenticated returns 401.
8. Hermes chat staff mode works without developer tools.
9. Hermes developer mode denied for staff, allowed for developer.
10. Hermes message XSS payload renders harmlessly.

### Task 7.4: Final Independent Review

**Objective:** Validate implementation with fresh subagents.

**Delegate Reviews:**
- API/auth/security review.
- Hermes proper-spec review.
- UI/accessibility/module wiring review.
- Codebase health/build/deploy review.

**Acceptance Criteria:**
- No critical/high findings remain.
- Medium findings have owner-approved follow-up issues.

---

## Suggested Subagent Delegation Map

Use these exact lanes when executing:

1. **Repo Hygiene Agent**
   - Phase 0 tasks.
   - Must not touch auth/Hermes logic.

2. **Build/Foundation Agent**
   - Phase 1 tasks.
   - Owns dependency repair and start/build config.

3. **Auth/Security Agent**
   - Phase 2 and Phase 4 tasks.
   - Must produce API auth matrix.

4. **Hermes Integration Agent**
   - Phase 3 tasks.
   - Must follow Hermes spec in this document and `hermes-agent` skill.

5. **UI/UX Agent**
   - Phase 5 tasks.
   - Must follow React/Next best practices and accessibility checks.

6. **Modularization Agent**
   - Phase 6 tasks.
   - One module at a time, no big-bang refactor.

7. **Validation Agent**
   - Phase 7 tasks.
   - Runs lint/typecheck/build/smoke tests and writes final report.

---

## Definition of Done

Project is considered ready only when:

- [ ] `z-ai-web-dev-sdk` fully removed from dependency graph and active code.
- [ ] `bun install` / dependency install succeeds.
- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes.
- [ ] Anonymous users cannot render authenticated shell.
- [ ] Server-side guards protect all sensitive APIs.
- [ ] Role escalation through request body is blocked.
- [ ] ViewRenderer prevents unauthorized module rendering.
- [ ] Command palette/sidebar/access-control are synchronized.
- [ ] Hermes chat endpoint is authenticated, role-gated, validated, auditable.
- [ ] Hermes provider abstraction works without Z.AI and supports configured OpenClaw/OpenAI-compatible endpoint.
- [ ] Hermes message rendering is sanitized against XSS.
- [ ] Hermes tools are role allowlisted and audited.
- [ ] Upload validation checks real file content where sensitive.
- [ ] Production start script matches Next output.
- [ ] Caddy/proxy config has no open query-controlled proxy.
- [ ] Backup/scratch files removed from tracking.
- [ ] Line-ending policy exists and review noise is under control.
- [ ] Final independent review finds no critical/high issues.

---

## First Execution Recommendation

Start with this order for fastest risk reduction:

1. Phase 0.1, 0.2, 0.3 — snapshot and reduce review noise.
2. Phase 1.1 — remove Z.AI completely.
3. Phase 2.1, 2.2, 2.3, 2.4 — close critical auth holes.
4. Phase 3.3, 3.4, 3.8 — secure Hermes endpoint/tool boundary/XSS.
5. Phase 1.2, 7.1, 7.2 — restore dependencies and validation.
6. Continue with remaining phases.

Do not attempt the large modularization phase before the critical security/Hermes/build foundations are fixed.

---

---

## Current Alignment Note (2026-04-30)

This document has been aligned with the current PUSPA-V4 workspace at `/mnt/g/PUSPA-V4`:

- Stack: Next.js 16 / React 19 / TypeScript / Prisma 6 / Bun / Tailwind 4 / shadcn-Radix.
- Local dev command in `package.json` remains `bun run dev` on port `3000`; active preview work may run with `./node_modules/.bin/next dev -p 3001` when port 3000 is occupied.
- Auth: Supabase Auth is the primary app flow via `/api/v1/auth/supabase/*`, synced to Prisma users. Legacy/custom auth endpoints may remain for compatibility, but new protected API work should use server-side helpers from `@/lib/auth`.
- Route protection: `src/middleware.ts` is the active guard in this workspace. Next.js warns the middleware convention is deprecated in favor of `proxy`, so future migration should preserve the same fail-closed behavior.
- PUSPA AI/Hermes: Z.AI is not supported. Provider defaults should be OpenClaw-compatible, normally `openclaw/puspacare`, with env aliases for both `HERMES_OPENAI_*` and `OPENCLAW_*` names. Do not commit real API keys.
- Validation baseline after the latest alignment: `bun x tsc --noEmit --pretty false` passed and `bun run build` passed.
