// FILE: /home/kali/PUSPA-V4-NEW/src/agents/runtime/hermes.runtime.ts
// Hermes Master Runtime - The brain of PUSPA AI (Vercel-Native, Zero-Server)

import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { getConversationHistory, saveMessage } from '@/lib/memory'
import { getAllTools } from '@/tools'

/**
 * Hermes Runtime Configuration
 */
const HERMES_MODEL = process.env.HERMES_DEFAULT_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

if (!OPENROUTER_API_KEY) {
  throw new Error('[Hermes] OPENROUTER_API_KEY is not set in environment')
}

/**
 * Create OpenAI-compatible client for OpenRouter
 */
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://puspa.gangniaga.my',
    'X-Title': 'PUSPA-V4 Hermes AI',
  },
})

export interface HermesResult {
  success: boolean
  stream?: ReadableStream
  model?: string
  error?: string
}

/**
 * Role-based tool access control
 * Defines which tools are available for each role
 */
const roleToolAccess: Record<string, string[]> = {
  // Staff: Can use read-only tools for daily operations
  staff: [
    'getRecentDonations',
    'getDonationStats',
    'getActiveCases',
    'getCaseSummary',
  ],
  // Admin: Can use all tools (management + operations)
  admin: ['*'], // Wildcard = all tools
  // Developer: Can use all tools + system tools
  developer: ['*'],
}

/**
 * Filter tools based on user role
 * @param tools - All registered tools
 * @param userRole - User's role (staff, admin, developer)
 * @returns Filtered tools object
 */
function filterToolsByRole(
  tools: Record<string, unknown>,
  userRole: string
): Record<string, unknown> {
  const allowedTools = roleToolAccess[userRole] || []
  
  // If wildcard '*' is present, return all tools
  if (allowedTools.includes('*')) {
    return tools
  }
  
  // Otherwise, filter tools
  const filtered: Record<string, unknown> = {}
  for (const [name, tool] of Object.entries(tools)) {
    if (allowedTools.includes(name)) {
      filtered[name] = tool
    }
  }
  
  console.log(`[Hermes] Role "${userRole}" has access to ${Object.keys(filtered).length} tools`)
  return filtered
}

/**
 * Build robust system prompt with persona and role-based instructions
 */
function buildSystemPrompt(currentView?: string, userRole?: string): string {
  const viewContext = currentView ? `\nCURRENT MODULE: ${currentView}` : ''
  const roleContext = userRole ? `\nYOUR ROLE: You are interacting with a "${userRole}" user. Adjust your responses accordingly.` : ''
  
  return `You are Hermes, the AI assistant for PUSPA V4 - an NGO management platform for Pertubuhan Urus Peduli Asnaf.

PERSONA:
- You are professional, concise, and operationally focused.
- You communicate bilingually (Bahasa Melayu and English) depending on user preference.
- You rely ONLY on the tools provided to answer operational questions.
- If you don't know or don't have the relevant tool, say you don't know.
- Do NOT hallucinate data or make up information.
- You may use light 🦞 personality when appropriate without compromising clarity.

YOUR ROLE-BASED ACCESS:
- You have access to specific tools based on the user's role (${userRole || 'unknown'}).
- Do NOT attempt to use tools you don't have access to.
- Staff users typically need read-only access to donations, cases, and member info.
- Admin users have broader access for management tasks.
- Developer users have full access including system tools.${roleContext}

YOUR CAPABILITIES:
- Search and retrieve data using available tools.
- Provide summaries and insights from retrieved data.
- Guide users through PUSPA workflows (members, cases, donations, programmes).
- Explain system features and help with navigation.

IMPORTANT RULES:
- Never leak API keys, secrets, or connection strings.
- Always explain your actions before executing tools.
- Respect user roles and permissions - don't attempt unauthorized actions.
- Mask sensitive PII (IC numbers, full phone numbers, emails) in your responses.
- If unsure, ask for clarification.
- Be helpful but stay within your authorized scope.${viewContext}

Style: Friendly but professional. Use 🦞 sparingly to maintain professionalism.`
}

/**
 * Run Hermes AI with streaming support
 * Uses Vercel AI SDK which handles tool execution automatically
 * 
 * @param prompt - The user's prompt
 * @param userId - The authenticated user's ID (from Supabase session)
 * @param userRole - The user's role (staff, admin, developer) - controls tool access
 * @param currentView - Optional: current module/view for context
 */
export async function runHermes(
  prompt: string,
  userId: string,
  userRole: string = 'staff', // Default to staff if not provided
  currentView?: string
): Promise<HermesResult> {
  try {
    // 1. Fetch conversation history from Supabase
    const history = await getConversationHistory(userId)
    
    // 2. Build message array (simple format for streamText)
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      // System message with persona and role-based instructions
      { role: 'system', content: buildSystemPrompt(currentView, userRole) },
      
      // Historical messages
      ...history.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      
      // New user prompt
      { role: 'user', content: prompt },
    ]
    
    // 3. Get available tools and FILTER BY ROLE
    const allTools = getAllTools()
    const tools = filterToolsByRole(allTools, userRole)
    
    console.log(`[Hermes] Using ${Object.keys(tools).length} tools for role "${userRole}"`)
    
    // 4. Save user message to memory
    await saveMessage(userId, 'user', prompt)
    
    // 5. Call OpenRouter API with streaming
    const result = await streamText({
      model: openrouter(HERMES_MODEL),
      messages,
      tools: Object.keys(tools).length > 0 ? tools as any : undefined,
      temperature: 0.7,
      onStepFinish: async (step) => {
        // Save assistant response to memory after each step
        if (step.text) {
          await saveMessage(userId, 'assistant', step.text)
        }
      },
      onError: (error) => {
        console.error('[Hermes] Stream error:', error)
      },
    })
    
    return {
      success: true,
      // Return textStream as ReadableStream
      stream: result.textStream as unknown as ReadableStream,
      model: HERMES_MODEL,
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Hermes runtime error'
    console.error('[Hermes] Runtime error:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Non-streaming version for simple queries (optional utility)
 */
export async function runHermesSimple(
  prompt: string,
  userId: string,
  userRole: string = 'staff',
  currentView?: string
): Promise<string> {
  const result = await runHermes(prompt, userId, userRole, currentView)
  
  if (!result.success || !result.stream) {
    throw new Error(result.error || 'Failed to run Hermes')
  }
  
  // Convert stream to text
  const reader = result.stream.getReader()
  const decoder = new TextDecoder()
  let text = ''
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value)
  }
  
  return text
}
