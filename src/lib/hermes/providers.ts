// ============================================================
// Hermes Agent — Multi-Provider Transport System
// ============================================================

export type ProviderId = 'openclaw' | 'openrouter' | 'ollama' | 'openai' | 'mock'
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

export interface LLMToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, unknown>
      required: string[]
    }
  }
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
// OpenClaw / OpenAI Compatible Provider
// ============================================================
async function callOpenAICompatible(
  messages: LLMMessage[],
  model: string,
  baseUrl: string,
  apiKey: string,
  tools?: LLMToolDefinition[],
  providerId: ProviderId = 'openai'
): Promise<LLMResponse> {
  const start = Date.now()
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`

  const body: Record<string, unknown> = {
    model,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: 0.7,
    max_tokens: 4096,
  }

  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = 'auto'
  }

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`${providerId} error (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const choice = data.choices?.[0]
  let content = choice?.message?.content || ''

  // Some OpenClaw upstream lanes can return a JSON error string inside a
  // successful OpenAI-compatible response. Do not leak that raw infrastructure
  // error into the PUSPA AI UI; surface a clean operational fallback instead.
  if (providerId === 'openclaw' && /deactivated_workspace/i.test(content)) {
    content = 'PUSPA AI sedang online, tetapi workspace upstream OpenClaw untuk mesej ini belum stabil. Cuba mesej ringkas dalam English dahulu sementara laluan Malay workspace diselaraskan.'
  }

  const toolCalls: LLMToolCall[] = []
  if (choice?.message?.tool_calls) {
    for (const tc of choice.message.tool_calls) {
      try {
        const args = typeof tc.function.arguments === 'string'
          ? JSON.parse(tc.function.arguments)
          : tc.function.arguments
        toolCalls.push({ name: tc.function.name, arguments: args })
      } catch {
        // Skip malformed
      }
    }
  }

  return {
    content,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    provider: providerId,
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
// OpenRouter Provider
// ============================================================
async function callOpenRouter(
  messages: LLMMessage[],
  model: string,
  apiKey: string,
  tools?: LLMToolDefinition[],
): Promise<LLMResponse> {
  const start = Date.now()
  const baseUrl = 'https://openrouter.ai/api/v1'

  const body: Record<string, unknown> = {
    model,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: 0.7,
    max_tokens: 4096,
  }

  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = 'auto'
  }

  const response = await fetchWithRetry(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://puspacare.app',
      'X-Title': 'PuspaCare PUSPA AI Assistant',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter error (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const choice = data.choices?.[0]
  const content = choice?.message?.content || ''

  const toolCalls: LLMToolCall[] = []
  if (choice?.message?.tool_calls) {
    for (const tc of choice.message.tool_calls) {
      try {
        const args = typeof tc.function.arguments === 'string'
          ? JSON.parse(tc.function.arguments)
          : tc.function.arguments
        toolCalls.push({ name: tc.function.name, arguments: args })
      } catch {
        // Skip malformed
      }
    }
  }

  return {
    content,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
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
// Ollama Provider
// ============================================================
async function callOllama(
  messages: LLMMessage[],
  model: string,
  baseUrl: string,
): Promise<LLMResponse> {
  const start = Date.now()
  const url = baseUrl.replace(/\/$/, '')

  const response = await fetchWithRetry(`${url}/chat/completions`, {
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
// Mock Provider
// ============================================================
async function callMock(
  messages: LLMMessage[],
): Promise<LLMResponse> {
  const start = Date.now()
  return {
    content: "This is a mock response.",
    provider: 'mock',
    model: 'mock',
    latencyMs: Date.now() - start,
  }
}

// ============================================================
// Fetch with Retry
// ============================================================
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (response.status === 429 || response.status >= 500) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      return response
    } catch (error: any) {
      lastError = error
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Request failed after retries')
}

// ============================================================
// Convert Hermes tools to OpenAI function calling format
// ============================================================
export async function convertToOpenAITools(): Promise<LLMToolDefinition[]> {
  const { hermesTools } = await import('./advanced-tools')
  return hermesTools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object' as const,
        properties: Object.fromEntries(
          Object.entries(tool.parameters).map(([name, p]) => [
            name,
            {
              type: p.type,
              description: p.description,
              ...(p.enum ? { enum: p.enum } : {}),
              ...(p.default !== undefined ? { default: p.default } : {}),
            },
          ])
        ),
        required: Object.entries(tool.parameters)
          .filter(([, p]) => p.required)
          .map(([name]) => name),
      },
    },
  }))
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
  useFunctionCalling?: boolean
}): Promise<LLMResponse> {
  const { provider, messages, model, apiKey, baseUrl, useFunctionCalling } = params

  switch (provider) {
    case 'openclaw': {
      if (!apiKey || !baseUrl) throw new Error('OpenClaw memerlukan API key dan Base URL')
      const tools = useFunctionCalling ? await convertToOpenAITools() : undefined
      return callOpenAICompatible(messages, model || PROVIDERS.openclaw.defaultModel, baseUrl, apiKey, tools, 'openclaw')
    }

    case 'openai': {
      if (!apiKey) throw new Error('OpenAI memerlukan API key')
      const tools = useFunctionCalling ? await convertToOpenAITools() : undefined
      return callOpenAICompatible(messages, model || PROVIDERS.openai.defaultModel, baseUrl || 'https://api.openai.com/v1', apiKey, tools, 'openai')
    }

    case 'openrouter': {
      if (!apiKey) throw new Error('OpenRouter memerlukan API key')
      const tools = useFunctionCalling ? await convertToOpenAITools() : undefined
      return callOpenRouter(messages, model || PROVIDERS.openrouter.defaultModel, apiKey, tools)
    }

    case 'ollama':
      if (!baseUrl) throw new Error('Ollama memerlukan base URL')
      return callOllama(messages, model || PROVIDERS.ollama.defaultModel, baseUrl)

    case 'mock':
      return callMock(messages)

    default:
      throw new Error(`Provider tidak diketahui: ${provider}`)
  }
}

export async function streamLLM(params: {
  provider: ProviderId
  messages: LLMMessage[]
  model?: string
  apiKey?: string
  baseUrl?: string
  onChunk: (chunk: StreamChunk) => void
}): Promise<void> {
  // Simplified streaming stub that just calls callLLM
  const res = await callLLM({ ...params, useFunctionCalling: false })
  params.onChunk({ type: 'content', content: res.content })
  if (res.toolCalls) {
    for (const tc of res.toolCalls) {
      params.onChunk({ type: 'tool_call', toolCall: tc })
    }
  }
}

// ============================================================
// Get provider config for a user from DB or Env
// ============================================================
export async function getProviderConfig(userId: string): Promise<{
  provider: ProviderId
  model: string
  apiKey?: string
  baseUrl?: string
}> {
  try {
    const { db } = await import('@/lib/db')
    const config = await db.hermesProviderConfig.findUnique({ where: { userId } })
    if (config) {
      const provider = config.provider as ProviderId
      // Env OpenClaw values are the operational source of truth for local preview
      // and VPS routing; use them to avoid stale per-user DB config pointing at
      // a deactivated upstream workspace.
      if (provider === 'openclaw') {
        return {
          provider,
          model: process.env.HERMES_MODEL || config.model || 'openclaw/puspacare',
          apiKey: process.env.HERMES_OPENAI_API_KEY || config.apiKey || undefined,
          baseUrl: process.env.HERMES_OPENAI_BASE_URL || config.baseUrl || undefined,
        }
      }

      return {
        provider,
        model: config.model,
        apiKey: config.apiKey || undefined,
        baseUrl: config.baseUrl || undefined,
      }
    }
  } catch (e) {
    // Graceful fallback if DB fails
  }

  // Fallback to env
  const defaultProvider = (process.env.HERMES_PROVIDER as ProviderId) || 'openclaw'
  return {
    provider: defaultProvider,
    model: process.env.HERMES_MODEL || 'openclaw/main',
    apiKey: process.env.HERMES_OPENAI_API_KEY || undefined,
    baseUrl: process.env.HERMES_OPENAI_BASE_URL || undefined
  }
}
