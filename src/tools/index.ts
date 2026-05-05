// FILE: /home/kali/PUSPA-V4-NEW/src/tools/index.ts
// Local Tool Registry for Hermes AI - Vercel AI SDK format.

import { z } from 'zod'
import { getRecentDonations } from './donations'
import { getDonationStats } from './donations'
import { getActiveCases } from './cases'
import { getCaseSummary } from './cases'

/**
 * Tool Registry - stores all available local tools
 */
const toolRegistry = new Map<string, {
  description: string;
  parameters: z.ZodSchema;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}>()

/**
 * Register a tool in the registry
 */
export function registerTool(tool: {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}): void {
  if (toolRegistry.has(tool.name)) {
    console.warn(`[Tools] Tool "${tool.name}" already registered. Overwriting.`)
  }
  toolRegistry.set(tool.name, {
    description: tool.description,
    parameters: tool.parameters,
    execute: tool.execute,
  })
  console.log(`[Tools] Registered tool: ${tool.name}`)
}

/**
 * Get all registered tools (for Vercel AI SDK streamText)
 */
export function getAllTools(): Record<string, unknown> {
  const tools: Record<string, unknown> = {}
  
  for (const [name, tool] of toolRegistry.entries()) {
    tools[name] = {
      description: tool.description,
      parameters: tool.parameters,
      execute: tool.execute,
    }
  }
  
  return tools
}

/**
 * Export the complete hermesTools registry
 */
export const hermesTools = getAllTools()

// ===========================================
// REGISTER ALL TOOLS
// ===========================================

// ========== DONATION TOOLS ==========

registerTool({
  name: 'getRecentDonations',
  description: 'Get recent donations (default: 10). Donor info is masked.',
  parameters: z.object({
    limit: z.number().optional().describe('Number of recent donations to fetch (default: 10)'),
  }),
  execute: async (args: Record<string, unknown>) => {
    const limit = args.limit as number | undefined
    return await getRecentDonations(limit || 10)
  },
})

registerTool({
  name: 'getDonationStats',
  description: 'Get donation statistics for current month, grouped by fundType.',
  parameters: z.object({}),
  execute: async () => {
    return await getDonationStats()
  },
})

// ========== CASE TOOLS ==========

registerTool({
  name: 'getActiveCases',
  description: 'Get active cases (pending/in-progress by default). Optionally filter by status.',
  parameters: z.object({
    status: z.string().optional().describe('Filter by case status'),
  }),
  execute: async (args: Record<string, unknown>) => {
    const status = args.status as string | undefined
    return await getActiveCases(status)
  },
})

registerTool({
  name: 'getCaseSummary',
  description: 'Get detailed summary of a specific case including member info and recent notes.',
  parameters: z.object({
    caseId: z.string().describe('The ID of the case to fetch'),
  }),
  execute: async (args: Record<string, unknown>) => {
    const caseId = args.caseId as string
    return await getCaseSummary(caseId)
  },
})

console.log('[Tools] Tool registry initialized with', toolRegistry.size, 'tools')
