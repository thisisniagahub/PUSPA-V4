# Model Policy

App integration should call:

```text
openclaw/puspacare
```

OpenClaw owns provider fallback internals. App/frontend/server code should not depend on Ollama/Gemini/Codex fallback order.

Codex should not be primary while workspace health can return:

```json
{"detail":{"code":"deactivated_workspace"}}
```

Always validate with a direct gateway probe before declaring PuspaCareBot live.
