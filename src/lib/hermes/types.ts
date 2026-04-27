export type HermesMessageRole = 'user' | 'assistant' | 'system'

export interface HermesChatMessage {
  role: HermesMessageRole
  content: string
}

export interface HermesChatRequest {
  messages: HermesChatMessage[]
  currentView: string
  userRole: string
  locale: 'ms' | 'en'
}

export interface HermesClientAction {
  type: 'navigate' | 'create'
  viewId?: string
  module?: string
  prefill?: Record<string, unknown>
}

export interface HermesToolDefinition {
  name: string
  description: string
  parameters: Record<string, {
    type: 'string' | 'number' | 'boolean'
    description: string
    required?: boolean
    enum?: string[]
  }>
  handler: (args: Record<string, unknown>) => Promise<unknown>
}

export interface HermesChatResponse {
  success: boolean
  data: {
    message: { role: 'assistant'; content: string }
    clientAction?: HermesClientAction
    suggestions?: string[]
  }
  error?: string
}
