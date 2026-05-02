'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Bot, User, Wrench, Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { OpenClawAgentMessage } from '@/stores/openclaw-store'
import { PROVIDERS } from '@/lib/openclaw-agent/provider-types'
import { SafeDate } from '@/components/ui/safe-date'

interface OpenClawMessageProps {
  message: OpenClawAgentMessage
}

export function OpenClawMessage({ message }: OpenClawMessageProps) {
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

  const providerInfo = message.provider ? PROVIDERS[message.provider] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'group flex gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5',
          isUser
            ? 'bg-violet-600 text-white'
            : 'bg-gradient-to-br from-violet-500 to-purple-500 text-white',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          'relative max-w-[85%] rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-violet-600 text-white dark:bg-violet-700 px-4 py-3'
            : 'bg-muted text-foreground px-4 py-3',
        )}
      >
        {/* Tool result badge */}
        {message.isToolResult && message.toolName && (
          <div className="mb-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-400">
              <Wrench className="h-2.5 w-2.5" />
              {message.toolName}
            </span>
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            'whitespace-pre-wrap break-words openclaw-content',
            isUser ? '' : '[&_strong]:font-semibold [&_code]:text-violet-600 dark:[&_code]:text-violet-400 [&_pre]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground',
          )}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>

        {/* Streaming cursor */}
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-middle rounded-sm" />
        )}

        {/* Footer */}
        <div
          className={cn(
            'mt-2 flex items-center gap-2',
            isUser ? 'justify-start' : 'justify-between',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-[10px]',
                isUser ? 'text-violet-100/70' : 'text-muted-foreground',
              )}
            >
              <SafeDate date={message.timestamp} formatOptions={{ hour: '2-digit', minute: '2-digit' }} />
            </span>

            {/* Provider badge */}
            {!isUser && providerInfo && (
              <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                <span>{providerInfo.icon}</span>
                {providerInfo.name}
              </span>
            )}

            {/* Latency */}
            {!isUser && message.latencyMs && message.latencyMs > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {message.latencyMs < 1000 ? `${message.latencyMs}ms` : `${(message.latencyMs / 1000).toFixed(1)}s`}
              </span>
            )}
          </div>

          {!isUser && !message.isStreaming && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              aria-label="Salin mesej"
            >
              {copied ? (
                <Check className="h-3 w-3 text-violet-500" />
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
