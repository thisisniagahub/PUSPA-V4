'use client'

import { Sparkles, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useHermesStore } from '@/stores/hermes-store'
import { viewLabels } from '@/types'

export function HermesChatHeader() {
  const { currentView, clearMessages, setOpen, messages } = useHermesStore()

  const moduleLabel = viewLabels[currentView] || 'Dashboard'

  return (
    <div className="flex items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Hermes avatar */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
          }}
        >
          <Sparkles className="h-4 w-4 text-white" />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-foreground flex items-center gap-1">
            Hermes
            <span className="text-emerald-500">✨</span>
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 w-fit mt-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          >
            {moduleLabel}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={clearMessages}
            aria-label="Semakan semula perbualan"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(false)}
          aria-label="Tutup panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
