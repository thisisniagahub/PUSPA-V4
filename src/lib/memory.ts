// FILE: /home/kali/PUSPA-V4-NEW/src/lib/memory.ts
// Supabase Memory Logic for Hermes AI - stores conversation history in PostgreSQL

import { db } from '@/lib/db'; // Assuming db is exported from lib/db.ts (Prisma client)
import type { AIMemory } from '@prisma/client';

/**
 * Get conversation history for a user
 * Returns last 50 messages ordered by creation time (oldest first for LLM context)
 */
export async function getConversationHistory(userId: string): Promise<AIMemory[]> {
  try {
    const messages = await db.aIMemory.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50, // Limit context window
    });
    return messages;
  } catch (error) {
    console.error('[Memory] Failed to fetch conversation history:', error);
    return []; // Return empty array on error - fail gracefully
  }
}

/**
 * Save a message to the conversation history
 * @param userId - The user's ID (from Supabase auth)
 * @param role - 'user' | 'assistant' | 'system'
 * @param content - The message content (text)
 */
export async function saveMessage(
  userId: string,
  role: string,
  content: string
): Promise<AIMemory | null> {
  // Validate role
  const validRoles = ['user', 'assistant', 'system'];
  if (!validRoles.includes(role.toLowerCase())) {
    console.error(`[Memory] Invalid role: ${role}. Must be user, assistant, or system.`);
    return null;
  }

  try {
    const message = await db.aIMemory.create({
      data: {
        userId,
        role: role.toLowerCase(),
        content,
      },
    });
    return message;
  } catch (error) {
    console.error('[Memory] Failed to save message:', error);
    return null; // Fail gracefully
  }
}

/**
 * Clear conversation history for a user (optional - for reset functionality)
 */
export async function clearConversationHistory(userId: string): Promise<boolean> {
  try {
    await db.aIMemory.deleteMany({
      where: { userId },
    });
    return true;
  } catch (error) {
    console.error('[Memory] Failed to clear history:', error);
    return false;
  }
}
