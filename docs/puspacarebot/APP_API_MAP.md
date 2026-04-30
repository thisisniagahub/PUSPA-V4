# PUSPA-V4 Bot API Map

All `/api/v1/bot/*` endpoints are exempt from Supabase middleware and must enforce bot bearer auth inside the route.

## Required header

```text
Authorization: Bearer psbot_...
```

## Read-only endpoints

```text
GET /api/v1/bot/health
GET /api/v1/bot/context
GET /api/v1/bot/dashboard
GET /api/v1/bot/cases
GET /api/v1/bot/members
GET /api/v1/bot/donations
GET /api/v1/bot/ekyc
```

## Mutation-control endpoints

```text
POST /api/v1/bot/actions/preview
POST /api/v1/bot/actions/execute
```

`execute` is intentionally blocked until persistent approval storage exists.

## Data policy

- Return operational summaries.
- Do not expose raw DB connection strings.
- Do not expose secrets, password hashes, JWTs, API keys, or tokens.
- Avoid full sensitive records unless a scoped endpoint explicitly requires them.
