#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

bash scripts/setup-hermes-local-env.sh .env.local

echo "[STEP] Start Hermes in terminal A: bun run hermes:local"
echo "[STEP] Start PUSPA in terminal B: bun run dev"
echo "[STEP] Login as admin/developer and test: GET /api/v1/hermes/health"
