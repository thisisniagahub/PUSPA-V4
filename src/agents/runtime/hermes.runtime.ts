// FILE: /home/kali/PUSPA-V4-NEW/src/agents/runtime/hermes.runtime.ts
// Hermes Master Runtime - The brain of PUSPA AI (Vercel-Native, Zero-Server)

import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getConversationHistory, saveMessage } from '@/lib/memory';
import { getAllTools } from '@/tools';

/**
 * Hermes Runtime Configuration
 */
const HERMES_MODEL = process.env.HERMES_DEFAULT_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error('[Hermes] OPENROUTER_API_KEY is not set in environment');
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
});

export interface HermesResult {
  success: boolean;
  stream?: ReadableStream;
  model?: string;
  error?: string;
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(currentView?: string): string {
  const viewContext = currentView ? `\nCURRENT MODULE: ${currentView}` : '';
  
  return `You are Hermes, the AI assistant for PUSPA V4 - an NGO management platform for Pertubuhan Urus Peduli Asnaf.

Your role:
- Assist PUSPA staff, admins, and developers with contextual guidance
- Help with database-backed workflows (members, cases, donations, programmes)
- Provide bilingual responses (Bahasa Melayu and English)
- Use tools when needed to fetch data or perform actions
- Be helpful, concise, and operationally focused

IMPORTANT RULES:
- Never leak API keys, secrets, or connection strings
- Always explain your actions before executing tools
- Respect user roles and permissions
- If unsure, ask for clarification${viewContext}

Style: Friendly but professional. You may use light 🦞 personality when appropriate without compromising clarity.`;
}

/**
 * Run Hermes AI with streaming support
 * Uses Vercel AI SDK which handles tool execution automatically
 */
export async function runHermes(
  prompt: string,
  userId: string,
  currentView?: string
): Promise<HermesResult> {
  try {
    // 1. Fetch conversation history from Supabase
    const history = await getConversationHistory(userId);
    
    // 2. Build message array (simple format for streamText)
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      // System message
      { role: 'system', content: buildSystemPrompt(currentView) },
      
      // Historical messages
      ...history.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      
      // New user prompt
      { role: 'user', content: prompt },
    ];
    
    // 3. Get available tools from local registry
    const tools = getAllTools();
    
    // 4. Save user message to memory
    await saveMessage(userId, 'user', prompt);
    
    // 5. Call OpenRouter API with streaming
    // Vercel AI SDK handles tool execution automatically when tools have execute functions
    const result = await streamText({
      model: openrouter(HERMES_MODEL),
      messages,
      tools: Object.keys(tools).length > 0 ? tools as any : undefined,
      temperature: 0.7,
      onStepFinish: async (step) => {
        // Save assistant response to memory after each step
        if (step.text) {
          await saveMessage(userId, 'assistant', step.text);
        }
      },
      onError: (error) => {
        console.error('[Hermes] Stream error:', error);
      },
    });
    
    return {
      success: true,
      // Return textStream as ReadableStream
      stream: result.textStream as unknown as ReadableStream,
      model: HERMES_MODEL,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Hermes runtime error';
    console.error('[Hermes] Runtime error:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Non-streaming version for simple queries (optional utility)
 */
export async function runHermesSimple(
  prompt: string,
  userId: string,
  currentView?: string
): Promise<string> {
  const result = await runHermes(prompt, userId, currentView);
  
  if (!result.success || !result.stream) {
    throw new Error(result.error || 'Failed to run Hermes');
  }
  
  // Convert stream to text
  const reader = result.stream.getReader();
  const decoder = new TextDecoder();
  let text = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value);
  }
  
  return text;
}
