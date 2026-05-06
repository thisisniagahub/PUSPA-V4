import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

export type MariaState = "idle" | "talking" | "thinking" | "listening"

interface MariaStateStore {
  state: MariaState
  isStreaming: boolean
  setState: (s: MariaState) => void
  setStreaming: (v: boolean) => void
}

export const useMariaCharacterStore = create<MariaStateStore>()(
  subscribeWithSelector((set) => ({
    state: "idle",
    isStreaming: false,
    setState: (state) => set({ state }),
    setStreaming: (isStreaming) => set({ isStreaming }),
  }))
)
