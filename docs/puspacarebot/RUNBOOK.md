# PuspaCareBot Runbook

## Source boundaries

```text
App source: /mnt/g/PUSPA-V4
GitHub: https://github.com/thisisniagahub/PUSPA-V4.git
Bot workspace: /opt/operator/openclaw/workspace/puspacare
```

The VPS bot workspace is knowledge/runtime context, not the app source repo.

## Common checks

```bash
cd /mnt/g/PUSPA-V4
git status --short
bun x tsc --noEmit --pretty false
bun run lint
bun run build
```

## Bot API smoke

```bash
PUSPACARE_APP_BASE_URL=https://puspa.gangniaga.my \
PUSPACARE_BOT_API_KEY=psbot_REDACTED \
bun scripts/check-bot-apis.ts
```
