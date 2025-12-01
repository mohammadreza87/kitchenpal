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
import { createClient } from '@supabase/supabase-js'

// Create Supabase client for server-side storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Persist image to Supabase storage (server-side to avoid CORS)
 */
async function persistImageToStorage(imageUrl: string, recipeName: string): Promise<string | null> {
  console.log('[Image API] Persisting image to Supabase storage...')
  console.log('[Image API] Source URL:', imageUrl.substring(0, 100) + '...')

  try {
    // Download image from Leonardo CDN (no CORS on server-side)
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error('[Image API] Failed to download image from CDN:', response.status, response.statusText)
      return null
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('[Image API] Downloaded image, size:', buffer.length, 'bytes, type:', blob.type)

    const contentType = blob.type || 'image/jpeg'
    const extension = contentType.split('/')[1] || 'jpg'
    const sanitizedName = recipeName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50)
    const filePath = `generated/${sanitizedName}-${Date.now()}.${extension}`

    console.log('[Image API] Uploading to path:', filePath)

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('generated-recipes')
      .upload(filePath, buffer, {
        upsert: true,
        contentType,
      })

    if (uploadError) {
      console.error('[Image API] Failed to upload to Supabase storage:', uploadError.message, uploadError)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-recipes')
      .getPublicUrl(filePath)

    console.log('[Image API] Successfully persisted to Supabase:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('[Image API] Error persisting image to storage:', error)
    return null
  }
}

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

    console.log('[Image API] Generating image for:', recipeName)

    // Create Image service and generate image
    const imageService = createImageService()
    const generatedImage = await imageService.generateFoodImage(recipeName, description)

    console.log('[Image API] Generated image URL:', generatedImage.url?.substring(0, 100) || 'base64 data')

    // Get the original image URL
    let imageUrl = generatedImage.url || `data:${generatedImage.mimeType};base64,${generatedImage.base64Data}`

    // If we have a URL (not base64), persist it to Supabase storage for permanent access
    if (generatedImage.url && !generatedImage.url.startsWith('data:')) {
      console.log('[Image API] Attempting to persist image to Supabase storage...')
      const persistedUrl = await persistImageToStorage(generatedImage.url, recipeName)
      if (persistedUrl) {
        console.log('[Image API] Using persisted URL:', persistedUrl)
        imageUrl = persistedUrl
      } else {
        console.log('[Image API] Persistence failed, using original CDN URL')
      }
    } else {
      console.log('[Image API] Skipping persistence (base64 or no URL)')
    }

    // Build response with image URL or base64
    const response: ImageResponse = {
      imageUrl,
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
