// OpenClaw Agent — Shared Types (safe for client-side import)

export type ProviderId = 'openclaw' | 'hermes' // UPDATED: Added 'hermes'

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
  // ADDED: Hermes Vercel-Native Provider
  hermes: {
    id: 'hermes',
    name: 'Hermes (Vercel-Native)',
    description: 'Hermes AI running natively in Next.js via Vercel AI SDK + OpenRouter',
    requiresApiKey: false, // Server-side env var
    requiresBaseUrl: false,
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    models: [
      { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)', isFree: true },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', isFree: true },
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' },
    ],
    icon: '🦾',
  },
}
