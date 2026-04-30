# Incident Playbook

## Login/dashboard down

1. Check production deployment status.
2. Verify Supabase/Postgres env names exist in Vercel.
3. Verify Supabase Auth public envs are configured.
4. Check `/login` and dashboard API status codes.
5. Do not print secrets.

## Bridge down

1. Check `puspa-openclaw-bridge.service` on VPS.
2. Check local `http://127.0.0.1:18181/health`.
3. Check public `/puspa-bridge/health`.
4. Verify bearer token config without printing it.

## Model lane down

Probe `openclaw/puspacare` directly through gateway. If response includes `deactivated_workspace`, gateway/channel may be alive but model workspace is not usable.
