# 🤖 MariaPuspa Bot - Fully Functional Setup

## Status: IMPLEMENTATION GUIDE

### 1. WhatsApp Webhook Integration

#### A. Webhook Handler (`src/app/api/whatsapp/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { processBotMessage } from '@/lib/bot/engine';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'puspa-verify-2026';

// GET: Verification dari Meta
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// POST: Incoming messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify this is a WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Process each entry
    for (const entry of body.entry) {
      const changes = entry.changes || [];
      
      for (const change of changes) {
        if (change.field === 'messages') {
          const message = change.value.messages?.[0];
          const phoneNumber = message?.from;
          
          if (message && phoneNumber) {
            // Process message through bot engine
            await processBotMessage({
              from: phoneNumber,
              message,
              timestamp: message.timestamp,
            });
          }
        }
      }
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
```

### 2. Bot Action Engine (`src/lib/bot/engine.ts`)

```typescript
import { prisma } from '@/lib/prisma';
import { generateBotResponse } from './responses';
import { sendWhatsAppMessage } from './whatsapp';

interface BotContext {
  from: string;
  message: any;
  timestamp: string;
}

export async function processBotMessage(context: BotContext) {
  const { from, message } = context;

  // 1. Get or create member session
  let session = await prisma.botSession.findFirst({
    where: { phoneNumber: from },
    orderBy: { createdAt: 'desc' },
  });

  if (!session) {
    session = await prisma.botSession.create({
      data: {
        phoneNumber: from,
        status: 'active',
        context: {},
      },
    });
  }

  // 2. Parse command/intent
  const messageType = message.type;
  let userMessage = '';

  if (messageType === 'text') {
    userMessage = message.text.body;
  } else if (messageType === 'button') {
    userMessage = message.button.text;
  } else if (messageType === 'interactive') {
    userMessage = message.interactive.list_reply?.title || 
                  message.interactive.button_reply?.title || '';
  }

  // 3. Generate response using AI
  const response = await generateBotResponse({
    message: userMessage,
    sessionId: session.id,
    previousContext: session.context as any,
  });

  // 4. Send response via WhatsApp
  await sendWhatsAppMessage({
    to: from,
    message: response.text,
    type: response.type,
    buttons: response.buttons,
  });

  // 5. Update session context
  await prisma.botSession.update({
    where: { id: session.id },
    data: {
      lastActiveAt: new Date(),
      context: {
        ...session.context,
        lastMessage: userMessage,
        lastResponse: response.text,
      },
    },
  });

  // 6. Log interaction
  await prisma.botInteraction.create({
    data: {
      sessionId: session.id,
      phoneNumber: from,
      direction: 'inbound',
      content: userMessage,
      messageType: messageType,
    },
  });

  console.log(`✅ Bot processed message from ${from}`);
}
```

### 3. Response Generator (`src/lib/bot/responses.ts`)

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getAllTools } from '@/tools';

interface BotResponse {
  text: string;
  type: 'text' | 'image' | 'document' | 'location';
  buttons?: Array<{ id: string; title: string }>;
}

export async function generateBotResponse(options: {
  message: string;
  sessionId: string;
  previousContext: any;
}): Promise<BotResponse> {
  const { message, previousContext } = options;

  // System prompt untuk bot
  const systemPrompt = `Anda adalah MariaPuspa, assistant AI untuk PUSPA-Z.
  
Tugas anda:
1. Jawab soalan tentang asnaf, derma, dan program
2. Bantu semak status kes dan eKYC
3. Guide user melalui proses registration
4. Gunakan tone yang mesra dan profesional

Gunakan tools yang tersedia untuk dapatkan data sebenar.
Jika tidak pasti, minta user hubungi admin.`;

  // Call AI with tools
  const result = await streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    tools: getAllTools(),
    toolChoice: 'auto',
    maxSteps: 3, // Allow multi-step tool usage
  });

  // Extract response text
  const textResponse = await result.text;

  // Generate quick reply buttons based on context
  const buttons = generateQuickReplies(message, textResponse);

  return {
    text: textResponse,
    type: 'text',
    buttons,
  };
}

function generateQuickReplies(userMessage: string, botResponse: string) {
  const buttons: Array<{ id: string; title: string }> = [];

  // Context-aware buttons
  if (userMessage.toLowerCase().includes('daftar') || userMessage.toLowerCase().includes('mohon')) {
    buttons.push(
      { id: 'check_status', title: 'Semak Status' },
      { id: 'upload_docs', title: 'Upload Dokumen' },
      { id: 'talk_to_admin', title: 'Hubungi Admin' }
    );
  } else if (userMessage.toLowerCase().includes('derma') || userMessage.toLowerCase().includes('sumbangan')) {
    buttons.push(
      { id: 'make_donation', title: 'Buat Derma' },
      { id: 'donation_history', title: 'Sejarah Derma' },
      { id: 'tax_exemption', title: 'Cukai Potongan' }
    );
  } else {
    // Default buttons
    buttons.push(
      { id: 'main_menu', title: 'Menu Utama' },
      { id: 'help', title: 'Bantuan' },
      { id: 'contact_admin', title: 'Hubungi Admin' }
    );
  }

  return buttons;
}
```

### 4. WhatsApp Sender (`src/lib/bot/whatsapp.ts`)

```typescript
interface WhatsAppMessage {
  to: string;
  message: string;
  type?: 'text' | 'image' | 'document' | 'location';
  buttons?: Array<{ id: string; title: string }>;
}

export async function sendWhatsAppMessage(options: WhatsAppMessage) {
  const { to, message, type = 'text', buttons } = options;

  const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
  const TOKEN = process.env.WHATSAPP_TOKEN;

  if (!PHONE_ID || !TOKEN) {
    console.error('❌ WhatsApp credentials not configured');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;

  // Build message payload
  let payload: any = {
    messaging_product: 'whatsapp',
    to: to.replace('+', ''),
    type: type,
  };

  if (type === 'text') {
    payload.text = {
      body: message,
    };

    // Add interactive buttons if available
    if (buttons && buttons.length > 0) {
      payload = {
        messaging_product: 'whatsapp',
        to: to.replace('+', ''),
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: message },
          action: {
            buttons: buttons.map((btn, idx) => ({
              type: 'reply',
              reply: {
                id: btn.id,
                title: btn.title.substring(0, 20), // Max 20 chars
              },
            })),
          },
        },
      };
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ WhatsApp API error:', result);
    } else {
      console.log('✅ Message sent to', to);
    }

    return result;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
  }
}
```

### 5. Database Schema Updates

Add to `prisma/schema.prisma`:

```prisma
// Bot Sessions & Interactions
model BotSession {
  id           String   @id @default(cuid())
  phoneNumber  String   @unique
  status       String   @default('active') // active, paused, blocked
  context      Json?
  lastActiveAt DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  interactions BotInteraction[]
}

model BotInteraction {
  id            String   @id @default(cuid())
  sessionId     String
  session       BotSession @relation(fields: [sessionId], references: [id])
  phoneNumber   String
  direction     String   // inbound, outbound
  content       String   @db.Text
  messageType   String   // text, button, image, etc.
  metadata      Json?
  processed     Boolean  @default(true)
  createdAt     DateTime @default(now())
  
  @@index([sessionId])
  @@index([phoneNumber])
}

model BotApproval {
  id          String   @id @default(cuid())
  type        String   // case_approval, disbursement_approval, etc.
  referenceId String   // ID of the item being approved
  requester   String
  approver    String?
  status      String   @default('pending') // pending, approved, rejected
  metadata    Json?
  requestedAt DateTime @default(now())
  decidedAt   DateTime?
  reason      String?
  
  @@index([referenceId])
  @@index([status])
}
```

### 6. Approval Flow Automation

```typescript
// src/lib/bot/approvals.ts

export async function createApproval(options: {
  type: string;
  referenceId: string;
  requester: string;
  metadata?: any;
}) {
  const approval = await prisma.botApproval.create({
    data: options,
  });

  // Notify approvers via WhatsApp
  const approvers = await getApproversForType(options.type);
  
  for (const approver of approvers) {
    await sendWhatsAppMessage({
      to: approver.phone,
      message: `🔔 Kelulusan Diperlukan\n\nJenis: ${options.type}\nID: ${options.referenceId}\n\nSila login ke dashboard untuk tindakan.`,
      buttons: [
        { id: `approve_${approval.id}`, title: 'Luluskan' },
        { id: `reject_${approval.id}`, title: 'Tolak' },
      ],
    });
  }

  return approval;
}

export async function processApprovalDecision(approvalId: string, decision: 'approve' | 'reject', reason?: string) {
  const approval = await prisma.botApproval.update({
    where: { id: approvalId },
    data: {
      status: decision === 'approve' ? 'approved' : 'rejected',
      decidedAt: new Date(),
      reason,
    },
  });

  // Trigger next action based on approval type
  if (approval.type === 'case_approval' && decision === 'approve') {
    await activateCase(approval.referenceId);
  } else if (approval.type === 'disbursement_approval' && decision === 'approve') {
    await processDisbursement(approval.referenceId);
  }

  // Notify requester
  const requester = await getUserByPhone(approval.requester);
  await sendWhatsAppMessage({
    to: requester.phone,
    message: `✅ Permohonan Anda ${decision === 'approve' ? 'DILULUSKAN' : 'DITOLAK'}\n\n${reason ? `Sebab: ${reason}` : ''}`,
  });

  return approval;
}
```

### 7. Environment Variables

```env
# WhatsApp Business API
WHATSAPP_PHONE_ID=your-phone-id-from-meta
WHATSAPP_TOKEN=your-permanent-token
WHATSAPP_VERIFY_TOKEN=puspa-verify-2026

# Bot Settings
BOT_NAME=MariaPuspa
BOT_LANGUAGE=ms
BOT_AUTO_REPLY=true
BOT_WORKING_HOURS=08:00-22:00
```

### 8. Testing Commands

```bash
# Test webhook locally with ngrok
ngrok http 3000

# Set webhook URL in Meta Developer Portal
curl -X POST "https://graph.facebook.com/v18.0/{PHONE_ID}/message_templates" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Simulate incoming message
curl -X POST "http://localhost:3000/api/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messages": [{
            "from": "60123456789",
            "type": "text",
            "text": { "body": "Hi Maria, macam mana nak daftar?" },
            "timestamp": "1234567890"
          }]
        }
      }]
    }]
  }'
```

### 9. Deployment Checklist

- [ ] Setup Meta Business Account
- [ ] Create WhatsApp Business App
- [ ] Get Phone ID and Token
- [ ] Configure webhook URL
- [ ] Test verification endpoint
- [ ] Deploy to production
- [ ] Monitor logs and interactions
- [ ] Setup analytics tracking

---

**Status**: 📋 READY FOR IMPLEMENTATION
**Version**: 1.0.0
