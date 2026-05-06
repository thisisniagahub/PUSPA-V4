/**
 * Maria Floating Widget - AI Assistant Chat Interface
 * Integrates Maria Avatar with chat functionality
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useMariaCharacterStore } from "@/stores/maria-character-store"
import { MariaAvatarUnified } from "./maria/MariaAvatarUnified"
import { mariaTTS, speakWithMaria } from "@/lib/maria/maria-tts"
import { Mic, MicOff, Send, X, MessageCircle, Volume2, VolumeX } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function MariaFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { setState } = useMariaCharacterStore()

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Handle sending message
  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setState("thinking")

    try {
      // Call AI API (replace with your actual API endpoint)
      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.message || "Maaf, saya tidak dapat memproses permintaan anda.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setState("talking")

      // Speak response if not muted
      if (!isMuted && typeof window !== "undefined") {
        await speakWithMaria(assistantMessage.content, {
          lang: "ms-MY",
          rate: 1.0,
          onEnd: () => setState("idle"),
        })
      } else {
        setState("idle")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Maaf, berlaku ralat. Sila cuba lagi.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setState("idle")
    }
  }

  // Handle voice input (Web Speech API)
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      // Stop speech recognition
    } else {
      setIsRecording(true)
      // Start speech recognition (implement based on browser support)
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = "ms-MY"
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputValue(transcript)
          setIsRecording(false)
        }

        recognition.onerror = () => {
          setIsRecording(false)
        }

        recognition.start()
      }
    }
  }

  // Toggle TTS mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      mariaTTS.cancel()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <AnimatePresence>
          {!isOpen && (
            <Button
              size="icon"
              className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-8 w-8" />
            </Button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-96"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-2xl overflow-hidden border-0">
              {/* Header with Maria Avatar */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden">
                    <MariaAvatarUnified mode="framer" className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Maria AI Assistant</h3>
                    <p className="text-xs text-white/80">Online • PUSPA-Z</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => {
                      setIsOpen(false)
                      mariaTTS.cancel()
                      setState("idle")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea ref={scrollRef} className="h-80 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <MariaAvatarUnified mode="framer" className="w-20 h-20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Hai! Saya Maria. Bagaimana boleh saya bantu anda hari ini?
                      </p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-3 flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className={`h-10 w-10 rounded-full ${isRecording ? "bg-red-100 text-red-600 border-red-300" : ""}`}
                  onClick={toggleRecording}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Taip mesej anda..."
                  className="flex-1"
                />
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
