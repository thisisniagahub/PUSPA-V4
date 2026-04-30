# PuspaCareBot API Contracts

Load `docs/puspacarebot/PUSPACARE_KNOWLEDGE.md` first for product map and behavior rules.

## 1. Runtime env

Production:

```text
PUSPACARE_APP_BASE_URL=https://puspa.gangniaga.my
PUSPACARE_BOT_API_KEY=***
```

Local WSL fallback:

```text
PUSPACARE_APP_BASE_URL=http://127.0.0.1:3004
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
OPENCLAW_AGENT_MODEL=openclaw/puspacare
PUSPACARE_BOT_API_KEY=***
```

## 2. Auth

Every bot API request must include:

```text
Authorization: Bearer ***
```

Bot key format: `psbot_...`. Never log or display real keys.

## 3. Timeout/retry policy

- Normal read-only call timeout: 10 seconds.
- OpenClaw/model call timeout: 60-120 seconds depending on route.
- Retry network errors once for read-only calls.
- Do **not** retry mutation execute calls automatically.
- If auth returns 401/403, do not retry; report credential/config issue.

## 4. Redaction and PII rules

Never log or return:

```text
bearer tokens, raw cookies, Supabase keys, DB URLs, passwords, JWTs, raw bot keys
```

Minimize PII:

- mask IC/passport;
- mask phone/email;
- do not expose bank account unless explicitly authorized and necessary;
- summarize income as bands where possible;
- expose document presence/status rather than raw private URLs.

## 5. Bot-facing endpoints

| Endpoint | Methods | Contract |
|---|---:|---|
| `/api/v1/bot/health` | GET | Auth/config health for bot lane. |
| `/api/v1/bot/context` | GET | App identity, module map, safe action policy, model info. |
| `/api/v1/bot/dashboard` | GET | PII-minimized dashboard summary. |
| `/api/v1/bot/members` | GET | Member/asnaf summary. |
| `/api/v1/bot/cases` | GET | Case queue summary. |
| `/api/v1/bot/donations` | GET | Donation/reconciliation summary. |
| `/api/v1/bot/ekyc` | GET | eKYC queue/status summary. |
| `/api/v1/bot/ecoss-rpa` | POST | Sensitive RPA request; preview/queue, not blind execution. |
| `/api/v1/bot/actions/preview` | POST | Build action preview and approval record. |
| `/api/v1/bot/actions/execute` | POST | Execute only after approved WorkItem. |
| `/api/v1/bot/keys` | POST/GET/DELETE | Key management; never reveal existing raw keys. |

## 6. App APIs the bot can reason about

Bot should know these exist even if it cannot call every mutation endpoint directly:

```text
/api/v1/dashboard*, /api/v1/members, /api/v1/cases,
/api/v1/donations, /api/v1/donors*, /api/v1/disbursements,
/api/v1/programmes, /api/v1/activities, /api/v1/volunteers*,
/api/v1/documents*, /api/v1/compliance*, /api/v1/ekyc*,
/api/v1/tapsecure*, /api/v1/reports*, /api/v1/organization,
/api/v1/users, /api/v1/branches, /api/v1/partners,
/api/v1/board-members, /api/v1/ai/*, /api/v1/openclaw/*,
/api/v1/ops/*
```

## 7. Response schema guidance

For summaries, bot should shape output like:

```json
{
  "success": true,
  "summary": "short human-readable summary",
  "counts": {},
  "items": [],
  "risks": [],
  "suggestedActions": []
}
```

For blocked/approval-required actions:

```json
{
  "success": false,
  "code": "approval_required",
  "approvedActionId": "...",
  "message": "Approval required before execute",
  "nextStep": "Bo/admin approve WorkItem"
}
```

## 8. Smoke tests

Production:

```bash
PUSPACARE_APP_BASE_URL=https://puspa.gangniaga.my \
PUSPACARE_BOT_API_KEY=*** \
bun scripts/check-bot-apis.ts
```

Local:

```bash
PUSPACARE_APP_BASE_URL=http://127.0.0.1:3004 \
PUSPACARE_BOT_API_KEY=*** \
bun scripts/check-bot-apis.ts
```

Approval flow:

```bash
PUSPACARE_APP_BASE_URL=http://127.0.0.1:3004 \
PUSPACARE_BOT_API_KEY=*** \
bun scripts/check-bot-action-approval.ts
```
