import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ViewId } from '@/types'
import type { AppRole } from '@/lib/auth-shared'
import type { ProviderId } from '@/lib/openclaw-agent/provider-types'

export type OpenClawStatus = 'idle' | 'thinking' | 'streaming' | 'error'

// ============================================================
// Execution Trace Types (Retail Agent Dashboard)
// ============================================================
export type AgentStepStatus = 'pending' | 'running' | 'completed' | 'error'

export interface AgentStep {
  id: string
  type: 'planning' | 'tool_call' | 'processing' | 'thinking' | 'success' | 'error'
  label: string
  detail?: string
  status: AgentStepStatus
  timestamp: number
  duration?: number
  toolName?: string
  toolArgs?: Record<string, unknown>
  result?: string
}

export interface OpenClawAgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isToolResult?: boolean
  toolName?: string
  toolResults?: { name: string; result: unknown }[]
  isStreaming?: boolean
  provider?: ProviderId
  model?: string
  latencyMs?: number
  clientAction?: {
    type: 'navigate' | 'create' | 'update' | 'delete' | 'export' | 'refresh' | 'notification'
    viewId?: string
    module?: string
    recordId?: string
    message?: string
  }
  // Execution trace steps for this message
  steps?: AgentStep[]
}

export interface OpenClawClientAction {
  type: 'navigate' | 'create' | 'update' | 'delete' | 'export'
  viewId?: ViewId
  module?: string
  recordId?: string
  prefill?: Record<string, unknown>
  message?: string
}

export interface OpenClawProviderState {
  provider: ProviderId
  model: string
  hasApiKey: boolean
  apiKeyPrefix: string | null
  baseUrl: string | null
  isConfigured: boolean
}

export type OpenClawViewMode = 'panel' | 'fullscreen'

export interface OpenClawState {
  isOpen: boolean
  viewMode: OpenClawViewMode
  status: OpenClawStatus
  messages: OpenClawAgentMessage[]
  currentView: ViewId
  userRole: AppRole
  locale: 'ms' | 'en'
  pendingActions: OpenClawClientAction[]
  showSettings: boolean
  providerState: OpenClawProviderState
  conversationId: string | null
  showHistory: boolean
  // Execution trace
  activeSteps: AgentStep[]

  setOpen: (open: boolean) => void
  toggleOpen: () => void
  setViewMode: (mode: OpenClawViewMode) => void
  setStatus: (status: OpenClawStatus) => void
  addMessage: (msg: Omit<OpenClawAgentMessage, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  finalizeLastMessage: (meta?: { 
    provider?: ProviderId; 
    model?: string; 
    latencyMs?: number; 
    clientAction?: OpenClawAgentMessage['clientAction'] 
  }) => void
  clearMessages: () => void
  setCurrentView: (view: ViewId) => void
  setUserRole: (role: AppRole) => void
  setLocale: (locale: 'ms' | 'en') => void
  addPendingAction: (action: OpenClawClientAction) => void
  consumePendingAction: () => OpenClawClientAction | undefined
  setShowSettings: (show: boolean) => void
  setShowHistory: (show: boolean) => void
  setProviderState: (state: Partial<OpenClawProviderState>) => void
  sendMessage: (text: string) => Promise<void>
  sendMessageStream: (text: string) => Promise<void>
  loadProviderConfig: () => Promise<void>
  // Execution trace
  addStep: (step: Omit<AgentStep, 'id' | 'timestamp'>) => string
  updateStep: (stepId: string, updates: Partial<AgentStep>) => void
  clearSteps: () => void
  finalizeSteps: () => void
}

let stepCounter = 0

export const useOpenClawStore = create<OpenClawState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      viewMode: 'panel' as OpenClawViewMode,
      status: 'idle' as OpenClawStatus,
      messages: [],
      currentView: 'dashboard',
      userRole: 'staff',
      locale: 'ms',
      pendingActions: [],
      showSettings: false,
      showHistory: false,
      providerState: {
        provider: 'hermes' as ProviderId, // UPDATED: Default to 'hermes' (Vercel-native)
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        hasApiKey: true, // OpenRouter key is server-side
        apiKeyPrefix: null,
        baseUrl: null,
        isConfigured: true,
      },
      conversationId: null,
      activeSteps: [],

      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
      setViewMode: (mode) => set({ viewMode: mode }),
      setStatus: (status) => set({ status }),
      addMessage: (msg) => set((s) => ({
        messages: [...s.messages, {
          ...msg,
          id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
        }],
      })),
      updateLastMessage: (content) => set((s) => {
        const msgs = [...s.messages]
        const last = msgs[msgs.length - 1]
        if (last && last.role === 'assistant') {
          msgs[msgs.length - 1] = { ...last, content: last.content + content }
        }
        return { messages: msgs }
      }),
      finalizeLastMessage: (meta) => set((s) => {
        const msgs = [...s.messages]
        const last = msgs[msgs.length - 1]
        if (last && last.role === 'assistant') {
          msgs[msgs.length - 1] = {
            ...last,
            isStreaming: false,
            steps: [...s.activeSteps],
            ...(meta?.provider ? { provider: meta.provider } : {}),
            ...(meta?.model ? { model: meta.model } : {}),
            ...(meta?.latencyMs ? { latencyMs: meta.latencyMs } : {}),
            ...(meta?.clientAction ? { clientAction: meta.clientAction } : {}),
          }
        }
        return { messages: msgs, status: 'idle', activeSteps: [] }
      }),
      clearMessages: () => set({ messages: [], conversationId: null, activeSteps: [] }),
      setCurrentView: (view) => set({ currentView: view }),
      setUserRole: (role) => set({ userRole: role }),
      setLocale: (locale) => set({ locale }),
      addPendingAction: (action) => set((s) => ({
        pendingActions: [...s.pendingActions, action],
      })),
      consumePendingAction: () => {
        const actions = get().pendingActions
        if (actions.length === 0) return undefined
        const [first, ...rest] = actions
        set({ pendingActions: rest })
        return first
      },
      setShowSettings: (show) => set({ showSettings: show }),
      setShowHistory: (show) => set({ showHistory: show }),
      setProviderState: (state) => set((s) => ({
        providerState: { ...s.providerState, ...state },
      })),

      // Execution trace
      addStep: (step) => {
        const id = `step-${++stepCounter}-${Date.now()}`
        set((s) => ({
          activeSteps: [...s.activeSteps, { ...step, id, timestamp: Date.now() }],
        }))
        return id
      },
      updateStep: (stepId, updates) => set((s) => ({
        activeSteps: s.activeSteps.map((step) =>
          step.id === stepId ? { ...step, ...updates } : step
        ),
      })),
      clearSteps: () => set({ activeSteps: [] }),
      finalizeSteps: () => {
        set((s) => ({
          activeSteps: s.activeSteps.map((step) =>
            step.status === 'running' ? { ...step, status: 'completed' as AgentStepStatus } : step
          ),
        }))
      },

      // ============================================================
      // sendMessage: Non-streaming fallback (for compatibility)
      // ============================================================
      sendMessage: async (text: string) => {
        const { messages, currentView, userRole, locale, addMessage, setStatus, addStep, updateStep, finalizeLastMessage } = get()

        addMessage({ role: 'user', content: text })
        setStatus('thinking')

        const planStepId = addStep({ type: 'planning', label: 'Merancang', detail: 'Menganalisis permintaan anda...', status: 'running' })

        try {
          // UPDATED: Point to /api/v1/ai (Hermes Vercel-Native)
          const response = await fetch('/api/v1/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, { role: 'user' as const, content: text }].map(({ role, content }) => ({ role, content })),
              currentView,
              userRole,
              locale,
            }),
          })

          updateStep(planStepId, { status: 'completed', detail: 'Permintaan dianalisis' })

          const json = await response.json()
          if (!json.success) throw new Error(json.error || 'Chat failed')

          const data = json.data

          // If tool was used, add tool step
          if (data.toolResult) {
            const toolStepId = addStep({ type: 'tool_call', label: `Alat: ${data.toolResult.name}`, detail: 'Menjalankan alat...', status: 'running', toolName: data.toolResult.name })
            updateStep(toolStepId, { status: 'completed', detail: 'Alat berjaya dilaksanakan' })
          }

          // Add success step
          addStep({ type: 'success', label: 'Selesai', detail: 'Respons dijana', status: 'completed' })

          addMessage({
            role: 'assistant',
            content: data.message?.content || 'Maaf, saya tidak faham.',
            isToolResult: !!data.toolResult,
            toolName: data.toolResult?.name,
            provider: data.provider,
            model: data.model,
            latencyMs: data.latencyMs,
            clientAction: data.clientAction,
          })

          // Process client actions
          if (data.clientAction) {
            get().addPendingAction(data.clientAction)
          }
          if (data.clientActions) {
            for (const action of data.clientActions) {
              get().addPendingAction(action)
            }
          }

          finalizeLastMessage({
            provider: data.provider,
            model: data.model,
            latencyMs: data.latencyMs,
            clientAction: data.clientAction,
          })
        } catch (error) {
          updateStep(planStepId, { status: 'error', detail: 'Ralat berlaku' })
          addMessage({
            role: 'assistant',
            content: 'Maaf, saya mengalami masalah teknikal. Sila cuba lagi sebentar.',
          })
          finalizeLastMessage()
        }
      },

      // ============================================================
      // sendMessageStream: Streaming response from /api/v1/ai (Hermes)
      // UPDATED: Now uses Vercel AI SDK streaming format
      // ============================================================
      sendMessageStream: async (text: string) => {
        const { messages, currentView, userRole, locale, addMessage, setStatus, updateLastMessage, finalizeLastMessage, providerState, addStep, updateStep } = get()

        addMessage({ role: 'user', content: text })
        setStatus('streaming')

        // Add execution trace steps
        const planStepId = addStep({ type: 'planning', label: 'Merancang', detail: 'Menganalisis permintaan anda...', status: 'running' })

        // Add placeholder streaming message
        addMessage({ role: 'assistant', content: '', isStreaming: true })

        try {
          // UPDATED: Point to /api/v1/ai (Hermes Vercel-Native)
          const response = await fetch('/api/v1/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, { role: 'user' as const, content: text }].map(({ role, content }) => ({ role, content })),
              currentView,
              userRole,
              locale,
            }),
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          // Check if response is a stream
          const contentType = response.headers.get('content-type') || ''

          if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
            // Streaming response from Vercel AI SDK
            updateStep(planStepId, { status: 'completed', detail: 'Permintaan dianalisis' })
            addStep({ type: 'thinking', label: 'Menjana respons', detail: 'AI sedang memproses...', status: 'running' })

            const reader = response.body?.getReader()
            if (!reader) throw new Error('No stream reader available')

            const decoder = new TextDecoder()
            let buffer = ''
            let hasToolCall = false

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += decoder.decode(value, { stream: true })

              // Process complete lines (Vercel AI SDK may send chunks as raw text)
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed) continue

                // Try to parse as JSON (if Vercel AI SDK sends structured data)
                try {
                  const chunk = JSON.parse(trimmed)
                  if (chunk.type === 'content' && chunk.content) {
                    updateLastMessage(chunk.content)
                  }
                  if (chunk.type === 'tool_call' && chunk.toolCall) {
                    hasToolCall = true
                    const toolStepId = addStep({ 
                      type: 'tool_call', 
                      label: `Alat: ${chunk.toolCall.name || 'unknown'}`, 
                      detail: 'Menjalankan alat...', 
                      status: 'running', 
                      toolName: chunk.toolCall.name 
                    })
                    updateStep(toolStepId, { status: 'completed', detail: 'Alat dilaksanakan' })
                  }
                  if (chunk.type === 'done') {
                    // Add success step
                    if (hasToolCall) {
                      addStep({ type: 'success', label: 'Selesai', detail: 'Alat & respons berjaya', status: 'completed' })
                    } else {
                      addStep({ type: 'success', label: 'Selesai', detail: 'Respons dijana', status: 'completed' })
                    }
                    finalizeLastMessage({
                      provider: providerState.provider,
                      latencyMs: chunk.usage?.totalTokens,
                    })
                  }
                  if (chunk.type === 'error') {
                    finalizeLastMessage()
                    addMessage({
                      role: 'assistant',
                      content: `Ralat: ${chunk.content || 'Stream error'}`,
                    })
                  }
                } catch {
                  // If not JSON, treat as plain text chunk
                  updateLastMessage(trimmed)
                }
              }
            }

            // If we get here without a 'done' chunk, still finalize
            addStep({ type: 'success', label: 'Selesai', detail: 'Respons dijana', status: 'completed' })
            finalizeLastMessage({
              provider: providerState.provider,
            })
          } else {
            // Non-streaming response fallback (shouldn't happen with /api/v1/ai)
            updateStep(planStepId, { status: 'completed', detail: 'Permintaan dianalisis' })

            const json = await response.json()
            if (!json.success) throw new Error(json.error || 'Chat failed')

            const data = json.data

            if (data.toolResult) {
              addStep({ type: 'tool_call', label: `Alat: ${data.toolResult.name}`, detail: 'Menjalankan alat...', status: 'running', toolName: data.toolResult.name })
              addStep({ type: 'success', label: 'Selesai', detail: 'Alat & respons berjaya', status: 'completed' })
            } else {
              addStep({ type: 'success', label: 'Selesai', detail: 'Respons dijana', status: 'completed' })
            }

            updateLastMessage(data.message?.content || 'Maaf, saya tidak faham.')

            finalizeLastMessage({
              provider: data.provider,
              model: data.model,
              latencyMs: data.latencyMs,
              clientAction: data.clientAction,
            })
          }
        } catch (error) {
          updateStep(planStepId, { status: 'error', detail: 'Ralat berlaku' })
          finalizeLastMessage()
          addMessage({
            role: 'assistant',
            content: 'Maaf, saya mengalami masalah teknikal. Sila cuba lagi sebentar.',
          })
        }
      },

      // ============================================================
      // loadProviderConfig: Simplified (no external gateway)
      // ============================================================
      loadProviderConfig: async () => {
        try {
          // UPDATED: No need to fetch from /api/v1/openclaw/config
          // Hermes runs natively in Next.js, config is server-side
          const { setProviderState } = get()
          setProviderState({
            provider: 'hermes',
            model: process.env.NEXT_PUBLIC_HERMES_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
            hasApiKey: true, // Server-side env var
            apiKeyPrefix: null,
            baseUrl: null,
            isConfigured: true,
          })
        } catch {
          // Use default config
        }
      },
    }),
    {
      name: 'puspa-ai-state',
      partialize: (state) => ({
        locale: state.locale,
        messages: state.messages.slice(-30).map(m => ({
          ...m,
          isStreaming: false,
          steps: m.steps?.map(s => ({ ...s, status: 'completed' as AgentStepStatus })),
        })),
        providerState: {
          provider: state.providerState.provider,
          model: state.providerState.model,
        },
        viewMode: state.viewMode,
      }),
    },
  ),
)
