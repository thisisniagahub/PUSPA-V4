#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.local}"

touch "$ENV_FILE"

add_or_update() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf "%s=%s\n" "$key" "$value" >> "$ENV_FILE"
  fi
}

add_or_update "HERMES_LOCAL_ONLY" "true"
add_or_update "HERMES_WEBHOOKS_ENABLED" "false"
add_or_update "HERMES_GATEWAY_URL" "http://127.0.0.1:18789"

echo "[OK] Hermes local env configured in $ENV_FILE"
