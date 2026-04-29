# PUSPA V4 Product Requirements Document (PRD)

**Product:** PUSPA V4 — Pertubuhan Urus Peduli Asnaf NGO Management Platform
**Workspace:** `/mnt/g/PUSPA-V4`
**Version:** 1.0
**Last aligned:** 2026-04-30
**Status:** Active product baseline / implementation reference
**Primary audience:** PUSPA operators, administrators, developers, AI/automation maintainers, deployment reviewers

---

## 1. Executive Summary

PUSPA V4 is a Next.js 16 based management platform for Pertubuhan Urus Peduli Asnaf (PUSPA), a Malaysian NGO serving asnaf communities around Hulu Klang, Gombak, and Ampang. The platform centralizes member management, case workflows, donations, disbursements, programmes, compliance, volunteers, documents, reporting, and AI-assisted operations into one secure single-page application.

The product is designed around two operating modes:

1. **Human operations console** — staff, admin, and developer users manage real NGO workflows through role-gated modules.
2. **AI operations layer** — Hermes/PUSPA AI assists users with contextual guidance, database-backed workflows, skills, memory, and OpenClaw-powered LLM responses.

The current implementation is a SPA-style Next.js App Router application. Modules are rendered through a single root page with Zustand-driven view state and dynamic module imports via `src/components/view-renderer.tsx`.

---

## 2. Product Vision

### Vision Statement

Enable PUSPA to operate as a data-driven, AI-assisted NGO where every asnaf member, case, donation, programme, compliance obligation, and field activity can be tracked, reviewed, and improved through one trusted platform.

### Product Principles

- **Serve asnaf first:** workflows must reduce administrative friction and improve aid delivery speed.
- **Trustworthy by default:** security, auditability, privacy, and role-based access are core requirements.
- **Bilingual and practical:** Bahasa Melayu and English support are expected in UI copy and AI responses.
- **AI as operator support, not black box:** Hermes should explain, trace, and constrain actions.
- **Local-first development, production-ready design:** SQLite for local development, PostgreSQL for production.
- **OpenClaw-first AI routing:** PUSPA AI should use OpenClaw-compatible provider settings and must not depend on Z.AI keys.

---

## 3. Goals and Non-Goals

### Goals

1. Provide a unified operational dashboard for PUSPA staff, admins, and developers.
2. Manage asnaf member profiles, household details, income data, status, and eKYC verification.
3. Support structured case intake, assessment, approval, disbursement, follow-up, and closure.
4. Track donations, donors, receipts, shariah compliance, and donor communication history.
5. Track disbursements, payment verification, scheduled payouts, and reconciliation.
6. Manage programmes, beneficiaries, budgets, impact metrics, and programme categories.
7. Manage volunteers, deployment, hours, certificates, and activity participation.
8. Maintain compliance records for ROSM, LHDN, PDPA, audit trails, and evidence references.
9. Provide reporting and dashboards for operational, financial, compliance, and programme insights.
10. Embed Hermes/PUSPA AI as a contextual assistant with tools, memory, skills, and provider abstraction.
11. Provide developer-only OpenClaw operations modules for MCP, plugins, integrations, terminal, agents, models, automation, and graph exploration.
12. Offer API endpoints for web UI, bot integrations, OpenClaw bridge/status checks, and authenticated business operations.

### Non-Goals

1. Replace Supabase Auth with a new auth system in the current baseline.
2. Depend on Z.AI provider credentials as a fallback.
3. Expose secrets, API keys, cookies, connection strings, or service tokens in documentation.
4. Build native mobile applications in this release.
5. Implement full accounting/ERP functionality beyond NGO donation, disbursement, and reporting needs.
6. Allow unrestricted AI tool execution without role, auth, and audit controls.

---

## 4. Users and Personas

### 4.1 Staff User

**Primary needs:** daily case/member/programme operations.
**Typical actions:** create/update members, submit cases, view dashboard, manage donations, upload documents, check activity status.
**Access level:** default operational modules unless restricted.

### 4.2 Admin User

**Primary needs:** oversight, compliance, reporting, approvals, high-risk workflows.
**Typical actions:** compliance review, eKYC decisions, reports, role-sensitive operations, programme oversight, user and workflow governance.
**Access level:** staff modules plus admin-gated modules.

### 4.3 Developer / Operator User

**Primary needs:** AI operations, OpenClaw integrations, system diagnostics, automation, advanced tooling.
**Typical actions:** manage Hermes/OpenClaw settings, inspect AI tools, run operator modules, validate API behavior, test local preview.
**Access level:** developer-gated modules including AI and OpenClaw suite.

### 4.4 External / Bot Client

**Primary needs:** controlled integration with service accounts and API keys.
**Typical actions:** use bot-specific endpoints, webhook processing, service account operations.
**Access level:** `/api/v1/bot/*` style API-key authenticated routes only.

---

## 5. Current System Baseline

### 5.1 Stack

| Area | Current Baseline |
|---|---|
| Framework | Next.js 16 App Router |
| Runtime / Package Manager | Bun |
| UI | React 19, Tailwind CSS 4, shadcn/Radix primitives |
| Language | TypeScript strict baseline |
| ORM | Prisma 6 |
| Local Database | SQLite via `DATABASE_URL=file:./db/custom.db` |
| Production Database | PostgreSQL via `DATABASE_PROVIDER=postgresql` and `POSTGRES_PRISMA_URL` |
| Auth | Supabase Auth primary flow with Prisma user sync |
| State | Zustand persist stores |
| AI Provider | OpenClaw-compatible gateway, normally `openclaw/puspacare` |
| Charts | Recharts |
| Tables | TanStack Table |
| API Validation | Zod and route-level validation patterns |

### 5.2 Local Commands

```bash
# Common preview when port 3000 is busy
./node_modules/.bin/next dev -p 3001

# Package script dev server on port 3000
bun run dev

# TypeScript validation
bun x tsc --noEmit --pretty false

# Production build
bun run build

# Database
bun run db:generate
bun run db:push
bun run db:seed
```

### 5.3 Current Local Preview Target

- Primary preview URL: `http://127.0.0.1:3001`
- Alternative local URL: `http://localhost:3001`
- Login page: `/login`
- Root path redirects unauthenticated users to login with callback URL.

---

## 6. Architecture Overview

### 6.1 SPA Routing Model

PUSPA V4 does not use one file route per module for the main app experience. It uses:

1. `src/app/page.tsx` as the main authenticated shell entry.
2. Zustand app state to track `currentView`.
3. `src/components/view-renderer.tsx` to dynamically import module pages.
4. `src/lib/access-control.ts` to role-gate module access.

Flow:

```text
User clicks navigation item
  -> useAppStore.setView(viewId)
  -> ViewRenderer receives current view
  -> dynamic import('@/modules/<viewId>/page')
  -> module renders inside app shell
  -> access-control checks required role
```

### 6.2 Dynamic Modules Registered

Current dynamic module set includes:

- `dashboard`
- `members`
- `cases`
- `programmes`
- `donations`
- `disbursements`
- `compliance`
- `admin`
- `reports`
- `activities`
- `ai`
- `volunteers`
- `donors`
- `documents`
- `openclaw-mcp`
- `openclaw-plugins`
- `openclaw-integrations`
- `openclaw-terminal`
- `openclaw-agents`
- `openclaw-models`
- `openclaw-automation`
- `openclaw-graph`
- `ekyc`
- `tapsecure`
- `agihan-bulan`
- `sedekah-jumaat`
- `docs`
- `ops-conductor`
- `asnafpreneur`
- `kelas-ai`
- `gudang-barangan`
- `settings`

### 6.3 Role-Gated Views

Role requirements are defined in `src/lib/access-control.ts`.

| View | Minimum Role |
|---|---|
| `compliance` | admin |
| `reports` | admin |
| `ekyc` | admin |
| `tapsecure` | admin |
| `asnafpreneur` | admin |
| `kelas-ai` | admin |
| `ai` | developer |
| `ops-conductor` | developer |
| `openclaw-*` modules | developer |
| Other operational modules | staff/default access |

---

## 7. Functional Requirements

### 7.1 Authentication and Session Management

#### Requirements

- Users must authenticate through the Supabase Auth flow.
- Supabase sessions must be refreshed server-side using `@supabase/ssr` middleware behavior.
- Authenticated users must sync to Prisma user records where applicable.
- Public routes must remain limited to login, static assets, public Supabase auth endpoints, and bot API routes.
- Protected routes must fail closed when session/user validation fails.

#### Acceptance Criteria

- Unauthenticated request to `/` redirects to `/login?callbackUrl=%2F`.
- Authenticated user can access dashboard shell.
- API routes requiring user identity reject unauthenticated requests.
- Bot API routes use API-key/service-account authentication, not browser cookies.

### 7.2 Dashboard

#### Requirements

- Display top-level operational metrics: members, active programmes, donations, volunteers, compliance score.
- Show monthly donation trends by fund category.
- Show member breakdown by status/category.
- Show recent activities with timestamps and activity types.
- Support loading, empty, and API failure states.

#### Acceptance Criteria

- Dashboard renders after login.
- `/api/v1/dashboard` data maps correctly into dashboard charts and cards.
- Timestamps display in Malaysian locale formatting.

### 7.3 Member Management

#### Requirements

- Store asnaf member identity, IC, phone, address, income, household size, household members, and status.
- Support member search/filter flows.
- Support eKYC verification state where available.
- Preserve audit history for sensitive member updates where implemented.

#### Acceptance Criteria

- Staff/admin can view member list.
- Member data model supports household and income fields.
- Member status can be represented as active/inactive or schema-compatible values.

### 7.4 Case Management

#### Requirements

- Support case lifecycle from draft/intake through verification, scoring, approval, disbursement, follow-up, closure, or rejection.
- Capture case notes, documents, priority, next action, and status history.
- Support welfare/eligibility scoring and risk indicators.
- Link cases to members and programmes where applicable.

#### Acceptance Criteria

- Case status transitions are auditable.
- Case notes include author/time/type metadata where implemented.
- Admin approval flows are enforced for sensitive transitions.

### 7.5 Donations and Donor CRM

#### Requirements

- Record donations across categories such as zakat, sadaqah/sedekah, waqf/wakaf, infaq, and general funds.
- Maintain donor profiles and donor segmentation.
- Support receipt references and LHDN-related reporting data.
- Preserve shariah compliance flags where relevant.

#### Acceptance Criteria

- Donations can be listed, created, and linked to donors.
- Donor data can be auto-created/updated from donation flows where implemented.
- Financial reports can aggregate donations by period/category.

### 7.6 Disbursements and Payments

#### Requirements

- Track aid disbursements with recipient, amount, schedule, status, and payment details.
- Support verification/approval status for payment workflows.
- Link disbursements to cases/programmes where applicable.

#### Acceptance Criteria

- Disbursement records can be queried by status and date.
- Payment verification updates are role-protected where required.
- Reports can include disbursement totals.

### 7.7 Programme Management

#### Requirements

- Manage programmes with category, budget, beneficiaries, impact metrics, and status.
- Track programme activities and outputs.
- Support impact reporting and budget-vs-actual views.

#### Acceptance Criteria

- Programme CRUD operations work for authorized users.
- Programme categories are schema-compatible.
- Programme-related dashboards/reports show current data.

### 7.8 Volunteer Management

#### Requirements

- Track volunteer profiles, skills, availability, deployments, hours, and certificate data.
- Support activity participation and approval workflows for logged hours.

#### Acceptance Criteria

- Volunteers can be viewed and managed by authorized users.
- Logged hours can be accumulated and reported.

### 7.9 Compliance

#### Requirements

- Track ROSM, LHDN, PDPA, and internal governance obligations.
- Store evidence URLs/attachments and status per checklist item.
- Provide compliance score and expiry reminders.

#### Acceptance Criteria

- Compliance module is admin-gated.
- Compliance records are queryable and reportable.
- Evidence links are preserved and auditable.

### 7.10 eKYC

#### Requirements

- Capture identity verification workflow for IC front/back, selfie/liveness, OCR extraction, face match score, and risk level.
- Support admin review and verification metadata.
- Use schema-compatible fields for verifier linkage. Current Prisma field uses `verifiedBy`.

#### Acceptance Criteria

- eKYC module is admin-gated.
- Verification updates persist without Prisma field mismatch.
- Risk levels are visible to authorized users.

### 7.11 TapSecure

#### Requirements

- Support biometric/security-oriented device flows such as device binding, trusted devices, and security event visibility where implemented.
- Restrict TapSecure to admin-level access.

#### Acceptance Criteria

- TapSecure view is admin-gated.
- Security event data does not expose secrets.

### 7.12 Reports

#### Requirements

- Provide operational, financial, compliance, and programme reports.
- Support aggregation by date range, category, and status.
- Restrict reports to admin-level access.

#### Acceptance Criteria

- Reports module is admin-gated.
- Financial report routes compile with current Prisma schema.
- Report outputs use schema-compatible status/category values.

### 7.13 Documents

#### Requirements

- Store document metadata, category, versioning, ownership, and relationships to members/cases/programmes where implemented.
- Support future storage provider integration without changing core module behavior.

#### Acceptance Criteria

- Document module renders for authorized users.
- Document metadata is auditable.

### 7.14 Ops Conductor

#### Requirements

- Provide developer-gated AI operations workflow for work items, approvals, execution traces, and automation orchestration.
- Support natural language intent capture where implemented.
- Preserve execution trace and audit metadata.

#### Acceptance Criteria

- Ops Conductor is developer-gated.
- Work item lifecycle supports pending, approved, rejected, revised, or schema-compatible states.

### 7.15 OpenClaw Developer Suite

#### Requirements

Developer-only OpenClaw modules must support operational visibility for:

- MCP server configuration/status.
- Plugin management.
- Integration/gateway/channel configuration.
- Terminal/operator console.
- Agent management.
- Model configuration.
- Automation jobs.
- Graph explorer.

#### Acceptance Criteria

- All `openclaw-*` views are developer-gated.
- Status routes return authenticated responses.
- Errors from bridge/gateway are surfaced safely without secrets.

---

## 8. Hermes / PUSPA AI Requirements

### 8.1 Provider Baseline

Hermes/PUSPA AI must use OpenClaw-compatible provider configuration by default.

Required env aliases for local/production parity:

```env
HERMES_PROVIDER=openclaw
HERMES_OPENAI_BASE_URL=https://openclaw-api.fly.dev/v1
HERMES_OPENAI_API_KEY=[REDACTED]
HERMES_MODEL=openclaw/puspacare
OPENCLAW_BASE_URL=https://openclaw-api.fly.dev/v1
OPENCLAW_API_KEY=[REDACTED]
OPENCLAW_MODEL=openclaw/puspacare
```

### 8.2 Provider Rules

- Z.AI must not be required or used as fallback.
- Env OpenClaw values should override stale/missing DB or user provider settings for local preview and production stability.
- OpenClaw JSON error strings returned inside assistant content must be converted into safe, user-friendly operational fallback messages.
- Raw upstream error JSON, API keys, cookies, and provider credentials must never be shown in the UI.

### 8.3 Chat API

Current chat endpoint:

```text
POST /api/v1/hermes/chat
```

Expected payload shape:

```json
{
  "messages": [
    { "role": "user", "content": "Reply exactly OK" }
  ],
  "currentView": "dashboard"
}
```

Do not use a single top-level `message` string for this endpoint.

### 8.4 AI Functional Requirements

- Provide bilingual BM/EN answers.
- Respect user role and current module context.
- Use tools only through server-controlled tool registry.
- Persist conversations and memory where implemented.
- Support self-improving skills where implemented.
- Provide execution traces for tool calls/actions.
- Return `success=true` with provider/model metadata when provider call succeeds.

### 8.5 AI Acceptance Criteria

- Authenticated smoke request to `/api/v1/hermes/chat` returns HTTP 200.
- Response includes `provider=openclaw` and `model=openclaw/puspacare` for default OpenClaw setup.
- A sentinel prompt such as `Reply exactly OK` returns a valid assistant message.
- Missing provider env produces a clear operational error without leaking secrets.

---

## 9. API Requirements

### 9.1 API Design Principles

- All protected APIs must authenticate server-side.
- Role-sensitive APIs must enforce role checks server-side, not only in UI.
- API output must not expose secrets, tokens, connection strings, or cookies.
- Prisma enum/string usage must match the active generated Prisma client and schema.
- API routes should use consistent success/error JSON shapes where possible.

### 9.2 Public / Semi-Public Route Categories

| Category | Route Pattern | Auth Model |
|---|---|---|
| Login/session | `/api/v1/auth/supabase/*` | Public auth flow with Supabase validation |
| Bot API | `/api/v1/bot/*` | API key/service account |
| Web app business APIs | `/api/v1/*` | Browser session / server-side user auth |
| Hermes | `/api/v1/hermes/*` | Authenticated app session |
| OpenClaw status/ops | `/api/v1/openclaw/*` | Authenticated, role-aware where required |

### 9.3 User Management Requirements

- User management APIs must be restricted to admin/developer roles.
- Role assignment must respect role hierarchy and use a dedicated guard such as `canAssignRole`.
- Staff users must not be able to escalate privileges.

---

## 10. Data and Prisma Requirements

### 10.1 Schema Modes

- Local development: `prisma/schema.prisma` with SQLite.
- Production/Vercel: PostgreSQL schema mode via `DATABASE_PROVIDER=postgresql` and `POSTGRES_PRISMA_URL`.
- Build pipeline must run `prisma generate` before `next build`.

### 10.2 Database Requirements

- Keep Prisma schema and generated client aligned.
- Avoid importing Prisma enum names that are not generated in the current active client.
- Prefer schema-compatible strings/casts where generated enum mismatch exists until schema/client are unified.
- Preserve audit fields such as created/updated timestamps.

### 10.3 eKYC Field Note

Current `EKYCVerification` verifier field is:

```text
verifiedBy
```

Do not use `verifiedById` unless the Prisma schema is explicitly changed and migration/generated client are updated.

---

## 11. Security, Privacy, and Compliance Requirements

### 11.1 Security

- All secrets must stay in `.env` or deployment secret stores.
- Documentation must use `[REDACTED]` or placeholder values for keys/passwords/tokens.
- Cookies and API keys must never be printed in logs, docs, or UI responses.
- Protected routes must fail closed.
- Developer/OpenClaw operations must be developer-gated.
- Admin modules must be admin-gated.

### 11.2 Privacy

- Member identity data is sensitive and must be handled as PII.
- eKYC data is high-sensitivity PII and requires strict access control.
- Audit trails must record sensitive operations where implemented.
- AI tools must not leak raw member/case data outside authorized contexts.

### 11.3 Compliance

The product should support operational compliance for:

- ROSM governance obligations.
- LHDN tax/receipt and donation reporting needs.
- PDPA privacy expectations.
- Internal approval and audit policies.

---

## 12. UX and Design Requirements

### 12.1 Design Direction

- Modern NGO operations console.
- Responsive layout with adaptive sidebar/sheet behavior.
- Dark/light theme support through `next-themes`.
- shadcn/Radix component patterns.
- Tailwind 4 styling.
- Friendly but professional copy tone.

### 12.2 Language

- UI should support practical Bahasa Melayu and English terminology.
- PUSPA AI should be friendly, concise, and operationally helpful.
- PUSPA AI/PuspaCareBot style may use light 🦞 personality when appropriate, without compromising clarity.

### 12.3 Accessibility

- Use semantic components where possible.
- Preserve keyboard access for navigation, command palette, dialogs, and forms.
- Ensure color contrast is readable in dark and light themes.
- Avoid hiding critical status behind color alone.

---

## 13. Non-Functional Requirements

### 13.1 Performance

- Initial app shell should load quickly through dynamic module imports.
- Heavy modules should remain lazy-loaded.
- API routes should avoid unnecessary full-table scans for large datasets.
- Dashboard queries should be aggregate-friendly.

### 13.2 Reliability

- Local dev server should run on port 3001 when 3000 is occupied.
- Build should pass with `bun run build` before deployment.
- TypeScript should pass with `bun x tsc --noEmit --pretty false`.
- Provider failures should degrade gracefully.

### 13.3 Maintainability

- Keep business logic out of UI components where practical.
- Use shared auth helpers from `@/lib/auth` for protected API work.
- Keep AGENTS/README/PRD docs aligned after major changes.
- Avoid introducing broad rewrites for targeted fixes.

### 13.4 Observability

- API errors should be logged server-side with safe redaction.
- AI execution traces should be visible where implemented.
- Audit logs should record key user and system events.

---

## 14. Environment Requirements

### 14.1 Minimum Local `.env`

```env
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=[REDACTED]
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[REDACTED]
```

### 14.2 OpenClaw / Hermes `.env`

```env
HERMES_PROVIDER=openclaw
HERMES_OPENAI_BASE_URL=https://openclaw-api.fly.dev/v1
HERMES_OPENAI_API_KEY=[REDACTED]
HERMES_MODEL=openclaw/puspacare
OPENCLAW_BASE_URL=https://openclaw-api.fly.dev/v1
OPENCLAW_API_KEY=[REDACTED]
OPENCLAW_MODEL=openclaw/puspacare
```

### 14.3 PostgreSQL Production `.env`

```env
DATABASE_PROVIDER=postgresql
POSTGRES_PRISMA_URL=postgresql://user:[REDACTED]@host:5432/puspa
```

---

## 15. Acceptance Test Baseline

### 15.1 Local Server

```bash
./node_modules/.bin/next dev -p 3001
```

Expected:

- `http://127.0.0.1:3001/login` returns HTTP 200.
- `http://127.0.0.1:3001/` redirects unauthenticated users to login.

### 15.2 TypeScript

```bash
bun x tsc --noEmit --pretty false
```

Expected:

- Exit code 0.
- No TypeScript errors.

### 15.3 Production Build

```bash
bun run build
```

Expected:

- Prisma generate completes.
- Next.js production build completes.
- No secret values appear in logs.

### 15.4 Auth Smoke

Expected:

- Login API returns success for valid dev/demo account.
- `/api/v1/auth/supabase/me` returns authenticated user metadata after login.

Do not publish real demo passwords in public docs or logs.

### 15.5 Hermes Smoke

Expected authenticated request:

```json
{
  "messages": [
    { "role": "user", "content": "Reply exactly OK" }
  ],
  "currentView": "dashboard"
}
```

Expected result:

- HTTP 200.
- `success=true`.
- `provider=openclaw`.
- `model=openclaw/puspacare`.
- Assistant content is valid text.

---

## 16. Release Criteria

A release/deployment candidate is acceptable when:

1. Local or CI TypeScript check passes.
2. Production build passes.
3. Supabase auth login and protected user check pass.
4. Dashboard loads after login.
5. Hermes chat smoke test passes with OpenClaw provider.
6. No real secrets are committed.
7. Role-gated modules remain inaccessible to insufficient roles.
8. Prisma schema/client are aligned for the selected database provider.
9. Documentation reflects current auth, AI provider, environment, commands, and known warnings.

---

## 17. Known Warnings and Follow-Up Work

### 17.1 Next.js Middleware Deprecation

The active guard currently lives in `src/middleware.ts`. Next.js warns that the middleware convention is deprecated in favor of `proxy` in newer versions. Future migration should preserve the same fail-closed behavior and public-route allowlist.

### 17.2 Browser Dev/HMR Glitches

If the browser UI shows a blank page during AI/chat development while API smoke tests pass, treat it as a client/dev-session issue first. Verify console errors, dev server logs, and API status before changing provider code.

### 17.3 Prisma Enum Drift

Some TypeScript blockers can occur when generated Prisma enum exports differ from current schema expectations. Keep schema, client generation, and route type usage aligned.

### 17.4 Documentation Drift

After major changes, update at minimum:

- `README.md`
- `PRD.md`
- `CLAUDE.md`
- `GEMINI.md`
- `src/app/AGENTS.md`
- `src/app/api/AGENTS.md`
- `src/modules/AGENTS.md`
- `src/components/ui/AGENTS.md`

---

## 18. Success Metrics

### Operational Metrics

- Time to register a new asnaf member.
- Time from case submission to approval/rejection.
- Number of cases processed per month.
- Donation total by month/category.
- Disbursement completion and reconciliation rate.
- Volunteer hours logged and approved.
- Compliance score and overdue compliance count.

### Product Quality Metrics

- TypeScript/build pass rate.
- Login/API smoke pass rate.
- Hermes response success rate.
- Role-gate regression count.
- Number of leaked-secret incidents: target zero.
- Error rate for protected APIs.

### AI Metrics

- Hermes successful response latency.
- Tool-call success/error rate.
- Provider fallback/error frequency.
- User satisfaction with AI responses.
- Number of repeated workflows converted into reusable skills.

---

## 19. Roadmap

### Phase 1 — Stabilized Local Preview

- Keep port 3001 preview workflow stable.
- Ensure `.env` has both `HERMES_*` and `OPENCLAW_*` aliases.
- Keep TypeScript and production build passing.
- Align docs with current architecture.

### Phase 2 — Production Readiness

- Confirm PostgreSQL schema switch and migrations.
- Configure deployment secret stores.
- Run production auth/Hermes/dashboard smoke tests.
- Add CI checks for TypeScript, build, and secret scanning.

### Phase 3 — Workflow Hardening

- Expand role-based test coverage.
- Add regression tests for key APIs.
- Improve audit trail coverage.
- Add report exports where needed.

### Phase 4 — AI Operations Maturity

- Expand Hermes tool governance.
- Improve skill/memory review flows.
- Add better provider health checks.
- Improve user-facing AI trace explanations.

### Phase 5 — Compliance and Analytics Enhancements

- Enhance ROSM/LHDN/PDPA dashboards.
- Add advanced donation/disbursement analytics.
- Add programme impact reporting templates.

---

## 20. Open Questions

1. Which production hosting target is final for PUSPA V4: Vercel, VPS, container, or hybrid?
2. Which PostgreSQL provider will be used in production?
3. Should demo credentials remain documented internally, or move fully to secure vault/onboarding notes?
4. What exact approval policy should govern AI-triggered write operations?
5. What reporting exports are highest priority: PDF, CSV, Excel, or dashboard-only?
6. Should `middleware.ts` be migrated to `proxy` before production launch?
7. Which modules require formal end-to-end Playwright coverage first?

---

## 21. Appendix: Key Source Files

| Purpose | File |
|---|---|
| Main app shell | `src/app/page.tsx` |
| Dynamic module renderer | `src/components/view-renderer.tsx` |
| Module access control | `src/lib/access-control.ts` |
| Auth helpers | `src/lib/auth` and Supabase auth utilities |
| Middleware/session guard | `src/middleware.ts` |
| Hermes provider layer | `src/lib/hermes/providers.ts` |
| Hermes chat API | `src/app/api/v1/hermes/chat/route.ts` |
| Hermes tools | `src/lib/hermes/advanced-tools.ts` |
| Hermes skills | `src/lib/hermes/skills.ts` |
| Hermes memory | `src/lib/hermes/memory.ts` |
| Prisma SQLite schema | `prisma/schema.prisma` |
| Prisma PostgreSQL schema | `prisma/schema.postgres.prisma` |
| Package scripts | `package.json` |
| Project overview | `README.md` |
| Agent instructions | `CLAUDE.md`, `GEMINI.md`, `src/**/AGENTS.md` |

---

## 22. Definition of Done for Future Feature Work

A future feature is considered done when:

- Requirements are documented in PRD/plan or linked issue.
- Implementation follows existing SPA module architecture.
- Protected APIs use server-side auth and role checks.
- Prisma changes include schema updates, generation, and migration/push plan.
- UI handles loading, empty, success, and error states.
- TypeScript passes.
- Production build passes.
- Local preview smoke passes.
- No secrets are logged or committed.
- Relevant docs are updated.
