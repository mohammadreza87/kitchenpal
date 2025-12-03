/**
 * Image Generation Service for KitchenPal
 * Uses Unsplash API for high-quality food images
 * Requirements: 2.1 (image generation), 2.3 (base64/URL response)
 */

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
 * Food-related search terms for better Unsplash results
 */
const FOOD_KEYWORDS: Record<string, string[]> = {
  // Proteins
  chicken: ['grilled chicken', 'roasted chicken', 'chicken dish'],
  beef: ['beef steak', 'grilled beef', 'beef dish'],
  pork: ['pork dish', 'roasted pork'],
  fish: ['grilled fish', 'seafood dish'],
  salmon: ['grilled salmon', 'salmon fillet'],
  shrimp: ['shrimp dish', 'grilled shrimp'],
  // Cuisines
  pasta: ['pasta dish', 'italian pasta'],
  pizza: ['pizza', 'italian pizza'],
  sushi: ['sushi', 'japanese food'],
  curry: ['curry dish', 'indian curry'],
  tacos: ['tacos', 'mexican food'],
  burger: ['hamburger', 'gourmet burger'],
  // Meal types
  salad: ['fresh salad', 'healthy salad'],
  soup: ['soup bowl', 'hot soup'],
  sandwich: ['sandwich', 'gourmet sandwich'],
  // Desserts
  cake: ['cake dessert', 'birthday cake'],
  chocolate: ['chocolate dessert', 'chocolate cake'],
  pie: ['pie dessert', 'fruit pie'],
  ice: ['ice cream', 'gelato'],
  // Breakfast
  pancake: ['pancakes', 'breakfast pancakes'],
  waffle: ['waffles', 'breakfast waffles'],
  egg: ['eggs dish', 'breakfast eggs'],
  // Default
  default: ['gourmet food', 'delicious meal', 'food photography'],
}

/**
 * Get search terms for a recipe name
 */
function getSearchTerms(recipeName: string): string {
  const lowerName = recipeName.toLowerCase()

  for (const [keyword, terms] of Object.entries(FOOD_KEYWORDS)) {
    if (lowerName.includes(keyword)) {
      return terms[Math.floor(Math.random() * terms.length)]
    }
  }

  // Use the recipe name itself with "food" appended
  return `${recipeName} food dish`
}

/**
 * Image Service class for food image generation
 * Uses Unsplash for high-quality food images
 */
export class ImagenService {
  private rateLimiter: RateLimiter

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_config?: Partial<ImagenServiceConfig>) {
    this.rateLimiter = getImageRateLimiter()
  }

  /**
   * Gets a food image for a recipe using Unsplash
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
      // Get relevant search terms
      const searchTerms = getSearchTerms(recipeName)

      // Use Unsplash Source API for random food images
      // This API doesn't require authentication for basic usage
      const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerms)}`

      // Fetch the image to get the final URL (Unsplash redirects)
      const response = await this.rateLimiter.execute(async () => {
        const res = await fetch(imageUrl, { method: 'HEAD' })
        return res.url // Get the final redirected URL
      })

      const result: GeneratedImage = {
        base64Data: '',
        mimeType: 'image/jpeg',
        url: response,
      }

      // Cache the result
      cache.set(recipeName, result as CachedImage, description)
      return result
    } catch (error) {
      console.error('Image fetch failed:', error)

      // Try to return cached response if available
      const fallbackCached = cache.get(recipeName, description)
      if (fallbackCached) {
        return fallbackCached as GeneratedImage
      }

      return createFallbackImageResponse()
    }
  }

  /**
   * Gets the current configuration
   */
  getConfig(): Omit<ImagenServiceConfig, 'apiKey'> {
    return {
      model: 'unsplash',
      aspectRatio: '4:3',
    }
  }
}

/**
 * Factory function for creating ImagenService instance
 */
export function createImagenService(config?: Partial<ImagenServiceConfig>): ImagenService {
  return new ImagenService(config)
}
