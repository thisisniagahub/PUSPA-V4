# Hermes Agent Integration (Local) for PUSPA-V4

This guide explains how to run **Hermes Agent** locally and connect it safely with this project.

## 1) Prerequisites
- Linux/macOS/WSL2
- Python 3.11+
- `uv` installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

## 2) Install Hermes locally
```bash
git clone https://github.com/NousResearch/hermes-agent.git /tmp/hermes-agent
cd /tmp/hermes-agent
uv venv venv --python 3.11
source venv/bin/activate
uv pip install -e ".[all]"
```

## 3) Start Hermes CLI (local)
```bash
cd /tmp/hermes-agent
source venv/bin/activate
./hermes
```

Then inside Hermes:
- `hermes setup`
- `hermes model`
- set model/provider as needed

## 4) PUSPA-recommended model target
For consistency with current app agent defaults, use:
- `openclaw/puspacare`

## 5) Optional: run Hermes Gateway
```bash
hermes gateway setup
hermes gateway start
```

## 6) Safety notes for this repo
- Do not commit real API tokens.
- Keep Hermes credentials in local shell env / secret manager only.
- If using workspace tools, set working dir to this repository:
  - `/workspace/PUSPA-V4`

## 7) Quick health checks
```bash
hermes --help
hermes doctor
```


## 8) Local-only bridge + RBAC (PUSPA API)
New endpoints:
- `GET /api/v1/hermes/health` (admin/developer)
- `POST /api/v1/hermes/execute` (admin/developer)

Environment flags:
- `HERMES_LOCAL_ONLY=true` (default; blocks non-dry-run execution)
- `HERMES_WEBHOOKS_ENABLED=false` (default unless explicitly enabled)
- `HERMES_GATEWAY_URL=http://127.0.0.1:18789`

Example execute payload (safe):
```json
{ "task": "Semak readiness dashboard", "currentView": "dashboard", "dryRun": true }
```
