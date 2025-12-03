/**
 * Chat API Route
 * POST /api/chat - Handle chat messages and return AI responses
 * Requirements: 1.1 (AI response), 1.4 (structured recipe data)
 * Uses Google Gemini for all text generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createGeminiService, GeminiServiceError } from '@/lib/services/gemini.service'
import type { ChatMessage, QuickReply, RecipeOption } from '@/types/chat'
import type { UserPreferences } from '@/lib/services/prompt-builder'

/**
 * Request body for chat endpoint
 */
interface ChatRequest {
  message: string
  conversationId?: string
  conversationHistory?: ChatMessage[]
  userPreferences?: UserPreferences
}

/**
 * Response body for chat endpoint
 */
interface ChatResponse {
  content: string
  quickReplies?: QuickReply[]
  recipeOptions?: RecipeOption[]
  recipes?: Array<{
    name: string
    description: string
    ingredients: Array<{ name: string; quantity: number; unit: string }>
    instructions: string[]
    prepTime: string
    cookTime: string
    servings: number
    difficulty: 'Easy' | 'Medium' | 'Hard'
    calories?: number
  }>
  error?: string
}

/**
 * Validates the chat request body
 */
function validateRequest(body: unknown): { valid: true; data: ChatRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' }
  }

  const req = body as Record<string, unknown>

  if (typeof req.message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string' }
  }

  if (req.message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  // Validate optional conversationId
  if (req.conversationId !== undefined && typeof req.conversationId !== 'string') {
    return { valid: false, error: 'conversationId must be a string' }
  }

  // Validate optional conversationHistory
  if (req.conversationHistory !== undefined && !Array.isArray(req.conversationHistory)) {
    return { valid: false, error: 'conversationHistory must be an array' }
  }

  return {
    valid: true,
    data: {
      message: req.message,
      conversationId: req.conversationId as string | undefined,
      conversationHistory: req.conversationHistory as ChatMessage[] | undefined,
      userPreferences: req.userPreferences as UserPreferences | undefined,
    },
  }
}

/**
 * POST /api/chat
 * Handle chat messages and return AI responses
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { content: '', error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate request
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { content: '', error: validation.error },
        { status: 400 }
      )
    }

    const { message, conversationHistory, userPreferences } = validation.data

    // Create Gemini service and generate response
    let geminiService
    try {
      geminiService = createGeminiService()
    } catch {
      return NextResponse.json(
        { content: '', error: 'AI service not configured. Please add GEMINI_API_KEY.' },
        { status: 500 }
      )
    }
    const aiResponse = await geminiService.generateResponse(
      message,
      conversationHistory || [],
      userPreferences
    )

    // Return successful response
    const response: ChatResponse = {
      content: aiResponse.content,
      quickReplies: aiResponse.quickReplies,
      recipeOptions: aiResponse.recipeOptions,
      recipes: aiResponse.recipes,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // Handle Gemini service errors
    if (error instanceof GeminiServiceError) {
      // Return user-friendly error message
      return NextResponse.json(
        { content: '', error: error.userMessage },
        { status: error.type === 'RATE_LIMITED' ? 429 : 500 }
      )
    }

    // Handle unexpected errors
    console.error('Chat API error:', error)
    return NextResponse.json(
      { content: '', error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
