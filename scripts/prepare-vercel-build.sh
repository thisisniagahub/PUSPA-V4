#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

is_placeholder() {
  local value="${1:-}"
  [[ "$value" == *"Settings → Database"* ]] || \
  [[ "$value" == *"Transaction pooler URI"* ]] || \
  [[ "$value" == *"Direct connection URI"* ]]
}

is_postgres_url() {
  local value="${1:-}"
  [[ "$value" == postgres://* ]] || [[ "$value" == postgresql://* ]]
}

POSTGRES_CANDIDATE=""
for candidate in "${DATABASE_URL:-}" "${POSTGRES_PRISMA_URL:-}" "${POSTGRES_URL:-}" "${POSTGRES_URL_NON_POOLING:-}" "${SUPABASE_DB_URL:-}"; do
  if is_postgres_url "$candidate" && ! is_placeholder "$candidate"; then
    POSTGRES_CANDIDATE="$candidate"
    break
  fi
done

USE_POSTGRES=0
if [[ "${DATABASE_PROVIDER:-}" == "postgresql" ]] || [[ -n "${VERCEL:-}" ]] || [[ -n "$POSTGRES_CANDIDATE" ]]; then
  if [[ -n "$POSTGRES_CANDIDATE" ]]; then
    USE_POSTGRES=1
  fi
fi

if [[ "$USE_POSTGRES" == "1" ]]; then
  echo "Preparing production build with PostgreSQL Prisma schema"
  cp prisma/schema.prisma /tmp/puspa-v4-schema.prisma.backup
  restore_schema() {
    if [[ -f /tmp/puspa-v4-schema.prisma.backup ]]; then
      cp /tmp/puspa-v4-schema.prisma.backup prisma/schema.prisma
      rm -f /tmp/puspa-v4-schema.prisma.backup
    fi
  }
  trap restore_schema EXIT
  cp prisma/schema.postgres.prisma prisma/schema.prisma
  export DATABASE_URL="$POSTGRES_CANDIDATE"
else
  echo "Preparing local/dev build with SQLite Prisma schema"
fi

prisma generate
next build
