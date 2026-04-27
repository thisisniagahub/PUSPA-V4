'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HermesChatMessage } from '@/stores/hermes-store'

interface HermesMessageProps {
  message: HermesChatMessage
}

export function HermesMessage({ message }: HermesMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API might not be available
    }
  }

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('ms-MY', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'group flex gap-2 px-4',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5',
          isUser
            ? 'bg-emerald-600 text-white'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          'relative max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-emerald-600 text-white dark:bg-emerald-700'
            : 'bg-muted text-foreground',
        )}
      >
        {/* Tool result badge */}
        {message.isToolResult && message.toolName && (
          <div className="mb-1.5 flex items-center gap-1">
            <span className="inline-flex items-center rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
              🔧 {message.toolName}
            </span>
          </div>
        )}

        {/* Content with basic markdown support */}
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Timestamp & Copy */}
        <div
          className={cn(
            'mt-1.5 flex items-center gap-2',
            isUser ? 'justify-start' : 'justify-between',
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isUser ? 'text-emerald-100/70' : 'text-muted-foreground',
            )}
          >
            {formattedTime}
          </span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              aria-label="Salin mesej"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
