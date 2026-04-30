# PuspaCareBot API Contracts

## Runtime env

```text
PUSPACARE_APP_BASE_URL=https://puspa.gangniaga.my
PUSPACARE_BOT_API_KEY=psbot_...
```

## Auth

Every bot API request must include:

```text
Authorization: Bearer psbot_...
```

## Timeout/retry policy

- Timeout: 10 seconds for normal read-only calls.
- Retry: 1 retry for network errors only.
- Do not retry mutation execute calls automatically.

## Redaction

Never log bearer tokens, raw cookies, Supabase keys, DB URLs, passwords, or JWTs.

## Smoke test

```bash
PUSPACARE_APP_BASE_URL=https://puspa.gangniaga.my \
PUSPACARE_BOT_API_KEY=psbot_REDACTED \
bun scripts/check-bot-apis.ts
```
