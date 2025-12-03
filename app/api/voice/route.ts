/**
 * Voice Coaching API Route
 * POST /api/voice - Generate voice coaching audio for recipes using ElevenLabs
 * Supports: step coaching, recipe intro, ingredients summary
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  createElevenLabsService,
  ElevenLabsServiceError,
  createElevenLabsError,
} from '@/lib/services/elevenlabs.service'

/**
 * Request types for voice generation
 */
type VoiceRequestType = 'step' | 'coach' | 'intro' | 'ingredients' | 'custom'

interface BaseVoiceRequest {
  type: VoiceRequestType
  voiceId?: string
}

interface StepVoiceRequest extends BaseVoiceRequest {
  type: 'step'
  stepNumber: number
  stepText: string
  totalSteps: number
  encouragement?: boolean
  tips?: string
}

interface CoachVoiceRequest extends BaseVoiceRequest {
  type: 'coach'
  stepNumber: number
  stepText: string
  totalSteps: number
  recipeName?: string
}

interface IntroVoiceRequest extends BaseVoiceRequest {
  type: 'intro'
  recipeName: string
  prepTime?: string
  cookTime?: string
  difficulty?: string
}

interface IngredientsVoiceRequest extends BaseVoiceRequest {
  type: 'ingredients'
  ingredients: Array<{ name: string; quantity: number; unit: string }>
}

interface CustomVoiceRequest extends BaseVoiceRequest {
  type: 'custom'
  text: string
}

type VoiceRequest = StepVoiceRequest | CoachVoiceRequest | IntroVoiceRequest | IngredientsVoiceRequest | CustomVoiceRequest

/**
 * Validates the voice request body
 */
function validateRequest(body: unknown): { valid: true; data: VoiceRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' }
  }

  const req = body as Record<string, unknown>

  if (!req.type || typeof req.type !== 'string') {
    return { valid: false, error: 'type is required and must be a string' }
  }

  const validTypes = ['step', 'coach', 'intro', 'ingredients', 'custom']
  if (!validTypes.includes(req.type)) {
    return { valid: false, error: `type must be one of: ${validTypes.join(', ')}` }
  }

  // Validate based on type
  switch (req.type) {
    case 'step':
      if (typeof req.stepNumber !== 'number' || req.stepNumber < 1) {
        return { valid: false, error: 'stepNumber is required and must be a positive number' }
      }
      if (typeof req.stepText !== 'string' || req.stepText.trim().length === 0) {
        return { valid: false, error: 'stepText is required and must be a non-empty string' }
      }
      if (typeof req.totalSteps !== 'number' || req.totalSteps < 1) {
        return { valid: false, error: 'totalSteps is required and must be a positive number' }
      }
      return {
        valid: true,
        data: {
          type: 'step',
          stepNumber: req.stepNumber,
          stepText: req.stepText.trim(),
          totalSteps: req.totalSteps,
          encouragement: req.encouragement === true,
          tips: typeof req.tips === 'string' ? req.tips : undefined,
          voiceId: typeof req.voiceId === 'string' ? req.voiceId : undefined,
        },
      }

    case 'coach':
      if (typeof req.stepNumber !== 'number' || req.stepNumber < 1) {
        return { valid: false, error: 'stepNumber is required and must be a positive number' }
      }
      if (typeof req.stepText !== 'string' || req.stepText.trim().length === 0) {
        return { valid: false, error: 'stepText is required and must be a non-empty string' }
      }
      if (typeof req.totalSteps !== 'number' || req.totalSteps < 1) {
        return { valid: false, error: 'totalSteps is required and must be a positive number' }
      }
      return {
        valid: true,
        data: {
          type: 'coach',
          stepNumber: req.stepNumber,
          stepText: req.stepText.trim(),
          totalSteps: req.totalSteps,
          recipeName: typeof req.recipeName === 'string' ? req.recipeName : undefined,
          voiceId: typeof req.voiceId === 'string' ? req.voiceId : undefined,
        },
      }

    case 'intro':
      if (typeof req.recipeName !== 'string' || req.recipeName.trim().length === 0) {
        return { valid: false, error: 'recipeName is required and must be a non-empty string' }
      }
      return {
        valid: true,
        data: {
          type: 'intro',
          recipeName: req.recipeName.trim(),
          prepTime: typeof req.prepTime === 'string' ? req.prepTime : undefined,
          cookTime: typeof req.cookTime === 'string' ? req.cookTime : undefined,
          difficulty: typeof req.difficulty === 'string' ? req.difficulty : undefined,
          voiceId: typeof req.voiceId === 'string' ? req.voiceId : undefined,
        },
      }

    case 'ingredients':
      if (!Array.isArray(req.ingredients) || req.ingredients.length === 0) {
        return { valid: false, error: 'ingredients is required and must be a non-empty array' }
      }
      // Validate each ingredient
      for (const ing of req.ingredients) {
        if (!ing || typeof ing !== 'object') {
          return { valid: false, error: 'Each ingredient must be an object' }
        }
        const i = ing as Record<string, unknown>
        if (typeof i.name !== 'string') {
          return { valid: false, error: 'Each ingredient must have a name string' }
        }
        if (typeof i.quantity !== 'number') {
          return { valid: false, error: 'Each ingredient must have a quantity number' }
        }
        if (typeof i.unit !== 'string') {
          return { valid: false, error: 'Each ingredient must have a unit string' }
        }
      }
      return {
        valid: true,
        data: {
          type: 'ingredients',
          ingredients: req.ingredients as Array<{ name: string; quantity: number; unit: string }>,
          voiceId: typeof req.voiceId === 'string' ? req.voiceId : undefined,
        },
      }

    case 'custom':
      if (typeof req.text !== 'string' || req.text.trim().length === 0) {
        return { valid: false, error: 'text is required and must be a non-empty string' }
      }
      return {
        valid: true,
        data: {
          type: 'custom',
          text: req.text.trim(),
          voiceId: typeof req.voiceId === 'string' ? req.voiceId : undefined,
        },
      }

    default:
      return { valid: false, error: 'Invalid request type' }
  }
}

/**
 * POST /api/voice
 * Generate voice coaching audio
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for ElevenLabs API key
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'Voice service not configured. Please add ELEVENLABS_API_KEY.' },
        { status: 500 }
      )
    }

    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate request
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const data = validation.data

    // Create ElevenLabs service
    const voiceService = createElevenLabsService()

    // Generate audio based on request type
    let audio
    switch (data.type) {
      case 'step':
        audio = await voiceService.generateStepCoaching(
          data.stepNumber,
          data.stepText,
          data.totalSteps,
          {
            encouragement: data.encouragement,
            tips: data.tips,
          }
        )
        break

      case 'coach':
        audio = await voiceService.generateStepExplanation(
          data.stepNumber,
          data.stepText,
          data.totalSteps,
          data.recipeName
        )
        break

      case 'intro':
        audio = await voiceService.generateRecipeIntro(
          data.recipeName,
          data.prepTime,
          data.cookTime,
          data.difficulty
        )
        break

      case 'ingredients':
        audio = await voiceService.generateIngredientsSummary(data.ingredients)
        break

      case 'custom':
        audio = await voiceService.textToSpeech(data.text, {
          voiceId: data.voiceId,
        })
        break
    }

    // Return audio as binary response
    // Convert Buffer/ArrayBuffer to Uint8Array for NextResponse compatibility
    const audioBytes = audio.audioData instanceof ArrayBuffer
      ? new Uint8Array(audio.audioData)
      : new Uint8Array(audio.audioData)

    return new NextResponse(audioBytes, {
      status: 200,
      headers: {
        'Content-Type': audio.contentType,
        'Content-Length': String(audioBytes.byteLength),
        'X-Character-Count': String(audio.characterCount),
      },
    })
  } catch (error) {
    // Handle ElevenLabs service errors
    if (error instanceof ElevenLabsServiceError) {
      return NextResponse.json(
        { error: error.userMessage },
        { status: error.type === 'RATE_LIMITED' ? 429 : 500 }
      )
    }

    // Handle unexpected errors
    console.error('Voice API error:', error)
    const serviceError = createElevenLabsError(error)
    return NextResponse.json(
      { error: serviceError.userMessage },
      { status: 500 }
    )
  }
}

/**
 * GET /api/voice/voices
 * Get available voices (for future voice selection feature)
 */
export async function GET(): Promise<NextResponse> {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'Voice service not configured' },
        { status: 500 }
      )
    }

    const voiceService = createElevenLabsService()
    const voices = await voiceService.getVoices()

    return NextResponse.json({ voices })
  } catch (error) {
    console.error('Voice API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    )
  }
}
