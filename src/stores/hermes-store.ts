import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ViewId } from '@/types'
import type { AppRole } from '@/lib/auth-shared'

export type HermesStatus = 'idle' | 'thinking' | 'error'

export interface HermesChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isToolResult?: boolean
  toolName?: string
}

export interface HermesClientAction {
  type: 'navigate' | 'create'
  viewId?: ViewId
  module?: string
  prefill?: Record<string, unknown>
}

export interface HermesState {
  isOpen: boolean
  status: HermesStatus
  messages: HermesChatMessage[]
  currentView: ViewId
  userRole: AppRole
  locale: 'ms' | 'en'
  pendingActions: HermesClientAction[]

  setOpen: (open: boolean) => void
  toggleOpen: () => void
  setStatus: (status: HermesStatus) => void
  addMessage: (msg: Omit<HermesChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  setCurrentView: (view: ViewId) => void
  setUserRole: (role: AppRole) => void
  setLocale: (locale: 'ms' | 'en') => void
  addPendingAction: (action: HermesClientAction) => void
  consumePendingAction: () => HermesClientAction | undefined
  sendMessage: (text: string) => Promise<void>
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
      clearMessages: () => set({ messages: [] }),
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

      sendMessage: async (text: string) => {
        const { messages, currentView, userRole, locale, addMessage, setStatus } = get()

        // Add user message
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
    }),
    {
      name: 'puspa-hermes-state',
      partialize: (state) => ({
        locale: state.locale,
        messages: state.messages.slice(-20),
      }),
    },
  ),
)
