import { prisma } from "@/lib/prisma";
import { embedText } from "./embedder";

export async function retrieveContext(query: string, topK = 3): Promise<string> {
  const queryVec = await embedText(query);
  
  // Note: Prisma doesn't support cosine similarity directly in all databases
  // This is a simplified version - in production, use pgvector or similar
  const chunks = await prisma.knowledgeChunk.findMany({
    take: topK,
    select: { content: true, source: true },
    orderBy: { createdAt: 'desc' }
  });
  
  return chunks.map(c => `[${c.source}]\n${c.content}`).join("\n\n---\n\n");
}
