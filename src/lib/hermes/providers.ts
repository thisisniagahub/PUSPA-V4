// ============================================================
// Hermes Agent — Multi-Provider Transport System
// Inspired by NousResearch Hermes Agent provider architecture
// Supports: z-ai-web-dev-sdk (default/free), OpenRouter, Ollama
// ============================================================

export type ProviderId = 'zai' | 'openrouter' | 'ollama'
export { PROVIDERS } from './provider-types'
export type { ProviderInfo } from './provider-types'
import { PROVIDERS } from './provider-types'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMToolCall {
  name: string
  arguments: Record<string, unknown>
}

export interface LLMResponse {
  content: string
  toolCalls?: LLMToolCall[]
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  model?: string
  provider: ProviderId
  latencyMs: number
}

export interface StreamChunk {
  type: 'content' | 'tool_call' | 'tool_result' | 'done' | 'error'
  content?: string
  toolCall?: LLMToolCall
  toolResult?: { name: string; result: unknown }
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
}

// ============================================================
// Z-AI Provider (default, free)
// ============================================================
async function callZAI(
  messages: LLMMessage[],
  _model?: string,
  _apiKey?: string,
): Promise<LLMResponse> {
  const start = Date.now()
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()

  const completion = await zai.chat.completions.create({
    messages: messages.map(m => ({
      role: m.role === 'system' ? ('assistant' as const) : (m.role as 'user' | 'assistant'),
      content: m.content,
    })),
    thinking: { type: 'disabled' },
  })

  const content = completion.choices[0]?.message?.content || ''
  return {
    content,
    provider: 'zai',
    model: 'zai-default',
    latencyMs: Date.now() - start,
  }
}

// ============================================================
// OpenRouter Provider
// ============================================================
async function callOpenRouter(
  messages: LLMMessage[],
  model: string,
  apiKey: string,
): Promise<LLMResponse> {
  const start = Date.now()
  const baseUrl = 'https://openrouter.ai/api/v1'

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://puspacare.app',
      'X-Title': 'PuspaCare Hermes Agent',
    },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter error (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  return {
    content,
    provider: 'openrouter',
    model: data.model || model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens || 0,
      completionTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0,
    } : undefined,
    latencyMs: Date.now() - start,
  }
}

// ============================================================
// Ollama Provider (Local)
// ============================================================
async function callOllama(
  messages: LLMMessage[],
  model: string,
  baseUrl: string,
): Promise<LLMResponse> {
  const start = Date.now()
  const url = baseUrl.replace(/\/$/, '')

  const response = await fetch(`${url}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      stream: false,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Ollama error (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || data.message?.content || ''

  return {
    content,
    provider: 'ollama',
    model: data.model || model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens || 0,
      completionTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0,
    } : undefined,
    latencyMs: Date.now() - start,
  }
}

// ============================================================
// Unified Provider Call
// ============================================================
export async function callLLM(params: {
  provider: ProviderId
  messages: LLMMessage[]
  model?: string
  apiKey?: string
  baseUrl?: string
}): Promise<LLMResponse> {
  const { provider, messages, model, apiKey, baseUrl } = params

  switch (provider) {
    case 'zai':
      return callZAI(messages, model)

    case 'openrouter':
      if (!apiKey) throw new Error('OpenRouter memerlukan API key. Dapatkan di openrouter.ai/keys')
      return callOpenRouter(messages, model || PROVIDERS.openrouter.defaultModel, apiKey)

    case 'ollama':
      if (!baseUrl) throw new Error('Ollama memerlukan base URL (contoh: http://localhost:11434/v1)')
      return callOllama(messages, model || PROVIDERS.ollama.defaultModel, baseUrl)

    default:
      throw new Error(`Provider tidak diketahui: ${provider}`)
  }
}

// ============================================================
// Streaming Provider Call (OpenRouter & Ollama support SSE)
// ============================================================
export async function streamLLM(params: {
  provider: ProviderId
  messages: LLMMessage[]
  model?: string
  apiKey?: string
  baseUrl?: string
  onChunk: (chunk: StreamChunk) => void
}): Promise<void> {
  const { provider, messages, model, apiKey, baseUrl, onChunk } = params

  // Z-AI SDK doesn't support streaming natively, fallback to non-streaming
  if (provider === 'zai') {
    const result = await callZAI(messages, model)
    onChunk({ type: 'content', content: result.content })
    onChunk({ type: 'done', usage: result.usage })
    return
  }

  const start = Date.now()

  let url: string
  let headers: Record<string, string>

  if (provider === 'openrouter') {
    if (!apiKey) throw new Error('OpenRouter memerlukan API key')
    url = 'https://openrouter.ai/api/v1/chat/completions'
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://puspacare.app',
      'X-Title': 'PuspaCare Hermes Agent',
    }
  } else {
    // ollama
    if (!baseUrl) throw new Error('Ollama memerlukan base URL')
    url = `${baseUrl.replace(/\/$/, '')}/chat/completions`
    headers = { 'Content-Type': 'application/json' }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || PROVIDERS[provider].defaultModel,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`${provider} error (${response.status}): ${errText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response stream')

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          onChunk({ type: 'done' })
          return
        }

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta
          if (delta?.content) {
            onChunk({ type: 'content', content: delta.content })
          }
          if (parsed.usage) {
            onChunk({
              type: 'done',
              usage: {
                promptTokens: parsed.usage.prompt_tokens || 0,
                completionTokens: parsed.usage.completion_tokens || 0,
                totalTokens: parsed.usage.total_tokens || 0,
              },
            })
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  onChunk({ type: 'done' })
}

// Get provider config for a user from DB
export async function getProviderConfig(userId: string): Promise<{
  provider: ProviderId
  model: string
  apiKey?: string
  baseUrl?: string
}> {
  const { db } = await import('@/lib/db')
  const config = await db.hermesProviderConfig.findUnique({ where: { userId } })

  if (!config) {
    return { provider: 'zai', model: 'default' }
  }

  return {
    provider: config.provider as ProviderId,
    model: config.model,
    apiKey: config.apiKey || undefined,
    baseUrl: config.baseUrl || undefined,
  }
}
