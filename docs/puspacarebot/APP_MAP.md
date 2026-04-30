# PUSPA-V4 App Map

This file is the quick map. For full bot operating knowledge, load `docs/puspacarebot/PUSPACARE_KNOWLEDGE.md` first.

## Source of truth

```text
Active app repo: /mnt/g/PUSPA-V4
GitHub:          https://github.com/thisisniagahub/PUSPA-V4.git
Runtime docs:    docs/puspacarebot/*.md
```

The VPS PuspaCareBot workspace is runtime/knowledge context only, not the full app repo.

## Architecture

- Next.js 16 App Router + React 19 + TypeScript.
- Prisma 6; SQLite locally via `prisma/schema.prisma`, PostgreSQL/Supabase in production via production schema/build prep.
- Supabase Auth is the primary user auth flow.
- Main UI screens are SPA-style modules in `src/modules/*`, rendered by `src/components/view-renderer.tsx`.
- Module metadata/search labels live in `src/lib/module-registry.ts`.
- Role gating lives in `src/lib/access-control.ts`; sidebar visibility is not authorization.
- API endpoints live under `src/app/api/v1/*`.
- OpenClaw/PuspaCareBot integration lives in `src/lib/openclaw.ts`, `src/lib/openclaw-agent/*`, `/api/v1/openclaw/*`, `/api/v1/bot/*`, and `/api/v1/ops/*`.

## Business domains

| Domain | Modules | Core APIs | Bot should help with |
|---|---|---|---|
| Overview | `dashboard` | `/api/v1/dashboard*` | KPIs, urgent focus, activity summary. |
| Beneficiaries | `members` | `/api/v1/members`, `/api/v1/bot/members` | Asnaf profile, household, income band, active cases, missing data. |
| Aid cases | `cases` | `/api/v1/cases`, `/api/v1/bot/cases` | Triage, priority, verification, documents, suggested next action. |
| Programmes | `programmes`, `asnafpreneur`, `kelas-ai`, `agihan-bulan`, `sedekah-jumaat` | `/api/v1/programmes`, `/api/v1/activities` | Planning, budgets, impact, participant follow-up. |
| Donations | `donations`, `donors` | `/api/v1/donations`, `/api/v1/donors*`, `/api/v1/bot/donations` | Reconciliation, receipt gaps, donor CRM follow-up. |
| Disbursement/goods | `disbursements`, `gudang-barangan` | `/api/v1/disbursements` | Payment readiness, receipts, stock/agihan suggestions. |
| Operations | `activities`, `volunteers`, `documents` | `/api/v1/activities`, `/api/v1/volunteers*`, `/api/v1/documents*` | Kanban/tasks, volunteer deployment/hours/certs, document completeness. |
| Compliance/identity | `compliance`, `ekyc`, `tapsecure` | `/api/v1/compliance*`, `/api/v1/ekyc*`, `/api/v1/tapsecure*` | ROS/PDPA, eKYC queue, device/biometric status. |
| Reports/admin | `reports`, `admin`, `settings` | `/api/v1/reports*`, `/api/v1/organization`, `/api/v1/users`, `/api/v1/branches`, `/api/v1/partners`, `/api/v1/board-members` | Financial reports, org profile, user/admin settings. |
| AI/Ops | `ai`, `ops-conductor`, `openclaw-*` | `/api/v1/ai/*`, `/api/v1/openclaw/*`, `/api/v1/ops/*`, `/api/v1/bot/*` | Chat/analytics, approvals, automations, model/gateway status. |

## Registered modules

Current registered module IDs:

```text
dashboard, members, cases, programmes, asnafpreneur, kelas-ai, agihan-bulan,
sedekah-jumaat, donations, donors, disbursements, gudang-barangan, activities,
volunteers, documents, compliance, ekyc, tapsecure, reports, admin,
ops-conductor, ai, openclaw-mcp, openclaw-plugins, openclaw-integrations,
openclaw-terminal, openclaw-agents, openclaw-models, openclaw-automation,
openclaw-graph, docs, settings
```

When adding a module, align all of these:

```text
src/types/index.ts
src/components/view-renderer.tsx
src/lib/module-registry.ts
src/components/sidebar/sidebar-config.ts
src/lib/access-control.ts if role-gated
src/modules/<module>/page.tsx
```

## Key data models

```text
User, Member, HouseholdMember, Programme, Case, CaseNote, CaseDocument,
Donation, Disbursement, Activity, OrganizationProfile, BoardMember, Partner,
ImpactMetric, PublicReport, ComplianceChecklist, AuditLog, Notification,
Capture, EKYCVerification, SecuritySettings, DeviceBinding, SecurityLog,
Volunteer, VolunteerDeployment, VolunteerHourLog, VolunteerCertificate,
Donor, DonorCommunication, TaxReceipt, Document, Branch, WorkItem,
ExecutionEvent, Artifact, AutomationJob, BotApiKey
```

## PuspaCareBot behavior rule

PuspaCareBot should not answer like a blank chatbot. It should use this map to:

1. infer the likely domain;
2. call/read the safest relevant summary endpoint;
3. provide a short answer;
4. suggest the next practical action;
5. create an approval preview for mutations instead of asking Bo to explain the whole system again.

Example:

```text
Bo: check kes urgent
Bot: summarize urgent cases + missing docs + ready-for-payment items + suggested action.
```

## Mutation safety

Read-only summaries are okay with bot API auth.

Dangerous actions require:

```text
preview -> WorkItem approval -> Bo/admin decision -> execute -> ExecutionEvent/audit -> report
```

Never directly approve eKYC, edit records, reconcile donations, send messages, rotate secrets, or deploy production from chat without an approval record.
