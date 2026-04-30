# Security Boundaries

- PuspaCareBot remains read-only by default.
- `/api/v1/bot/*` uses bot bearer auth, not Supabase user cookies.
- CORS is not authorization.
- Never return secrets/token values from health endpoints.
- Mutations require preview, explicit approval, persisted approval record, execution, and audit log.
- Developer/root access belongs to separate Hermes/Codex workflow after Bo approves.
