/**
 * Google Imagen 3 Service for KitchenPal
 * Generates food images using Google's Imagen 3 model
 * Requirements: 2.1 (image generation), 2.3 (base64/URL response)
 */

import { geminiEnv, validateGeminiEnv } from '@/lib/env'
import { buildImagePrompt } from './prompt-builder'
import { getImageRateLimiter, type RateLimiter } from './rate-limiter'
import { getImageCache, type CachedImage } from './cache.service'

/**
 * Configuration for Imagen service
 */
export interface ImagenServiceConfig {
  apiKey: string
  model: string
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
 * Imagen 3 Service class for food image generation
 * Uses Google's Imagen 3 API via REST endpoint
 */
export class ImagenService {
  private config: ImagenServiceConfig
  private rateLimiter: RateLimiter

  constructor(config?: Partial<ImagenServiceConfig>) {
    validateGeminiEnv()

    this.config = {
      apiKey: config?.apiKey || geminiEnv.GEMINI_API_KEY,
      model: config?.model || 'imagen-3.0-generate-002',
      aspectRatio: config?.aspectRatio || '1:1',
    }

    this.rateLimiter = getImageRateLimiter()
  }

  /**
   * Generates a food image for a recipe using Imagen 3 REST API
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
      // Build the image prompt optimized for food photography
      const prompt = buildImagePrompt(recipeName, description)

      // Use Imagen 3 REST API
      const response = await this.rateLimiter.execute(() =>
        this.callImagenAPI(prompt)
      )

      if (response.base64Data) {
        // Cache the result
        cache.set(recipeName, response as CachedImage, description)
        return response
      }

      return createFallbackImageResponse()
    } catch (error) {
      console.error('Imagen generation failed:', error)

      // Try to return cached response if available
      const fallbackCached = cache.get(recipeName, description)
      if (fallbackCached) {
        return fallbackCached as GeneratedImage
      }

      return createFallbackImageResponse()
    }
  }

  /**
   * Calls the Imagen 3 API directly via REST
   */
  private async callImagenAPI(prompt: string): Promise<GeneratedImage> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateImages?key=${this.config.apiKey}`

    const requestBody = {
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: this.config.aspectRatio,
      },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Imagen API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    // Extract base64 image from response
    const generatedImage = data.generatedImages?.[0]
    if (!generatedImage?.image?.imageBytes) {
      throw new Error('No image data in response')
    }

    return {
      base64Data: generatedImage.image.imageBytes,
      mimeType: 'image/png',
    }
  }

  /**
   * Gets the current configuration (without exposing API key)
   */
  getConfig(): Omit<ImagenServiceConfig, 'apiKey'> {
    return {
      model: this.config.model,
      aspectRatio: this.config.aspectRatio,
    }
  }
}

/**
 * Factory function for creating ImagenService instance
 */
export function createImagenService(config?: Partial<ImagenServiceConfig>): ImagenService {
  return new ImagenService(config)
}
