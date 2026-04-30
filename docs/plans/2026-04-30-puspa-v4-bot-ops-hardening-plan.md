# PUSPA-V4 Bot Ops Hardening Implementation Plan

> **For Hermes:** Use `subagent-driven-development` to execute this plan. Current active app repo is `/mnt/g/PUSPA-V4`; do **not** default to `/mnt/g/PROJECT-13/PuspaCare`.

**Goal:** Implement the next PUSPA-V4 improvement wave: secure the PUSPA bridge, expose safe read-only bot APIs, connect PuspaCareBot through app APIs, add admin health visibility, add approval-based mutations, and update the bot knowledge pack.

**Architecture:** PUSPA-V4 owns auth, RBAC, data validation, and audit logs. PuspaCareBot is an OpenClaw runtime lane using `openclaw/puspacare`; the app should not hardcode provider fallback internals. The VPS workspace `/opt/operator/openclaw/workspace/puspacare` is runtime/knowledge context only, not app source.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Prisma 6, Bun, Supabase Auth, Supabase/Postgres production DB, OpenClaw Gateway, shadcn/Radix, Zustand.

---

## Confirmed Current Context

```text
Active app repo:        /mnt/g/PUSPA-V4
Git remote:             https://github.com/thisisniagahub/PUSPA-V4.git
Current branch:         main
Current HEAD observed:  74cc16a trigger redeploy for env var
VPS bot workspace:      /opt/operator/openclaw/workspace/puspacare
VPS bot workspace type: runtime/knowledge context only
App model target:       openclaw/puspacare
```

Important current status from Bo:

```text
Vercel DB env switched to Supabase pooler
Production login works
Dashboard APIs return 200
/login redirect issue patched
Production deploy passed
```

Still verify before claiming current health.

---

## Updated Priority Order

1. Verify/commit current PUSPA-V4 production fixes.
2. Secure `puspa-openclaw-bridge`.
3. Add/read-review read-only bot API endpoints.
4. Connect PuspaCareBot to read-only app APIs via secure bearer token.
5. Add admin health dashboard.
6. Add approval-based mutation flow.
7. Improve bot knowledge pack.
8. Only after stable: developer automation via Hermes/Codex with explicit approval.

---

## Phase 1 — Verify Current Production Fixes

### Task 1.1: Capture working tree and production-fix diff

**Objective:** Understand current uncommitted production fixes before touching code.

**Files:**
- Read: `src/app/login/page.tsx`
- Read: `src/components/auth-provider.tsx`
- Read: `CLAUDE.md`
- Read: `package.json`

**Commands:**

```bash
cd /mnt/g/PUSPA-V4
git status --short
git diff -- src/app/login/page.tsx src/components/auth-provider.tsx
git log -1 --oneline
```

**Expected:**
- Current modified files identified.
- Login/auth provider patches understood and preserved.
- No unrelated changes overwritten.

---

### Task 1.2: Add production status note

**Objective:** Document current production DB/login status without secrets.

**Files:**
- Create: `docs/puspacarebot/PRODUCTION_ENV.md`

**Content must include:**

```text
- Env names only, no values.
- Supabase pooler is expected for production DB.
- Production login/dashboard were reported fixed; verify before deploy claims.
- Secret rotation remains recommended because secrets were previously pasted in chat.
```

**Verification:**

```bash
grep -Ei 'password|token|secret|postgresql://|sb_secret|jwt' docs/puspacarebot/PRODUCTION_ENV.md
```

Expected: only safe/redacted instructional text, no real secret values.

---

## Phase 2 — Secure `puspa-openclaw-bridge`

### Task 2.1: Inventory bridge exposure and source-of-truth

**Objective:** Document the active bridge source, service, public route, and required hardening.

**Files:**
- Create: `docs/puspacarebot/BRIDGE_SECURITY.md`

**Known runtime facts to verify on VPS:**

```text
Service: puspa-openclaw-bridge.service
Local health: http://127.0.0.1:18181/health
Public route: https://operator.gangniaga.my/puspa-bridge/
Observed risk: wildcard CORS may exist
```

**Required policy:**

```text
/health may return simple OK only, no internal metadata.
All data/action endpoints require server-side Authorization: Bearer <bridge-token>.
CORS allowlist only:
- https://puspa.gangniaga.my
- https://operator.gangniaga.my
- https://puspa-v4.vercel.app if still used
CORS is not auth.
Add rate limiting.
Add audit logs.
Never print bridge token.
```

---

### Task 2.2: Implement or document bridge token enforcement

**Objective:** Ensure bridge non-health endpoints reject missing/invalid bearer tokens.

**Files:**
- If bridge source exists in repo, modify that source.
- If bridge source is only on VPS, create a patch document: `docs/puspacarebot/bridge-server-hardening.patch.md`.

**Expected behavior:**

```text
GET /health -> 200 { ok: true }
GET/POST protected endpoint without token -> 401
GET/POST protected endpoint with invalid token -> 401
GET/POST protected endpoint with valid token -> allowed
```

**Implementation requirements:**
- Use env name only in docs: `PUSPA_OPENCLAW_BRIDGE_TOKEN` or existing actual env key name.
- Use constant-time comparison if practical.
- Never log token values.

---

### Task 2.3: Implement or document bridge CORS/rate-limit/audit

**Objective:** Complete bridge hardening policy.

**Files:**
- If bridge source exists in repo, modify source.
- Otherwise append exact patch guidance to `docs/puspacarebot/bridge-server-hardening.patch.md`.

**Requirements:**
- No wildcard CORS on protected endpoints.
- Rate limit by IP and path.
- Audit log fields:
  - timestamp
  - method
  - path
  - origin
  - authorized true/false
  - status
  - durationMs
- No request body logging for sensitive endpoints.

---

## Phase 3 — Read-Only Bot APIs

### Task 3.1: Inventory existing bot endpoints

**Objective:** Compare required endpoints with actual `src/app/api/v1/bot/*` implementation.

**Files:**
- Create: `docs/puspacarebot/APP_API_MAP.md`
- Inspect:
  - `src/app/api/v1/bot/dashboard/route.ts`
  - `src/app/api/v1/bot/members/route.ts`
  - `src/app/api/v1/bot/cases/route.ts`
  - `src/app/api/v1/bot/donations/route.ts`
  - `src/app/api/v1/bot/ekyc/route.ts`
  - `src/app/api/v1/bot/keys/route.ts`

**Required endpoint set:**

```text
GET /api/v1/bot/health
GET /api/v1/bot/context
GET /api/v1/bot/dashboard
GET /api/v1/bot/cases
GET /api/v1/bot/members
GET /api/v1/bot/donations
GET /api/v1/bot/ekyc
```

**Security requirements:**
- All guarded by `Authorization: Bearer psbot_...` unless explicitly documented public.
- No raw DB URL, private secrets, password hashes, or full sensitive records.
- Return summarized operational data.

---

### Task 3.2: Add missing `GET /api/v1/bot/health`

**Objective:** Let PuspaCareBot check app and DB health safely.

**Files:**
- Create: `src/app/api/v1/bot/health/route.ts`
- Reuse existing bot auth helper if present.

**Response shape:**

```ts
{
  success: true,
  data: {
    service: 'puspa-v4',
    app: 'ok',
    db: 'ok' | 'fail',
    botApiTokenConfigured: boolean,
    timestamp: string
  }
}
```

**Do not return:** actual token, DB URL, Supabase secret, stack trace.

---

### Task 3.3: Add missing `GET /api/v1/bot/context`

**Objective:** Provide safe PuspaCareBot context for support/admin summaries.

**Files:**
- Create: `src/app/api/v1/bot/context/route.ts`

**Response should include:**
- app name/version
- allowed bot actions summary
- high-level module list
- current environment label if safe
- no secrets

---

### Task 3.4: Harden existing read-only bot endpoints

**Objective:** Ensure existing bot endpoints remain read-only and redact sensitive fields.

**Files:**
- Modify only if necessary:
  - `src/app/api/v1/bot/dashboard/route.ts`
  - `src/app/api/v1/bot/members/route.ts`
  - `src/app/api/v1/bot/cases/route.ts`
  - `src/app/api/v1/bot/donations/route.ts`
  - `src/app/api/v1/bot/ekyc/route.ts`

**Checklist:**
- GET handlers do not write DB.
- Pagination/limits enforced.
- Sensitive fields excluded.
- Permission checks applied.
- Errors sanitized.

---

## Phase 4 — Connect PuspaCareBot to Read-Only App APIs

### Task 4.1: Document API auth and runtime env

**Objective:** Define how PuspaCareBot calls app APIs safely.

**Files:**
- Create: `docs/puspacarebot/API_CONTRACTS.md`

**Include:**

```text
PUSPACARE_APP_BASE_URL
PUSPACARE_BOT_API_KEY
Authorization: Bearer psbot_...
Read-only endpoints list
Timeout/retry policy
Redaction policy
```

---

### Task 4.2: Add local verification script for bot APIs

**Objective:** Give operators one safe smoke test command.

**Files:**
- Create: `scripts/check-bot-apis.ts`

**Behavior:**
- Reads `PUSPACARE_APP_BASE_URL` and `PUSPACARE_BOT_API_KEY`.
- Calls `/api/v1/bot/health`, `/context`, `/dashboard`.
- Prints status codes and success booleans only.
- Never prints token.

---

## Phase 5 — Admin Health Dashboard

### Task 5.1: Add aggregate health endpoint

**Objective:** Provide one internal status endpoint for app + DB + gateway + bridge + bot lane.

**Files:**
- Create or modify: `src/app/api/v1/openclaw/status/route.ts`
- Create or modify: `src/app/api/v1/openclaw/snapshot/route.ts`
- Optional create: `src/app/api/v1/openclaw/health/route.ts`

**Required health fields:**

```text
App DB: OK/FAIL
Supabase Auth: OK/FAIL
OpenClaw Gateway: OK/FAIL
openclaw/puspacare: OK/FAIL
Bridge: OK/FAIL
Bot API token configured: yes/no only
Last bot action
Last error
Last successful model probe
```

**Security:** never return secrets/token values.

---

### Task 5.2: Surface health in existing OpenClaw/Ops UI

**Objective:** Show health status in an admin/developer UI without creating unnecessary new navigation.

**Files:**
- Prefer modifying existing:
  - `src/modules/ops-conductor/page.tsx`
  - or `src/modules/openclaw/*`

**UI requirements:**
- Status cards for app DB, Supabase Auth, gateway, bridge, model lane.
- Token configured yes/no only.
- Last successful model probe.
- Last error sanitized.

---

## Phase 6 — Approval-Based Mutation Flow

### Task 6.1: Document bot action policy

**Objective:** Define allowed read/write actions and approval rules before implementing mutation.

**Files:**
- Create: `docs/puspacarebot/BOT_ACTIONS.md`
- Create: `docs/puspacarebot/APPROVAL_FLOW.md`

**Must include blocked direct actions:**

```text
approve eKYC
update member
create/delete case
mark donation reconciled
send WhatsApp/SMS
deploy production
```

These require preview -> Bo/admin approval -> execute -> audit.

---

### Task 6.2: Add preview/execute endpoint skeletons

**Objective:** Add safe endpoint skeletons that reject execution until approval storage is implemented.

**Files:**
- Create: `src/app/api/v1/bot/actions/preview/route.ts`
- Create: `src/app/api/v1/bot/actions/execute/route.ts`

**Initial behavior:**
- Requires bot auth.
- `preview` validates action type allowlist and returns summary/risk.
- `execute` returns `501 Not Implemented` unless valid approved action ID exists.
- No real data mutation yet unless approval storage/audit is implemented in same task.

---

### Task 6.3: Add audit model only if schema supports it safely

**Objective:** Use existing audit/log tables if present; add new model only after schema review.

**Files:**
- Inspect: `prisma/schema.prisma`
- Inspect: `prisma/schema.postgres.prisma`

**Do not:**
- Run production migrations without Bo approval.

---

## Phase 7 — Bot Knowledge Pack

### Task 7.1: Add docs under `docs/puspacarebot/`

**Objective:** Create repo source docs that can be synced to VPS runtime workspace.

**Files:**
- Create: `docs/puspacarebot/RUNBOOK.md`
- Create: `docs/puspacarebot/ROLE_POLICY.md`
- Create: `docs/puspacarebot/ESCALATION.md`
- Create: `docs/puspacarebot/APP_MAP.md`
- Create: `docs/puspacarebot/SECURITY_BOUNDARIES.md`
- Create: `docs/puspacarebot/INCIDENT_PLAYBOOK.md`

**Content:** concise, operational, no secrets.

---

### Task 7.2: Add model policy doc

**Objective:** Avoid future confusion between app model alias and provider fallback internals.

**Files:**
- Create: `docs/puspacarebot/MODEL_POLICY.md`

**Required content:**

```text
App calls model: openclaw/puspacare
OpenClaw decides primary/fallback.
Do not make app code depend on Codex/Gemini/Ollama fallback order.
Codex only considered healthy if workspace probe passes.
Known failure: {"detail":{"code":"deactivated_workspace"}}
```

---

## Phase 8 — Validation

### Task 8.1: Static validation

**Commands:**

```bash
cd /mnt/g/PUSPA-V4
bun x tsc --noEmit --pretty false
bun run lint
```

---

### Task 8.2: Build validation

**Command:**

```bash
cd /mnt/g/PUSPA-V4
bun run build
```

---

### Task 8.3: Smoke checks

**Local checks:**

```text
/login works according to Supabase auth flow
/api/v1/bot/health rejects missing token
/api/v1/bot/health succeeds with valid token
/api/v1/bot/context succeeds with valid token
/api/v1/openclaw/status returns no secrets
```

**VPS checks:**

```text
OpenClaw health OK
PUSPA bridge health OK
openclaw/puspacare returns PUSPACARE_OK
```

---

## Acceptance Criteria

- [ ] Current production fixes preserved and documented.
- [ ] Bridge hardening policy and patch/source changes exist.
- [ ] Bot read-only health/context endpoints exist and are guarded.
- [ ] Existing bot endpoints reviewed/hardened.
- [ ] PuspaCareBot app API contract documented.
- [ ] Health status available to admin/developer UI or endpoint.
- [ ] Mutation preview/execute flow documented and safe skeleton added.
- [ ] Knowledge pack docs created.
- [ ] Typecheck/lint/build pass or blockers are documented with exact errors.
- [ ] No secrets committed.
