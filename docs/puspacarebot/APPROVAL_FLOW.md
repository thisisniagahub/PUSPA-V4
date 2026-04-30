# Bot Approval Flow

## Preview

`POST /api/v1/bot/actions/preview` validates the requested action and returns:

- action id
- target entity
- risk level
- payload summary with redactions
- warnings
- `requiresApproval: true`
- `executable: false`

## Execute

`POST /api/v1/bot/actions/execute` currently returns `501` and writes a blocked audit event.

Real execution requires persistent approval storage, admin UI, and idempotency.

## Future storage fields

```text
id
botKeyId or bot metadata
actionType
targetEntity
targetEntityId
payload
preview
riskLevel
status: pending | approved | rejected | executed | expired | failed
approvedByUserId
approvedAt
executedAt
expiresAt
idempotencyKey
```
