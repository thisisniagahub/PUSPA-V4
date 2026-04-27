import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ViewId } from '@/types'
import type { AppRole } from '@/lib/auth-shared'
import type { ProviderId } from '@/lib/hermes/provider-types'

export type HermesStatus = 'idle' | 'thinking' | 'streaming' | 'error'

export interface HermesChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isToolResult?: boolean
  toolName?: string
  isStreaming?: boolean
  provider?: ProviderId
  model?: string
  latencyMs?: number
}

export interface HermesClientAction {
  type: 'navigate' | 'create'
  viewId?: ViewId
  module?: string
  prefill?: Record<string, unknown>
}

export interface HermesProviderState {
  provider: ProviderId
  model: string
  hasApiKey: boolean
  apiKeyPrefix: string | null
  baseUrl: string | null
  isConfigured: boolean
}

export interface HermesState {
  isOpen: boolean
  status: HermesStatus
  messages: HermesChatMessage[]
  currentView: ViewId
  userRole: AppRole
  locale: 'ms' | 'en'
  pendingActions: HermesClientAction[]
  showSettings: boolean
  providerState: HermesProviderState
  conversationId: string | null

  setOpen: (open: boolean) => void
  toggleOpen: () => void
  setStatus: (status: HermesStatus) => void
  addMessage: (msg: Omit<HermesChatMessage, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  finalizeLastMessage: (meta?: { provider?: ProviderId; model?: string; latencyMs?: number }) => void
  clearMessages: () => void
  setCurrentView: (view: ViewId) => void
  setUserRole: (role: AppRole) => void
  setLocale: (locale: 'ms' | 'en') => void
  addPendingAction: (action: HermesClientAction) => void
  consumePendingAction: () => HermesClientAction | undefined
  setShowSettings: (show: boolean) => void
  setProviderState: (state: Partial<HermesProviderState>) => void
  sendMessage: (text: string) => Promise<void>
  sendMessageStream: (text: string) => Promise<void>
  loadProviderConfig: () => Promise<void>
}

export const useHermesStore = create<HermesState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      status: 'idle',
      messages: [],
      currentView: 'dashboard',
      userRole: 'staff',
      locale: 'ms',
      pendingActions: [],
      showSettings: false,
      providerState: {
        provider: 'zai' as ProviderId,
        model: 'default',
        hasApiKey: false,
        apiKeyPrefix: null,
        baseUrl: null,
        isConfigured: true,
      },
      conversationId: null,

      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
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
          msgs[msgs.length - 1] = { ...last, content }
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
            ...(meta?.provider ? { provider: meta.provider } : {}),
            ...(meta?.model ? { model: meta.model } : {}),
            ...(meta?.latencyMs ? { latencyMs: meta.latencyMs } : {}),
          }
        }
        return { messages: msgs, status: 'idle' }
      }),
      clearMessages: () => set({ messages: [], conversationId: null }),
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
      setProviderState: (state) => set((s) => ({
        providerState: { ...s.providerState, ...state },
      })),

      sendMessage: async (text: string) => {
        const { messages, currentView, userRole, locale, addMessage, setStatus } = get()

        addMessage({ role: 'user', content: text })
        setStatus('thinking')

        try {
          const response = await fetch('/api/v1/hermes/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, { role: 'user' as const, content: text }].map(({ role, content }) => ({ role, content })),
              currentView,
              userRole,
              locale,
            }),
          })

          const json = await response.json()
          if (!json.success) throw new Error(json.error || 'Chat failed')

          const data = json.data
          addMessage({
            role: 'assistant',
            content: data.message.content || 'Maaf, saya tidak faham.',
            isToolResult: !!data.toolResult,
            toolName: data.toolResult?.name,
            provider: data.provider,
            model: data.model,
            latencyMs: data.latencyMs,
          })

          setStatus('idle')
        } catch (error) {
          addMessage({
            role: 'assistant',
            content: 'Maaf, saya mengalami masalah teknikal. Sila cuba lagi sebentar.',
          })
          setStatus('error')
        }
      },

      sendMessageStream: async (text: string) => {
        const { messages, currentView, userRole, locale, addMessage, setStatus, updateLastMessage, finalizeLastMessage, providerState } = get()

        addMessage({ role: 'user', content: text })
        setStatus('streaming')

        // Add placeholder streaming message
        addMessage({ role: 'assistant', content: '', isStreaming: true })

        try {
          const response = await fetch('/api/v1/hermes/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, { role: 'user' as const, content: text }].map(({ role, content }) => ({ role, content })),
              currentView,
              userRole,
              locale,
              stream: true,
            }),
          })

          // Check if response is actually a stream
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('text/event-stream')) {
            // Handle SSE stream
            const reader = response.body?.getReader()
            if (!reader) throw new Error('No stream reader')

            const decoder = new TextDecoder()
            let buffer = ''

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
                if (data === '[DONE]') continue

                try {
                  const chunk = JSON.parse(data)
                  if (chunk.type === 'content' && chunk.content) {
                    updateLastMessage(chunk.content) // Append-style handled in component
                  }
                  if (chunk.type === 'done') {
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
                  // Skip malformed
                }
              }
            }
          } else {
            // Non-streaming response (Z-AI fallback)
            const json = await response.json()
            if (!json.success) throw new Error(json.error || 'Chat failed')

            const data = json.data
            updateLastMessage(data.message.content || 'Maaf, saya tidak faham.')
            finalizeLastMessage({
              provider: data.provider,
              model: data.model,
              latencyMs: data.latencyMs,
            })
          }
        } catch (error) {
          finalizeLastMessage()
          addMessage({
            role: 'assistant',
            content: 'Maaf, saya mengalami masalah teknikal. Sila cuba lagi sebentar.',
          })
          setStatus('error')
        }
      },

      loadProviderConfig: async () => {
        try {
          const res = await fetch('/api/v1/hermes/config')
          const json = await res.json()
          if (json.success) {
            const { setProviderState } = get()
            setProviderState({
              provider: json.data.provider,
              model: json.data.model,
              hasApiKey: json.data.hasApiKey,
              apiKeyPrefix: json.data.apiKeyPrefix,
              baseUrl: json.data.baseUrl,
              isConfigured: true,
            })
          }
        } catch {
          // Use default config
        }
      },
    }),
    {
      name: 'puspa-hermes-state',
      partialize: (state) => ({
        locale: state.locale,
        messages: state.messages.slice(-30).map(m => ({
          ...m,
          isStreaming: false, // Don't persist streaming state
        })),
        providerState: {
          provider: state.providerState.provider,
          model: state.providerState.model,
        },
      }),
    },
  ),
)
