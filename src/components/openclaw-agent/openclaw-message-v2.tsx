'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Wrench, Clock, ArrowRight, ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { OpenClawAgentMessage } from '@/stores/openclaw-store'
import { PROVIDERS } from '@/lib/openclaw-agent/provider-types'

interface OpenClawMessageV2Props {
  message: OpenClawAgentMessage
  isLast?: boolean
}

export function OpenClawMessageV2({ message, isLast }: OpenClawMessageV2Props) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* */ }
  }

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('ms-MY', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const providerInfo = message.provider ? PROVIDERS[message.provider] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('group flex flex-col', isUser ? 'items-end' : 'items-start')}
    >
      {/* Tool badge */}
      {message.isToolResult && message.toolName && (
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 border border-violet-200">
            <Wrench className="h-2.5 w-2.5" />
            {message.toolName}
          </span>
        </div>
      )}

      {/* Message bubble */}
      <div className={cn('relative max-w-[88%] rounded-2xl text-[13px] leading-[1.6]', 
        isUser
          ? 'bg-zinc-900 text-white dark:bg-zinc-800 px-4 py-3'
          : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 px-4 py-3 border border-black/5 dark:border-white/5'
      )}>
        {/* Copy button for assistant */}
        {!isUser && !message.isStreaming && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
            aria-label="Salin mesej"
          >
            {copied ? (
              <Check className="h-3 w-3 text-violet-600" />
            ) : (
              <Copy className="h-3 w-3 text-zinc-400" />
            )}
          </button>
        )}

        {/* Content */}
        <div
          className={cn(
            'whitespace-pre-wrap break-words openclaw-content-v2',
            isUser ? '' : '[&_strong]:font-semibold [&_code]:text-violet-600 dark:[&_code]:text-violet-400 [&_pre]:text-zinc-800 dark:[&_pre]:text-zinc-200 [&_h2]:text-zinc-900 [&_h3]:text-zinc-900 [&_h4]:text-zinc-900 [&_li]:text-zinc-700 dark:[&_li]:text-zinc-300',
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

        {/* Client action button */}
        {!isUser && message.clientAction && !message.isStreaming && (
          <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5">
            <button
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition-colors rounded-lg px-2 py-1 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800"
            >
              {message.clientAction.type === 'navigate' ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
              {message.clientAction.message || message.clientAction.type}
            </button>
          </div>
        )}
      </div>

      {/* Footer metadata */}
      <div className={cn('flex items-center gap-2 mt-1 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <span className="text-[10px] text-zinc-400">{formattedTime}</span>
        {!isUser && providerInfo && (
          <span className="flex items-center gap-0.5 text-[9px] text-zinc-400">
            <span>{providerInfo.icon}</span>
            {providerInfo.name}
          </span>
        )}
        {!isUser && message.latencyMs && message.latencyMs > 0 && (
          <span className="flex items-center gap-0.5 text-[9px] text-zinc-400">
            <Clock className="h-2.5 w-2.5" />
            {message.latencyMs < 1000 ? `${message.latencyMs}ms` : `${(message.latencyMs / 1000).toFixed(1)}s`}
          </span>
        )}
      </div>
    </motion.div>
  )
}
