// OpenClaw Agent — Shared Types (safe for client-side import)

export type ProviderId = 'openclaw'

export interface ProviderInfo {
  id: ProviderId
  name: string
  description: string
  requiresApiKey: boolean
  requiresBaseUrl: boolean
  defaultBaseUrl?: string
  defaultModel: string
  models: { id: string; name: string; isFree?: boolean }[]
  icon: string
}

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  openclaw: {
    id: 'openclaw',
    name: 'OpenClaw Gateway',
    description: 'OpenClaw Gateway agent-first API via /v1/chat/completions',
    requiresApiKey: true,
    requiresBaseUrl: true,
    defaultBaseUrl: 'http://127.0.0.1:18789',
    defaultModel: 'openclaw/puspacare',
    models: [
      { id: 'openclaw/puspacare', name: 'OpenClaw PUSPA Care', isFree: true },
      { id: 'openclaw/main', name: 'OpenClaw Main', isFree: true },
      { id: 'openclaw/default', name: 'OpenClaw Default', isFree: true },
    ],
    icon: '🦞',
  },
}
