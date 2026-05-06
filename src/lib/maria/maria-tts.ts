/**
 * Maria TTS (Text-to-Speech) Integration
 * Handles speech synthesis with character state management
 */

import { useMariaCharacterStore } from "@/stores/maria-character-store"

interface TTSOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice | null
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

export class MariaTTS {
  private synth: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSpeaking = false

  constructor() {
    if (typeof window !== "undefined") {
      this.synth = window.speechSynthesis
    }
  }

  /**
   * Speak text with Maria character animation
   */
  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.synth) {
      throw new Error("Speech Synthesis not supported in this browser")
    }

    // Cancel any ongoing speech
    this.cancel()

    const {
      lang = "ms-MY",
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      voice = null,
      onStart,
      onEnd,
      onError,
    } = options

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        if (voice) {
          utterance.voice = voice
        }

        // Set Maria state to talking BEFORE speaking starts
        utterance.onstart = () => {
          this.isSpeaking = true
          useMariaCharacterStore.getState().setState("talking")
          useMariaCharacterStore.getState().setStreaming(true)
          onStart?.()
        }

        // Reset Maria state when speech ends
        utterance.onend = () => {
          this.isSpeaking = false
          this.currentUtterance = null
          useMariaCharacterStore.getState().setState("idle")
          useMariaCharacterStore.getState().setStreaming(false)
          onEnd?.()
          resolve()
        }

        // Handle errors
        utterance.onerror = (event) => {
          this.isSpeaking = false
          this.currentUtterance = null
          useMariaCharacterStore.getState().setState("idle")
          useMariaCharacterStore.getState().setStreaming(false)
          const error = new Error(`Speech synthesis error: ${event.error}`)
          onError?.(error)
          reject(error)
        }

        this.currentUtterance = utterance
        this.synth!.speak(utterance)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Stop current speech
   */
  public cancel(): void {
    if (this.synth) {
      this.synth.cancel()
      this.isSpeaking = false
      this.currentUtterance = null
      useMariaCharacterStore.getState().setState("idle")
      useMariaCharacterStore.getState().setStreaming(false)
    }
  }

  /**
   * Pause current speech
   */
  public pause(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.pause()
      useMariaCharacterStore.getState().setState("thinking")
    }
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.resume()
      useMariaCharacterStore.getState().setState("talking")
    }
  }

  /**
   * Check if currently speaking
   */
  public getIsSpeaking(): boolean {
    return this.isSpeaking
  }

  /**
   * Get available voices
   */
  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return []
    return this.synth.getVoices()
  }

  /**
   * Find Malay voice
   */
  public findMalayVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices()
    return voices.find(
      (voice) =>
        voice.lang.startsWith("ms") ||
        voice.lang.startsWith("id") ||
        voice.name.toLowerCase().includes("malay")
    ) || null
  }
}

// Singleton instance
export const mariaTTS = new MariaTTS()

/**
 * Hook-friendly speak function
 */
export async function speakWithMaria(
  text: string,
  options?: TTSOptions
): Promise<void> {
  return mariaTTS.speak(text, options)
}

/**
 * Utility: Speak with auto-cleanup on unmount
 */
export function createSpeechController() {
  const tts = new MariaTTS()
  let cleanupCalled = false

  return {
    speak: async (text: string, options?: TTSOptions) => {
      if (cleanupCalled) return
      return tts.speak(text, options)
    },
    cancel: () => {
      if (cleanupCalled) return
      tts.cancel()
    },
    pause: () => tts.pause(),
    resume: () => tts.resume(),
    cleanup: () => {
      cleanupCalled = true
      tts.cancel()
    },
  }
}
