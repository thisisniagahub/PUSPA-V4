// FILE: /home/kali/PUSPA-V4-NEW/src/app/api/v1/ai/route.ts
// Hermes AI API Endpoint - Vercel-Native with OpenRouter Streaming
// FAILS CLOSED if unauthenticated. NEVER trusts client-side userId.

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth' // Server-side Supabase session validation
import { db } from '@/lib/db' // Prisma client to fetch user role
import { runHermes } from '@/agents/runtime/hermes.runtime'

/**
 * POST /api/v1/ai
 * 
 * NOTE: userId and userRole are EXTRACTED FROM SUPABASE SESSION + Database, not from payload!
 */
export async function POST(req: NextRequest) {
  try {
    // 1. AUTHENTICATE - Fail closed if unauthenticated
    const session = await requireAuth(req)
    
    if (!session?.user?.id) {
      console.warn('[AI API] Unauthenticated request blocked')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized. Please log in to access Hermes AI.' 
        },
        { status: 401 }
      )
    }

    // 2. Get userId from VERIFIED session (NEVER from client payload!)
    const userId = session.user.id

    // 3. Fetch user role from Prisma (secure, server-side)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found in database.' },
        { status: 404 }
      )
    }
    
    const userRole = user.role // 'staff', 'admin', 'developer', etc.
    console.log(`[AI API] User ${userId} authenticated with role: ${userRole}`)

    // 4. Parse and validate request body
    const body = await req.json()
    const { messages, currentView } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request: messages array is required and must not be empty.' 
        },
        { status: 400 }
      )
    }

    // 5. Extract the latest user message (for Hermes prompt)
    const latestMessage = messages[messages.length - 1]
    
    if (!latestMessage || latestMessage.role !== 'user' || !latestMessage.content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Last message must be from user with non-empty content.' 
        },
        { status: 400 }
      )
    }

    const userPrompt = latestMessage.content

    // 6. Run Hermes Runtime with userRole (secure, from database)
    const hermesResult = await runHermes(
      userPrompt, 
      userId, 
      userRole, // NEW: Pass secure user role
      currentView
    )

    if (!hermesResult.success || !hermesResult.stream) {
      console.error('[AI API] Hermes runtime failed:', hermesResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI service temporarily unavailable. Please try again.',
          details: process.env.NODE_ENV === 'development' ? hermesResult.error : undefined
        },
        { status: 500 }
      )
    }

    // 7. Return streaming response (Vercel AI SDK format)
    const response = new Response(hermesResult.stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Hermes-Model': hermesResult.model || 'unknown',
        'X-User-Role': userRole, // Informational header
      },
    })

    return response

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[AI API] Unhandled error:', errorMessage)

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/ai/health
 * Health check endpoint (authenticated)
 */
export async function GET(req: NextRequest) {
  const session = await requireAuth(req)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Fetch user role for health check
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  return NextResponse.json({
    success: true,
    message: 'Hermes AI is operational',
    model: process.env.HERMES_DEFAULT_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
    provider: 'OpenRouter',
    userId: session.user.id,
    userRole: user?.role || 'unknown',
  })
}
