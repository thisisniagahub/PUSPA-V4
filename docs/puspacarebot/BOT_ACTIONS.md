# PuspaCareBot Action Policy

## Read-only by default

PuspaCareBot is an ops assistant first. It can read summaries through guarded APIs.

## Directly blocked actions

These must never execute directly from chat:

- approve eKYC
- update member
- create/delete case
- mark donation reconciled
- send WhatsApp/SMS
- deploy production

## Required flow

```text
preview -> Bo/admin approval -> persisted approval record -> execute -> audit log -> bot report
```

Current implementation provides preview and blocks execute until approval storage is implemented.
