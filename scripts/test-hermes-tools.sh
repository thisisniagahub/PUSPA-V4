#!/usr/bin/env bash
# 🧪 Test Script untuk Hermes-Agent Tools

echo "🔍 Testing Hermes-Agent Setup..."
echo ""

# Check file structure
echo "📁 Checking file structure..."
files=(
  "src/tools/types.ts"
  "src/tools/get-case-stats.ts"
  "src/tools/index.ts"
  "src/lib/rag/embedder.ts"
  "src/lib/rag/retriever.ts"
  "mcp-servers/puspa-internal.ts"
  "mcp-config.json"
  "scripts/setup-puspa-ai.sh"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
  fi
done

echo ""
echo "🗄️  Checking Prisma schema..."
if grep -q "model KnowledgeChunk" prisma/schema.prisma; then
  echo "  ✅ KnowledgeChunk model exists"
else
  echo "  ❌ KnowledgeChunk model missing"
fi

echo ""
echo "📝 Checking .env.example..."
if grep -q "HERMES_RUNTIME_MODE" .env.example; then
  echo "  ✅ Hermes config exists"
else
  echo "  ❌ Hermes config missing"
fi

echo ""
echo "📚 Documentation..."
if [ -f "docs/HERMES_SETUP_COMPLETE.md" ]; then
  echo "  ✅ HERMES_SETUP_COMPLETE.md"
else
  echo "  ❌ Documentation missing"
fi

echo ""
echo "==================================="
echo "✅ Hermes-Agent Setup Verification"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Install dependencies: npm install @xenova/transformers @modelcontextprotocol/sdk zod"
echo "2. Run migration: npx prisma migrate dev --name add_knowledge_chunk"
echo "3. Update .env with your values"
echo "4. Test MCP server: npx tsx mcp-servers/puspa-internal.ts"
echo ""
