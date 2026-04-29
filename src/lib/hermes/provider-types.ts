// Hermes Agent — Shared Types (safe for client-side import)

export type ProviderId = 'openclaw' | 'openrouter' | 'ollama' | 'openai' | 'mock'

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
    description: 'Local AI Gateway for PuspaCare',
    requiresApiKey: true,
    requiresBaseUrl: true,
    defaultBaseUrl: 'http://127.0.0.1:18789/v1',
    defaultModel: 'openclaw/main',
    models: [
      { id: 'openclaw/main', name: 'OpenClaw Main', isFree: true }
    ],
    icon: '🦞'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI API',
    requiresApiKey: true,
    requiresBaseUrl: false,
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
    ],
    icon: '🤖'
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Akses 200+ model termasuk DeepSeek, Llama, Qwen — percuma & berbayar',
    requiresApiKey: true,
    requiresBaseUrl: false,
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'nousresearch/hermes-4-405b:free',
    models: [
      { id: 'nousresearch/hermes-4-405b:free', name: 'Hermes 4 405B (Free)', isFree: true },
      { id: 'nousresearch/deephermes-3-mistral-24b-preview:free', name: 'DeepHermes 3 24B (Free)', isFree: true },
      { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3 (Free)', isFree: true },
      { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick (Free)', isFree: true },
      { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (Free)', isFree: true },
      { id: 'qwen/qwen3-235b-a22b:free', name: 'Qwen3 235B (Free)', isFree: true },
      { id: 'microsoft/phi-4-reasoning-plus:free', name: 'Phi-4 Reasoning+ (Free)', isFree: true },
      { id: 'nousresearch/hermes-4-405b', name: 'Hermes 4 405B (Pro)' },
      { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
    ],
    icon: '🌐',
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Jalankan model AI di komputer tempatan — privasi penuh, tiada kos',
    requiresApiKey: false,
    requiresBaseUrl: true,
    defaultBaseUrl: 'http://localhost:11434/v1',
    defaultModel: 'hermes3',
    models: [
      { id: 'hermes3', name: 'Hermes 3 (Recommended)', isFree: true },
      { id: 'llama3.2', name: 'Llama 3.2', isFree: true },
      { id: 'qwen3', name: 'Qwen 3', isFree: true },
      { id: 'mistral', name: 'Mistral', isFree: true },
      { id: 'deepseek-r1', name: 'DeepSeek R1', isFree: true },
      { id: 'phi4', name: 'Phi-4', isFree: true },
    ],
    icon: '🦙',
  },
  mock: {
    id: 'mock',
    name: 'Mock Provider',
    description: 'For testing only',
    requiresApiKey: false,
    requiresBaseUrl: false,
    defaultModel: 'mock',
    models: [{ id: 'mock', name: 'Mock' }],
    icon: '🧪'
  }
}
