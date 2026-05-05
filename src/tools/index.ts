// FILE: /home/kali/PUSPA-V4-NEW/src/tools/index.ts
// Local Tool Registry for Hermes AI - Vercel AI SDK format

import { z } from 'zod';

/**
 * Tool definition interface (Vercel AI SDK native format)
 */
export interface LocalTool {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  execute: (args: unknown) => Promise<unknown>;
}

/**
 * Tool Registry - stores all available local tools
 */
const toolRegistry = new Map<string, LocalTool>();

/**
 * Register a tool in the registry
 */
export function registerTool(tool: LocalTool): void {
  if (toolRegistry.has(tool.name)) {
    console.warn(`[Tools] Tool "${tool.name}" already registered. Overwriting.`);
  }
  toolRegistry.set(tool.name, tool);
  console.log(`[Tools] Registered tool: ${tool.name}`);
}

/**
 * Get a tool by name
 */
export function getTool(name: string): LocalTool | undefined {
  return toolRegistry.get(name);
}

/**
 * Get all registered tools (for Vercel AI SDK streamText)
 * Returns tools in the format expected by streamText
 */
export function getAllTools(): Record<string, unknown> {
  const tools: Record<string, unknown> = {};
  
  for (const [name, tool] of toolRegistry.entries()) {
    tools[name] = {
      description: tool.description,
      parameters: tool.parameters,
      execute: tool.execute,
    };
  }
  
  return tools;
}

/**
 * Execute a tool by name with arguments
 */
export async function executeTool(
  name: string,
  args: unknown
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const tool = toolRegistry.get(name);
  
  if (!tool) {
    return {
      success: false,
      error: `Tool "${name}" not found in registry`,
    };
  }
  
  try {
    const result = await tool.execute(args);
    return { success: true, result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Tools] Execution failed for "${name}":`, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ===========================================
// DUMMY TOOL FOR TESTING
// ===========================================

registerTool({
  name: 'get_donation_stats',
  description: 'Get mock donation statistics for testing. Returns static JSON with total donations, categories, and monthly breakdown.',
  parameters: z.object({}),
  execute: async () => {
    // Mock donation data for testing
    return {
      success: true,
      data: {
        totalDonations: 157,
        totalAmount: 245000,
        currency: 'MYR',
        categories: {
          zakat: { count: 45, amount: 120000 },
          sadaqah: { count: 62, amount: 85000 },
          waqf: { count: 28, amount: 30000 },
          infaq: { count: 22, amount: 10000 },
        },
        monthlyBreakdown: [
          { month: '2026-01', count: 12, amount: 18000 },
          { month: '2026-02', count: 15, amount: 22000 },
          { month: '2026-03', count: 18, amount: 28000 },
          { month: '2026-04', count: 20, amount: 35000 },
          { month: '2026-05', count: 14, amount: 25000 },
        ],
        lastUpdated: new Date().toISOString(),
      },
    };
  },
});

console.log('[Tools] Tool registry initialized with get_donation_stats');
