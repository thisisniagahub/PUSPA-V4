#!/usr/bin/env bash
set -euo pipefail

HERMES_DIR="${HERMES_DIR:-/tmp/hermes-agent}"

if ! command -v uv >/dev/null 2>&1; then
  echo "[ERROR] uv is not installed. Install: curl -LsSf https://astral.sh/uv/install.sh | sh"
  exit 1
fi

if [ ! -d "$HERMES_DIR" ]; then
  echo "[INFO] Cloning Hermes Agent to $HERMES_DIR"
  git clone https://github.com/NousResearch/hermes-agent.git "$HERMES_DIR"
fi

cd "$HERMES_DIR"

if [ ! -d "venv" ]; then
  echo "[INFO] Creating Python venv"
  uv venv venv --python 3.11
fi

# shellcheck disable=SC1091
source venv/bin/activate

echo "[INFO] Installing Hermes editable package"
uv pip install -e ".[all]"

echo "[INFO] Launching Hermes CLI"
exec ./hermes
