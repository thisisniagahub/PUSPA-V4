'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOpenClawStore } from '@/stores/openclaw-store'
import { PROVIDERS } from '@/lib/openclaw-agent/provider-types'
import { cn } from '@/lib/utils'

export function OpenClawSettings() {
  const { providerState, setProviderState, loadProviderConfig } = useOpenClawStore()
  const [refreshing, setRefreshing] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  useEffect(() => {
    loadProviderConfig()
  }, [loadProviderConfig])

  const currentProvider = PROVIDERS.openclaw

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadProviderConfig()
      setProviderState({ provider: 'openclaw' })
    } finally {
      setRefreshing(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const res = await fetch('/api/v1/openclaw/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Reply exactly: OK' }],
          currentView: 'dashboard',
          locale: 'en',
        }),
      })

      const json = await res.json()
      setTestResult(json.success ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
      setTimeout(() => setTestResult(null), 3000)
    }
  }

  return (
    <div className="p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
        🦞 Tetapan OpenClaw
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Provider AI</label>
        <div className="rounded-xl border border-violet-600 bg-violet-600 p-3 text-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentProvider.icon}</span>
              <div>
                <p className="text-sm font-semibold">{currentProvider.name}</p>
                <p className="text-[10px] opacity-80">{currentProvider.description}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white hover:bg-white/20">Direct</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Agent model</label>
        <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-800">
          {providerState.model || currentProvider.defaultModel}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Model ikut docs.openclaw.ai: OpenAI `model` field ialah OpenClaw agent target, contoh <code>openclaw/puspacare</code>.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Gateway</label>
        <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-zinc-800">
          <div>Base URL: {providerState.baseUrl || 'Belum dikonfigurasi'}</div>
          <div>Token: {providerState.hasApiKey ? 'Configured' : 'Missing'}</div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Config dikawal server-side melalui <code>OPENCLAW_GATEWAY_URL</code>, <code>OPENCLAW_GATEWAY_TOKEN</code>, dan <code>OPENCLAW_AGENT_MODEL</code>. Token tidak pernah dipaparkan di browser.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          size="sm"
          className="flex-1 h-8 text-xs gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
        >
          {refreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Refresh
        </Button>

        <Button
          onClick={handleTestConnection}
          disabled={testing}
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 border-black/10 dark:border-white/10"
        >
          {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
          Uji
        </Button>
      </div>

      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'text-xs px-3 py-2 rounded-xl border',
            testResult === 'success' ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-red-50 text-red-600 border-red-100',
          )}
        >
          {testResult === 'success' ? <><Check className="inline h-3 w-3" /> Sambungan OpenClaw berjaya!</> : '❌ Sambungan OpenClaw gagal. Semak server env.'}
        </motion.div>
      )}
    </div>
  )
}
