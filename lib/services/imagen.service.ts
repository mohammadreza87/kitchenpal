/**
 * Image Generation Service for KitchenPal
 * Uses Google Imagen 3 via Gemini API for AI-generated food images
 * Requirements: 2.1 (image generation), 2.3 (base64/URL response)
 */

import { GoogleGenAI } from '@google/genai'
import { geminiEnv } from '../env'
import { getImageRateLimiter, type RateLimiter } from './rate-limiter'
import { getImageCache, type CachedImage } from './cache.service'

/**
 * Configuration for Imagen service
 */
export interface ImagenServiceConfig {
  apiKey?: string
  model?: string
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
}

/**
 * Generated image response structure
 */
export interface GeneratedImage {
  base64Data: string
  mimeType: 'image/png' | 'image/jpeg'
  url?: string
}

/**
 * Fallback placeholder image path
 */
export const FALLBACK_PLACEHOLDER_IMAGE = '/assets/illustrations/food/Mediterranean Diet Dish.svg'

/**
 * Error types for Imagen service
 */
export type ImagenErrorType =
  | 'API_KEY_MISSING'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'INVALID_RESPONSE'
  | 'GENERATION_FAILED'
  | 'TIMEOUT_ERROR'
  | 'SERVER_ERROR'

/**
 * Custom error class for Imagen service errors
 */
export class ImagenServiceError extends Error {
  constructor(
    public readonly type: ImagenErrorType,
    public readonly userMessage: string,
    public readonly originalError?: Error,
    public readonly isRetryable: boolean = false
  ) {
    super(userMessage)
    this.name = 'ImagenServiceError'
  }
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<ImagenErrorType, string> = {
  API_KEY_MISSING: 'Service configuration error. Please contact support.',
  API_ERROR: "I couldn't generate that image. Please try again.",
  NETWORK_ERROR: 'Connection issue. Please check your internet and try again.',
  RATE_LIMITED: 'Please wait a moment before generating another image.',
  INVALID_RESPONSE: 'Unexpected response format. Please try again.',
  GENERATION_FAILED: "I couldn't create that image. Please try a different description.",
  TIMEOUT_ERROR: 'The request took too long. Please try again.',
  SERVER_ERROR: 'Image service temporarily unavailable. Please try again later.',
}

/**
 * Retryable error types
 */
const RETRYABLE_ERRORS: Set<ImagenErrorType> = new Set<ImagenErrorType>([
  'NETWORK_ERROR',
  'RATE_LIMITED',
  'TIMEOUT_ERROR',
  'SERVER_ERROR',
])

/**
 * Get user-friendly error message
 */
export function getImagenErrorMessage(type: ImagenErrorType): string {
  return ERROR_MESSAGES[type]
}

/**
 * Classifies an error and returns the appropriate ImagenErrorType
 */
export function classifyImagenError(error: unknown): ImagenErrorType {
  if (error instanceof ImagenServiceError) {
    return error.type
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('timeout') || message.includes('timed out')) {
      return 'TIMEOUT_ERROR'
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('econnrefused')) {
      return 'NETWORK_ERROR'
    }
    if (message.includes('rate') || message.includes('quota') || message.includes('429')) {
      return 'RATE_LIMITED'
    }
    if (message.includes('500') || message.includes('503') || message.includes('service unavailable')) {
      return 'SERVER_ERROR'
    }
    if (message.includes('safety') || message.includes('blocked') || message.includes('content policy')) {
      return 'GENERATION_FAILED'
    }
    if (message.includes('api key') || message.includes('authentication') || message.includes('unauthorized')) {
      return 'API_KEY_MISSING'
    }
  }

  return 'API_ERROR'
}

/**
 * Creates an ImagenServiceError from any error
 */
export function createImagenError(error: unknown): ImagenServiceError {
  if (error instanceof ImagenServiceError) {
    return error
  }

  const errorType = classifyImagenError(error)
  const userMessage = getImagenErrorMessage(errorType)
  const isRetryable = RETRYABLE_ERRORS.has(errorType)
  const originalError = error instanceof Error ? error : new Error(String(error))

  return new ImagenServiceError(errorType, userMessage, originalError, isRetryable)
}

/**
 * Creates a fallback response when image generation fails
 */
export function createFallbackImageResponse(): GeneratedImage {
  return {
    base64Data: '',
    mimeType: 'image/png',
    url: FALLBACK_PLACEHOLDER_IMAGE,
  }
}

/**
 * Build a detailed prompt for food image generation
 */
function buildFoodImagePrompt(recipeName: string, description?: string): string {
  const basePrompt = `Professional food photography of ${recipeName}.
Beautiful plating on a ceramic plate, natural lighting, shallow depth of field,
appetizing presentation, high-end restaurant quality, warm inviting colors,
top-down or 45-degree angle shot.`

  if (description) {
    return `${basePrompt} ${description}`
  }

  return basePrompt
}

/**
 * Image Service class for food image generation
 * Uses Google Imagen 3 for AI-generated food images
 */
export class ImagenService {
  private client: GoogleGenAI
  private rateLimiter: RateLimiter
  private model: string
  private aspectRatio: string

  constructor(config?: Partial<ImagenServiceConfig>) {
    const apiKey = config?.apiKey || geminiEnv.GEMINI_API_KEY

    if (!apiKey) {
      throw new ImagenServiceError(
        'API_KEY_MISSING',
        ERROR_MESSAGES.API_KEY_MISSING
      )
    }

    this.client = new GoogleGenAI({ apiKey })
    this.rateLimiter = getImageRateLimiter()
    this.model = config?.model || 'imagen-3.0-generate-002'
    this.aspectRatio = config?.aspectRatio || '4:3'
  }

  /**
   * Generates a food image for a recipe using Imagen 3
   */
  async generateFoodImage(
    recipeName: string,
    description?: string
  ): Promise<GeneratedImage> {
    // Check cache first
    const cache = getImageCache()
    const cachedImage = cache.get(recipeName, description)
    if (cachedImage) {
      return cachedImage as GeneratedImage
    }

    try {
      const prompt = buildFoodImagePrompt(recipeName, description)

      const response = await this.rateLimiter.execute(async () => {
        return await this.client.models.generateImages({
          model: this.model,
          prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: this.aspectRatio,
            outputMimeType: 'image/jpeg',
          },
        })
      })

      // Extract the generated image
      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new ImagenServiceError(
          'INVALID_RESPONSE',
          ERROR_MESSAGES.INVALID_RESPONSE
        )
      }

      const generatedImage = response.generatedImages[0]

      if (!generatedImage.image?.imageBytes) {
        throw new ImagenServiceError(
          'INVALID_RESPONSE',
          ERROR_MESSAGES.INVALID_RESPONSE
        )
      }

      const result: GeneratedImage = {
        base64Data: generatedImage.image.imageBytes,
        mimeType: 'image/jpeg',
      }

      // Cache the result
      cache.set(recipeName, result as CachedImage, description)
      return result
    } catch (error) {
      console.error('Image generation failed:', error)

      // Try to return cached response if available
      const fallbackCached = cache.get(recipeName, description)
      if (fallbackCached) {
        return fallbackCached as GeneratedImage
      }

      // If it's already our error type, rethrow
      if (error instanceof ImagenServiceError) {
        throw error
      }

      // Return fallback for other errors
      return createFallbackImageResponse()
    }
  }

  /**
   * Gets the current configuration
   */
  getConfig(): Omit<ImagenServiceConfig, 'apiKey'> {
    return {
      model: this.model,
      aspectRatio: this.aspectRatio as ImagenServiceConfig['aspectRatio'],
    }
  }
}

/**
 * Factory function for creating ImagenService instance
 */
export function createImagenService(config?: Partial<ImagenServiceConfig>): ImagenService {
  return new ImagenService(config)
}
