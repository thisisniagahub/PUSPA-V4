'use client'

import * as React from 'react'
import { Send, Loader2, RotateCcw, Settings, Paperclip, Mic, Slash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UnifiedChatInputProps {
  onSend: (text: string) => void
  value?: string
  onValueChange?: (value: string) => void
  onClear?: () => void
  onToggleSettings?: () => void
  disabled?: boolean
  placeholder?: string
  isBusy?: boolean
  providerInfo?: { icon: string; name: string }
  modelLabel?: string
}

export function UnifiedChatInput({
  onSend,
  value,
  onValueChange,
  onClear,
  onToggleSettings,
  disabled,
  placeholder,
  isBusy,
  providerInfo,
  modelLabel,
}: UnifiedChatInputProps) {
  const [internalInput, setInternalInput] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const id = React.useId()
  const input = value ?? internalInput
  const setInput = onValueChange ?? setInternalInput

  // Auto-resize logic
  React.useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }
  }, [input])

  const handleSend = React.useCallback(() => {
    const text = input.trim()
    if (!text || isBusy) return
    onSend(text)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [input, isBusy, onSend, setInput])

  const handleInputChange = React.useCallback((nextValue: string) => {
    setInput(nextValue)
  }, [setInput])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="group relative w-full">
      {/* Visual background glow on focus */}
      <AnimatePresence>
        {isFocused && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -inset-1 rounded-[22px] bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-xl pointer-events-none" 
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "relative flex flex-col gap-2 rounded-[20px] border bg-card/80 p-2 backdrop-blur-2xl transition-all duration-300",
        isFocused ? "border-violet-500/50 shadow-2xl ring-4 ring-violet-500/10" : "border-border shadow-lg",
        isBusy && "opacity-80 cursor-wait"
      )}>
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2">
            <button 
              className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Lampirkan fail"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>
            <button 
              className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Gunakan suara"
            >
              <Mic className="h-3.5 w-3.5" />
            </button>
            <div className="h-3 w-px bg-border mx-1" />
            <button 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Menu arahan"
            >
              <Slash className="h-2.5 w-2.5" />
              <span>Arahan</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
             {providerInfo && (
                <Badge variant="outline" className="h-5 text-[9px] gap-1 px-1.5 border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400">
                  <span>{providerInfo.icon}</span>
                  {providerInfo.name}
                </Badge>
             )}
          </div>
        </div>

        {/* Input core */}
        <div className="flex items-end gap-2 px-1 pb-1">
          <textarea
            id={id}
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || (isBusy ? "PUSPA sedang berfikir..." : "Tanya PUSPA AI...")}
            disabled={isBusy || disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none min-h-[40px] max-h-[160px]"
            aria-label="Input mesej PUSPA AI"
          />

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isBusy}
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 rounded-xl transition-all duration-300",
              input.trim() ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20 scale-100" : "bg-muted text-muted-foreground scale-95"
            )}
            aria-label="Hantar"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {/* Bottom toolbar */}
        {(onClear || onToggleSettings) && (
          <div className="flex items-center justify-end gap-1 px-1 border-t border-border/40 pt-1.5 mt-0.5">
            {onClear && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onClear} aria-label="Kosongkan sembang">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            {onToggleSettings && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onToggleSettings} aria-label="Tetapan AI">
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
