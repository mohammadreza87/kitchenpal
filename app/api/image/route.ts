/**
 * Image Generation API Route
 * POST /api/image - Generate food images for recipes
 * Requirements: 2.1 (image generation), 2.3 (base64/URL response)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  createImageService,
  ImageServiceError,
  FALLBACK_PLACEHOLDER_IMAGE,
} from '@/lib/services/image.service'

/**
 * Request body for image endpoint
 */
interface ImageRequest {
  recipeName: string
  description?: string
}

/**
 * Response body for image endpoint
 */
interface ImageResponse {
  imageUrl: string
  base64Data?: string
  mimeType?: 'image/png' | 'image/jpeg'
  error?: string
}

/**
 * Validates the image request body
 */
function validateRequest(body: unknown): { valid: true; data: ImageRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' }
  }

  const req = body as Record<string, unknown>

  if (typeof req.recipeName !== 'string') {
    return { valid: false, error: 'recipeName is required and must be a string' }
  }

  if (req.recipeName.trim().length === 0) {
    return { valid: false, error: 'recipeName cannot be empty' }
  }

  // Validate optional description
  if (req.description !== undefined && typeof req.description !== 'string') {
    return { valid: false, error: 'description must be a string' }
  }

  return {
    valid: true,
    data: {
      recipeName: req.recipeName.trim(),
      description: typeof req.description === 'string' ? req.description.trim() : undefined,
    },
  }
}

/**
 * POST /api/image
 * Generate food images for recipes
 */
export async function POST(request: NextRequest): Promise<NextResponse<ImageResponse>> {
  try {
    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { imageUrl: FALLBACK_PLACEHOLDER_IMAGE, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate request
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { imageUrl: FALLBACK_PLACEHOLDER_IMAGE, error: validation.error },
        { status: 400 }
      )
    }

    const { recipeName, description } = validation.data

    // Create Image service and generate image
    const imageService = createImageService()
    const generatedImage = await imageService.generateFoodImage(recipeName, description)

    // Build response with image URL or base64
    const response: ImageResponse = {
      imageUrl: generatedImage.url || `data:${generatedImage.mimeType};base64,${generatedImage.base64Data}`,
    }

    // Include base64 data if available
    if (generatedImage.base64Data) {
      response.base64Data = generatedImage.base64Data
      response.mimeType = generatedImage.mimeType
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // Handle Image service errors
    if (error instanceof ImageServiceError) {
      // Return fallback image with error message
      return NextResponse.json(
        { imageUrl: FALLBACK_PLACEHOLDER_IMAGE, error: error.userMessage },
        { status: error.type === 'RATE_LIMITED' ? 429 : 500 }
      )
    }

    // Handle unexpected errors - return fallback image
    console.error('Image API error:', error)
    return NextResponse.json(
      { imageUrl: FALLBACK_PLACEHOLDER_IMAGE, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
