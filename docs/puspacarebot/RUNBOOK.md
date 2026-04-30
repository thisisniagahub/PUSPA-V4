# PuspaCareBot Runbook

For full project knowledge, load `docs/puspacarebot/PUSPACARE_KNOWLEDGE.md` first.

## 1. Source boundaries

```text
App source:       /mnt/g/PUSPA-V4
GitHub:           https://github.com/thisisniagahub/PUSPA-V4.git
Bot workspace:    /opt/operator/openclaw/workspace/puspacare
Production app:   https://puspa.gangniaga.my
Local app common: http://127.0.0.1:3001 or http://127.0.0.1:3004
```

The VPS bot workspace is knowledge/runtime context, not the app source repo. Use `/mnt/g/PUSPA-V4` for code changes.

## 2. Current local WSL fallback mode

Use this when VPS is expired/offline and Bo says to run locally:

```text
OpenClaw WSL gateway:  http://127.0.0.1:19001
Local OpenAI bridge:   http://127.0.0.1:18789/v1
PUSPA local app:       http://127.0.0.1:3004
Model exposed to app:  openclaw/puspacare
```

Health checks:

```bash
curl -fsS http://127.0.0.1:19001/health
curl -fsS http://127.0.0.1:18789/health
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3004/login
```

If PC/WSL sleeps or restarts, local bot/app goes down. For public Telegram access while local, use a tunnel such as Cloudflare Tunnel.

## 3. Common repo checks

```bash
cd /mnt/g/PUSPA-V4
git status --short
git branch --show-current
git log -1 --oneline
```

Validation:

```bash
npx tsc --noEmit --pretty false
npm run lint
npm run build
```

Bun equivalent:

```bash
bun x tsc --noEmit --pretty false
bun run lint
bun run build
```

If Next build is slow on `/mnt/g` WSL mount, run it as a tracked background process instead of repeatedly blocking foreground.

## 4. Bot API smoke

Never print a real token. Use environment variable only.

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

Approval flow smoke, if available:

```bash
PUSPACARE_APP_BASE_URL=http://127.0.0.1:3004 \
PUSPACARE_BOT_API_KEY=*** \
bun scripts/check-bot-action-approval.ts
```

## 5. Operator response pattern

When Bo asks for status or help, answer with:

```text
Status:
- App:
- Bot API:
- OpenClaw:
- Data focus:
- Blocker:

Cadangan next:
1.
2.
3.
```

Do not ask Bo to repeat basic project structure. Use the knowledge docs and app APIs first.

## 6. What to check by task

| Task | Check first | Then suggest |
|---|---|---|
| Dashboard health | `/api/v1/bot/dashboard`, `/api/v1/dashboard/stats` | urgent domain focus |
| Cases | `/api/v1/bot/cases` or `/api/v1/cases` | assign/request docs/approve aid preview |
| Members | `/api/v1/bot/members` or `/api/v1/members` | update missing data/open case/eKYC |
| Donations | `/api/v1/bot/donations` or `/api/v1/donations` | reconcile/receipt/follow-up preview |
| eKYC | `/api/v1/bot/ekyc` or `/api/v1/ekyc` | approve/reject preview/admin review |
| OpenClaw | `/api/v1/openclaw/health`, gateway health | fix env/model/gateway/tunnel |
| Automation | `/api/v1/ops/work-items`, `/api/v1/ops/intent` | WorkItem with approval |

## 7. VPS rule

If VPS is unpaid/offline and SSH times out, do not treat it as code failure. Report:

```text
VPS unreachable/offline. Local WSL mode can continue. VPS tasks resume after billing/host restored.
```

## 8. Secret rule

Always redact:

```text
tokens, API keys, bearer values, DB URLs, JWTs, cookies, passwords, raw bot keys
```

Bot key prefix is `psbot_`; only show it as `[REDACTED]`.
