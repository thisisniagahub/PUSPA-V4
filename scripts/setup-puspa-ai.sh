#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Memulakan Setup AI Modules untuk PUSPA-Z..."

# Create directories
mkdir -p src/tools src/lib/rag mcp-servers scripts docs/knowledge

# Create get-case-stats tool
cat > src/tools/get-case-stats.ts << 'TOOL_EOF'
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ToolDefinition } from "./types";

export const getCaseStatsTool: ToolDefinition = {
  name: "get_case_stats",
  description: "Dapatkan statistik kes asnaf mengikut status dan bulan",
  parameters: z.object({
    status: z.enum(["aktif", "selesai", "gantung"]).optional(),
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  }),
  rolesAllowed: ["admin", "developer"],
  async execute({ status, month }) {
    try {
      const where: any = {};
      if (status) where.status = status;
      if (month) {
        const start = new Date(`${month}-01T00:00:00Z`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        where.createdAt = { gte: start, lt: end };
      }
      const count = await prisma.case.count({ where });
      return { success: true, data: { count, status: status ?? "semua", month: month ?? "semua" }, message: `Jumlah kes: ${count}` };
    } catch (error) {
      return { success: false, error: "Gagal capai database", details: error };
    }
  },
};
TOOL_EOF

# Create embedder
cat > src/lib/rag/embedder.ts << 'EMBED_EOF'
import { pipeline } from "@xenova/transformers";

let embedderInstance: any = null;

export async function getEmbedder() {
  if (!embedderInstance) {
    embedderInstance = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderInstance;
}

export async function embedText(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
EMBED_EOF

# Create retriever
cat > src/lib/rag/retriever.ts << 'RETRIEVE_EOF'
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
RETRIEVE_EOF

# Create MCP server
cat > mcp-servers/puspa-internal.ts << 'MCP_EOF'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prisma } from "../src/lib/prisma";

const server = new McpServer({ name: "puspa-internal", version: "1.0.0" });

server.tool(
  "verify_ekyc_status",
  "Semak status eKYC & risk score asnaf berdasarkan IC masked",
  { ic_masked: z.string().min(8) },
  async ({ ic_masked }) => {
    try {
      const record = await prisma.ekyc.findFirst({
        where: { icMasked: ic_masked },
        select: { status: true, riskScore: true, verifiedAt: true },
      });
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(record || { status: "NOT_FOUND", message: "Rekod eKYC tidak dijumpai" }) 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify({ status: "ERROR", message: "Gagal mengakses database", error: String(error) }) 
        }] 
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server puspa-internal started");
}

main().catch(console.error);
MCP_EOF

# Create MCP config
cat > mcp-config.json << 'MCP_CFG'
{
  "mcpServers": {
    "puspa-internal": {
      "command": "bun",
      "args": ["run", "mcp-servers/puspa-internal.ts"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}",
        "NODE_ENV": "${NODE_ENV:-development}"
      }
    }
  }
}
MCP_CFG

# Update tools registry
REGISTRY_FILE="src/tools/index.ts"
if [ -f "$REGISTRY_FILE" ]; then
  if ! grep -q "getCaseStatsTool" "$REGISTRY_FILE" 2>/dev/null; then
    echo "" >> "$REGISTRY_FILE"
    echo "import { getCaseStatsTool } from \"./get-case-stats\";" >> "$REGISTRY_FILE"
    echo "export { getCaseStatsTool };" >> "$REGISTRY_FILE"
    # Only add registry if it doesn't exist
    if ! grep -q "TOOL_REGISTRY" "$REGISTRY_FILE" 2>/dev/null; then
      echo "export const TOOL_REGISTRY = [getCaseStatsTool];" >> "$REGISTRY_FILE"
    fi
    echo "✅ Registry updated"
  fi
else
  # Create new registry file
  cat > "$REGISTRY_FILE" << 'REGISTRY_EOF'
import { getCaseStatsTool } from "./get-case-stats";

export { getCaseStatsTool };

export const TOOL_REGISTRY = [getCaseStatsTool];
REGISTRY_EOF
  echo "✅ Registry created"
fi

# Update Prisma schema
SCHEMA_FILE="prisma/schema.prisma"
if [ -f "$SCHEMA_FILE" ]; then
  if ! grep -q "model KnowledgeChunk" "$SCHEMA_FILE" 2>/dev/null; then
    cat >> "$SCHEMA_FILE" << 'PRISMA_ADD'

// RAG Knowledge Base
model KnowledgeChunk {
  id        String   @id @default(uuid())
  content   String   @db.Text
  embedding Float[]  @db.Real[]
  source    String
  metadata  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([source])
}
PRISMA_ADD
    echo "✅ Prisma schema updated"
  fi
else
  echo "⚠️ Prisma schema not found at $SCHEMA_FILE"
fi

# Update .env.example
ENV_FILE=".env.example"
if [ -f "$ENV_FILE" ]; then
  if ! grep -q "HERMES_RUNTIME_MODE" "$ENV_FILE" 2>/dev/null; then
    cat >> "$ENV_FILE" << 'ENV_ADD'

# ─── Hermes-Agent & RAG/MCP ─────────────────────────────────────
HERMES_RUNTIME_MODE=cli
HERMES_CLI_TIMEOUT_MS=45000
RAG_ENABLE=true
MCP_ENABLE=true
MCP_CONFIG_PATH=./mcp-config.json
TRANSFORMERS_CACHE_DIR=./node_modules/.cache/transformers
ENV_ADD
    echo "✅ .env.example updated"
  fi
else
  # Create .env.example if it doesn't exist
  cat > "$ENV_FILE" << 'ENV_CREATE'
# ─── Database ────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/puspa?schema=public"

# ─── Authentication ──────────────────────────────────────────────
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h
SESSION_TIMEOUT=3600000

# ─── AI Providers ────────────────────────────────────────────────
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
DEFAULT_AI_PROVIDER=openai

# ─── Hermes-Agent & RAG/MCP ─────────────────────────────────────
HERMES_RUNTIME_MODE=cli
HERMES_CLI_TIMEOUT_MS=45000
RAG_ENABLE=true
MCP_ENABLE=true
MCP_CONFIG_PATH=./mcp-config.json
TRANSFORMERS_CACHE_DIR=./node_modules/.cache/transformers

# ─── WhatsApp Bot ────────────────────────────────────────────────
WHATSAPP_PHONE_ID=your-phone-id
WHATSAPP_TOKEN=your-whatsapp-token
WHATSAPP_VERIFY_TOKEN=your-verify-token

# ─── Storage ─────────────────────────────────────────────────────
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads
MAX_FILE_SIZE_MB=10

# ─── Environment ─────────────────────────────────────────────────
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV_CREATE
  echo "✅ .env.example created"
fi

echo ""
echo "📦 Installing dependencies..."
bun add @xenova/transformers @modelcontextprotocol/sdk zod

echo ""
echo "✅ Setup selesai!"
echo ""
echo "📋 Langkah seterusnya:"
echo "1. Semak file yang dicipta di src/tools/, src/lib/rag/, mcp-servers/"
echo "2. Jalankan: bunx prisma migrate dev --name add_knowledge_chunk"
echo "3. Update .env dengan nilai yang sesuai"
echo "4. Test MCP server: bun run mcp-servers/puspa-internal.ts"
echo "5. Integrate tools ke Hermes-Agent CLI"
