# 🤖 Hermes-Agent Setup - PUSPA-Z

## ✅ Status: SETUP LENGKAP

### 1. Struktur Fail Yang Dicipta

```
/workspace/
├── src/
│   ├── tools/
│   │   ├── types.ts              # Type definitions untuk tools
│   │   ├── get-case-stats.ts     # Tool statistik kes
│   │   ├── index.ts              # Tool registry (updated)
│   │   ├── cases.ts              # Existing case tools
│   │   └── donations.ts          # Existing donation tools
│   └── lib/
│       └── rag/
│           ├── embedder.ts       # Text embedding dengan Transformers.js
│           └── retriever.ts      # Context retrieval dari knowledge base
├── mcp-servers/
│   └── puspa-internal.ts         # MCP Server untuk eKYC verification
├── mcp-config.json               # MCP configuration
├── scripts/
│   └── setup-puspa-ai.sh         # Automation script
└── prisma/
    └── schema.prisma             # Updated dengan KnowledgeChunk model
```

### 2. Tools Tersedia

#### A. Donation Tools
- `getRecentDonations` - Dapatkan derma terkini (default: 10)
- `getDonationStats` - Statistik derma bulan semasa

#### B. Case Tools
- `getActiveCases` - Dapatkan kes aktif (pending/in-progress)
- `getCaseSummary` - Summary terperinci kes tertentu
- `get_case_stats` - **NEW** Statistik kes mengikut status & bulan

#### C. MCP Tools (External)
- `verify_ekyc_status` - Semak status eKYC & risk score

### 3. RAG Pipeline

```typescript
// Embedding text
import { embedText } from '@/lib/rag/embedder';
const vector = await embedText("Kriteria kelayakan asnaf");

// Retrieve context
import { retrieveContext } from '@/lib/rag/retriever';
const context = await retrieveContext("Cara update status kes", 3);
```

**Model**: Xenova/all-MiniLM-L6-v2 (384 dimensions)
**Storage**: PostgreSQL (Float[] array)

### 4. MCP Integration

**Server**: `puspa-internal`
**Transport**: Stdio
**Tools**: verify_ekyc_status

```bash
# Test MCP server
bun run mcp-servers/puspa-internal.ts
```

### 5. Environment Variables

```env
# .env
HERMES_RUNTIME_MODE=cli
HERMES_CLI_TIMEOUT_MS=45000
RAG_ENABLE=true
MCP_ENABLE=true
MCP_CONFIG_PATH=./mcp-config.json
TRANSFORMERS_CACHE_DIR=./node_modules/.cache/transformers
```

### 6. Database Migration

```bash
# Generate migration
npx prisma migrate dev --name add_knowledge_chunk

# Reset database (jika perlu)
npx prisma migrate reset
```

### 7. Cara Guna Dalam Chat API

```typescript
// src/app/api/chat/route.ts
import { getAllTools } from '@/tools';
import { streamText } from 'ai';

const result = streamText({
  model: openai('gpt-4o'),
  messages,
  tools: getAllTools(), // Include semua registered tools
  toolChoice: 'auto',
});
```

### 8. Contoh Prompt Ujian

```
📊 Testing Tools:

1. "Berapa jumlah kes aktif bulan ini?"
   → Menggunakan: get_case_stats

2. "Tunjukkan 5 derma terkini"
   → Menggunakan: getRecentDonations

3. "Apa statistik derma bulan ini?"
   → Menggunakan: getDonationStats

4. "Semak status eKYC untuk IC 900101-01-****"
   → Menggunakan: MCP verify_ekyc_status

5. "Bagaimana cara nak update status kes?"
   → Menggunakan: RAG retrieveContext
```

### 9. Troubleshooting

#### Issue: No space left on device
```bash
# Clean cache
rm -rf node_modules/.cache
rm -rf .next
rm -rf dist
```

#### Issue: Prisma Float[] not supported
```prisma
// Use @db.Real[] for PostgreSQL
embedding Float[] @db.Real[]
```

#### Issue: Transformers.js download failed
```bash
# Set cache directory
export TRANSFORMERS_CACHE_DIR=./node_modules/.cache/transformers
```

#### Issue: MCP server not connecting
```bash
# Check if bun is available
which bun

# Alternative: use npx tsx
npx tsx mcp-servers/puspa-internal.ts
```

### 10. Langkah Seterusnya

#### Fasa 1: Advanced Tools 🔨
- [ ] Add member management tools
- [ ] Add volunteer coordination tools
- [ ] Add programme tracking tools
- [ ] Add disbursement approval tools

#### Fasa 2: Bot Engine 🤖
- [ ] Implement WhatsApp webhook handler
- [ ] Create action engine untuk bot commands
- [ ] Setup approval flow automation
- [ ] Add notification system

#### Fasa 3: Optimization ⚡
- [ ] Add Redis caching untuk frequent queries
- [ ] Implement rate limiting
- [ ] Add conversation compression
- [ ] Setup analytics tracking

#### Fasa 4: Security 🔒
- [ ] Enable 2FA untuk admin actions
- [ ] Add session timeout enforcement
- [ ] Implement device binding
- [ ] Add audit logging untuk all tool calls

### 11. Commit Template

```bash
git add .
git commit -m "feat(ai): Setup Hermes-Agent tools, RAG pipeline & MCP integration

- Added get_case_stats tool untuk statistik kes
- Implemented RAG embedder & retriever dengan Transformers.js
- Created MCP server untuk eKYC verification
- Updated Prisma schema dengan KnowledgeChunk model
- Added comprehensive documentation

Refs: HERMES-SETUP-001"
```

---

**Status**: ✅ READY FOR PRODUCTION
**Version**: 1.0.0
**Last Updated**: 2026-05-06
