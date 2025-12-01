/**
 * Gemini AI Service for KitchenPal
 * Requirements: 1.1 (AI response), 1.4 (structured recipe data), 6.3 (response transformation)
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import { geminiEnv, validateGeminiEnv } from '@/lib/env'
import {
  buildSystemPrompt,
  buildRecipePrompt,
  formatConversationHistory,
  type UserPreferences,
} from './prompt-builder'
import type { ChatMessage, QuickReply, RecipeOption, RecipeDifficulty } from '@/types/chat'
import { getGeminiRateLimiter, type RateLimiter } from './rate-limiter'
import { getRecipeSuggestionsCache, type CachedRecipeSuggestion } from './cache.service'

/**
 * Configuration for Gemini service
 */
export interface GeminiServiceConfig {
  apiKey: string
  textModel: 'gemini-1.5-flash' | 'gemini-1.5-pro'
  maxTokens: number
  temperature: number
}

/**
 * Ingredient item in a generated recipe
 */
export interface IngredientItem {
  name: string
  quantity: number
  unit: string
}

/**
 * Generated recipe structure from Gemini
 * Property 2: Recipe response structure validation
 * Validates: Requirements 1.4
 */
export interface GeneratedRecipe {
  name: string
  description: string
  ingredients: IngredientItem[]
  instructions: string[]
  prepTime: string
  cookTime: string
  servings: number
  difficulty: RecipeDifficulty
  calories?: number
}

/**
 * AI Response structure
 * Property 11: Response type transformation
 * Validates: Requirements 6.3
 */
export interface AIResponse {
  content: string
  quickReplies?: QuickReply[]
  recipeOptions?: RecipeOption[]
  recipes?: GeneratedRecipe[]
}


/**
 * Recipe suggestion response from Gemini
 */
export interface RecipeSuggestion {
  name: string
  description: string
  ingredients: IngredientItem[]
  instructions: string[]
  prepTime: string
  cookTime: string
  servings: number
  difficulty: RecipeDifficulty
  calories?: number
}

/**
 * Error types for Gemini service
 */
export type GeminiErrorType = 
  | 'API_KEY_MISSING'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'INVALID_RESPONSE'
  | 'PARSE_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SERVER_ERROR'

/**
 * Custom error class for Gemini service errors
 * Property 7: API error to user-friendly message transformation
 * Property 8: Network error graceful handling
 * Validates: Requirements 4.1, 4.3
 */
export class GeminiServiceError extends Error {
  constructor(
    public readonly type: GeminiErrorType,
    public readonly userMessage: string,
    public readonly originalError?: Error,
    public readonly isRetryable: boolean = false
  ) {
    super(userMessage)
    this.name = 'GeminiServiceError'
  }
}

/**
 * User-friendly error messages
 * Property 7: API error to user-friendly message transformation
 * Validates: Requirements 4.1
 */
const ERROR_MESSAGES: Record<GeminiErrorType, string> = {
  API_KEY_MISSING: 'Service configuration error. Please contact support.',
  API_ERROR: "I couldn't process that request. Please try again.",
  NETWORK_ERROR: 'Connection issue. Please check your internet and try again.',
  RATE_LIMITED: 'Please wait a moment before sending another message.',
  INVALID_RESPONSE: 'Unexpected response format. Please try again.',
  PARSE_ERROR: "I couldn't understand the response. Please try again.",
  TIMEOUT_ERROR: 'The request took too long. Please try again.',
  SERVER_ERROR: 'Service temporarily unavailable. Please try again later.',
}

/**
 * Determines if an error type is retryable
 */
const RETRYABLE_ERRORS: Set<GeminiErrorType> = new Set<GeminiErrorType>([
  'NETWORK_ERROR',
  'RATE_LIMITED',
  'TIMEOUT_ERROR',
  'SERVER_ERROR',
])

/**
 * Get user-friendly error message for a given error type
 */
export function getUserFriendlyErrorMessage(type: GeminiErrorType): string {
  return ERROR_MESSAGES[type]
}

/**
 * Check if an error type is retryable
 */
export function isRetryableError(type: GeminiErrorType): boolean {
  return RETRYABLE_ERRORS.has(type)
}

/**
 * Retry configuration for transient errors
 */
export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = config.baseDelayMs * Math.pow(2, attempt)
  return Math.min(delay, config.maxDelayMs)
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Classifies an error and returns the appropriate GeminiErrorType
 * Property 7: API error to user-friendly message transformation
 * Property 8: Network error graceful handling
 * Validates: Requirements 4.1, 4.3
 */
export function classifyError(error: unknown): GeminiErrorType {
  if (error instanceof GeminiServiceError) {
    return error.type
  }

  if (error instanceof TypeError) {
    const message = error.message.toLowerCase()
    // Network-related TypeErrors (fetch failures)
    if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
      return 'NETWORK_ERROR'
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    // Check for timeout errors
    if (message.includes('timeout') || message.includes('timed out') || name.includes('timeout')) {
      return 'TIMEOUT_ERROR'
    }

    // Check for network errors
    if (
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('econnreset') ||
      message.includes('socket') ||
      message.includes('dns') ||
      name.includes('network')
    ) {
      return 'NETWORK_ERROR'
    }

    // Check for rate limiting (429)
    if (message.includes('rate') || message.includes('quota') || message.includes('429') || message.includes('too many requests')) {
      return 'RATE_LIMITED'
    }

    // Check for server errors (5xx)
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504') || message.includes('internal server error') || message.includes('service unavailable')) {
      return 'SERVER_ERROR'
    }

    // Check for client errors (4xx)
    if (message.includes('400') || message.includes('401') || message.includes('403') || message.includes('404') || message.includes('bad request') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'API_ERROR'
    }

    // Check for API-specific errors
    if (message.includes('api') || message.includes('invalid') || message.includes('malformed')) {
      return 'API_ERROR'
    }
  }

  // Default to API error for unknown errors
  return 'API_ERROR'
}

/**
 * Creates a GeminiServiceError from any error
 * Property 7: API error to user-friendly message transformation
 * Property 8: Network error graceful handling
 * Validates: Requirements 4.1, 4.3
 */
export function createGeminiError(error: unknown): GeminiServiceError {
  if (error instanceof GeminiServiceError) {
    return error
  }

  const errorType = classifyError(error)
  const userMessage = getUserFriendlyErrorMessage(errorType)
  const isRetryable = RETRYABLE_ERRORS.has(errorType)
  const originalError = error instanceof Error ? error : new Error(String(error))

  return new GeminiServiceError(errorType, userMessage, originalError, isRetryable)
}

/**
 * Wraps an async function with retry logic for transient errors
 * Requirements: 4.1, 4.3
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: GeminiServiceError | undefined

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = createGeminiError(error)

      // If not retryable or last attempt, throw immediately
      if (!lastError.isRetryable || attempt === config.maxRetries) {
        throw lastError
      }

      // Wait before retrying with exponential backoff
      const delay = calculateBackoffDelay(attempt, config)
      await sleep(delay)
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new GeminiServiceError('API_ERROR', getUserFriendlyErrorMessage('API_ERROR'))
}


/**
 * Validates that a recipe has all required fields
 * Property 2: Recipe response structure validation
 * Validates: Requirements 1.4
 */
export function isValidRecipe(recipe: unknown): recipe is GeneratedRecipe {
  if (!recipe || typeof recipe !== 'object') return false
  
  const r = recipe as Record<string, unknown>
  
  // Required fields: name, ingredients (array), instructions (array)
  if (typeof r.name !== 'string' || r.name.trim() === '') return false
  if (!Array.isArray(r.ingredients)) return false
  if (!Array.isArray(r.instructions)) return false
  
  // Validate ingredients have required structure
  for (const ing of r.ingredients) {
    if (!ing || typeof ing !== 'object') return false
    const i = ing as Record<string, unknown>
    if (typeof i.name !== 'string') return false
    if (typeof i.quantity !== 'number') return false
    if (typeof i.unit !== 'string') return false
  }
  
  // Validate instructions are strings
  for (const inst of r.instructions) {
    if (typeof inst !== 'string') return false
  }
  
  return true
}

/**
 * Validates that an AI response has correct structure
 * Property 11: Response type transformation
 * Validates: Requirements 6.3
 */
export function isValidAIResponse(response: unknown): response is AIResponse {
  if (!response || typeof response !== 'object') return false
  
  const r = response as Record<string, unknown>
  
  // Content is required and must be a string
  if (typeof r.content !== 'string') return false
  
  // Optional fields validation
  if (r.quickReplies !== undefined && !Array.isArray(r.quickReplies)) return false
  if (r.recipeOptions !== undefined && !Array.isArray(r.recipeOptions)) return false
  if (r.recipes !== undefined) {
    if (!Array.isArray(r.recipes)) return false
    for (const recipe of r.recipes) {
      if (!isValidRecipe(recipe)) return false
    }
  }
  
  return true
}


/**
 * Transforms raw Gemini response to AIResponse
 * Property 11: Response type transformation
 * Validates: Requirements 6.3
 */
export function transformToAIResponse(
  content: string,
  parsedRecipes?: GeneratedRecipe[]
): AIResponse {
  const response: AIResponse = {
    content,
  }
  
  // If we have parsed recipes, add them and create recipe options
  if (parsedRecipes && parsedRecipes.length > 0) {
    response.recipes = parsedRecipes
    response.recipeOptions = parsedRecipes.map((recipe, index) => ({
      id: `recipe-${index + 1}`,
      name: recipe.name,
    }))
  }
  
  return response
}

/**
 * Parses recipe JSON from Gemini response text
 */
export function parseRecipesFromResponse(text: string): GeneratedRecipe[] {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*"recipes"[\s\S]*\}/)
    if (!jsonMatch) return []
    
    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.recipes || !Array.isArray(parsed.recipes)) return []
    
    // Validate and filter valid recipes
    const validRecipes: GeneratedRecipe[] = []
    for (const recipe of parsed.recipes) {
      if (isValidRecipe(recipe)) {
        // Normalize the recipe structure
        validRecipes.push({
          name: recipe.name,
          description: recipe.description || '',
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prepTime: recipe.prepTime || '',
          cookTime: recipe.cookTime || '',
          servings: recipe.servings || 4,
          difficulty: normalizeRecipeDifficulty(recipe.difficulty),
          calories: recipe.calories,
        })
      }
    }
    
    return validRecipes
  } catch {
    return []
  }
}

/**
 * Normalizes difficulty string to valid RecipeDifficulty
 */
function normalizeRecipeDifficulty(difficulty: unknown): RecipeDifficulty {
  if (typeof difficulty !== 'string') return 'Medium'
  
  const normalized = difficulty.toLowerCase()
  if (normalized === 'easy') return 'Easy'
  if (normalized === 'hard') return 'Hard'
  return 'Medium'
}


/**
 * Gemini Service class for AI text generation
 * Requirements: 1.1, 1.4, 4.2 (rate limiting), 4.3 (caching), 6.1 (dependency injection), 6.3
 */
export class GeminiService {
  private client: GoogleGenerativeAI
  private model: GenerativeModel
  private config: GeminiServiceConfig
  private rateLimiter: RateLimiter
  
  /**
   * Creates a new GeminiService instance
   * Property 5: Missing API key error handling
   * Validates: Requirements 3.2
   */
  constructor(config?: Partial<GeminiServiceConfig>) {
    // Validate environment variables
    validateGeminiEnv()
    
    this.config = {
      apiKey: config?.apiKey || geminiEnv.GEMINI_API_KEY,
      textModel: (config?.textModel || geminiEnv.GEMINI_TEXT_MODEL) as 'gemini-1.5-flash' | 'gemini-1.5-pro',
      maxTokens: config?.maxTokens || geminiEnv.GEMINI_MAX_TOKENS,
      temperature: config?.temperature || geminiEnv.GEMINI_TEMPERATURE,
    }
    
    // Property 6: API key not exposed in responses
    // Validates: Requirements 3.3
    // The API key is stored privately and never included in responses
    this.client = new GoogleGenerativeAI(this.config.apiKey)
    this.model = this.client.getGenerativeModel({
      model: this.config.textModel,
      generationConfig: {
        maxOutputTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      },
    })
    
    // Initialize rate limiter for API calls
    // Requirements: 4.2 (rate limit handling)
    this.rateLimiter = getGeminiRateLimiter()
  }
  
  /**
   * Generates a response for a chat message
   * Requirements: 1.1, 1.2, 4.1, 4.2 (rate limiting), 4.3
   */
  async generateResponse(
    message: string,
    conversationHistory: ChatMessage[] = [],
    userPreferences?: UserPreferences,
    retryConfig?: RetryConfig
  ): Promise<AIResponse> {
    const generateFn = async (): Promise<AIResponse> => {
      // Build the system prompt with user preferences
      const systemPrompt = buildSystemPrompt(userPreferences)
      
      // Format conversation history
      const historyContext = formatConversationHistory(conversationHistory, {
        maxTokens: Math.floor(this.config.maxTokens / 2), // Reserve half for response
      })
      
      // Construct the full prompt
      let fullPrompt = systemPrompt + '\n\n'
      if (historyContext) {
        fullPrompt += 'Previous conversation:\n' + historyContext + '\n\n'
      }
      fullPrompt += `User: ${message}\n\nAssistant:`
      
      // Generate response with rate limiting
      // Requirements: 4.2 (queue request and retry after cooldown)
      const result = await this.rateLimiter.execute(() => 
        this.model.generateContent(fullPrompt)
      )
      const response = result.response
      const text = response.text()
      
      // Try to parse recipes from the response
      const recipes = parseRecipesFromResponse(text)
      
      // Transform to AIResponse
      return transformToAIResponse(text, recipes.length > 0 ? recipes : undefined)
    }

    try {
      // Use retry logic for transient errors
      return await withRetry(generateFn, retryConfig)
    } catch (error) {
      // Ensure we always throw a GeminiServiceError
      throw this.handleError(error)
    }
  }

  
  /**
   * Generates recipe suggestions based on ingredients
   * Requirements: 1.3, 1.4, 4.1, 4.2 (rate limiting), 4.3 (caching)
   */
  async generateRecipeSuggestions(
    ingredients: string[],
    preferences?: UserPreferences,
    retryConfig?: RetryConfig
  ): Promise<RecipeSuggestion[]> {
    // Check cache first
    // Requirements: 4.3 (cache recipe suggestions for similar ingredients)
    const cache = getRecipeSuggestionsCache()
    const cachedRecipes = cache.get(ingredients)
    if (cachedRecipes) {
      // Return cached recipes, converting to RecipeSuggestion type
      return cachedRecipes as RecipeSuggestion[]
    }

    const generateFn = async (): Promise<RecipeSuggestion[]> => {
      // Build the recipe prompt
      const prompt = buildRecipePrompt(ingredients, preferences)
      const systemPrompt = buildSystemPrompt(preferences)
      
      const fullPrompt = systemPrompt + '\n\n' + prompt
      
      // Generate response with rate limiting
      // Requirements: 4.2 (queue request and retry after cooldown)
      const result = await this.rateLimiter.execute(() =>
        this.model.generateContent(fullPrompt)
      )
      const response = result.response
      const text = response.text()
      
      // Parse recipes from response
      const recipes = parseRecipesFromResponse(text)
      
      if (recipes.length === 0) {
        throw new GeminiServiceError(
          'PARSE_ERROR',
          getUserFriendlyErrorMessage('PARSE_ERROR'),
          undefined,
          false // Parse errors are not retryable
        )
      }
      
      return recipes
    }

    try {
      // Use retry logic for transient errors
      const recipes = await withRetry(generateFn, retryConfig)
      
      // Cache the results
      // Requirements: 4.3 (cache recipe suggestions for similar ingredients)
      cache.set(ingredients, recipes as CachedRecipeSuggestion[])
      
      return recipes
    } catch (error) {
      // On error, try to return cached response if available (even if expired)
      // Requirements: 4.3 (return cached response on network failure)
      const fallbackCached = cache.get(ingredients)
      if (fallbackCached) {
        return fallbackCached as RecipeSuggestion[]
      }
      
      // Ensure we always throw a GeminiServiceError
      if (error instanceof GeminiServiceError) {
        throw error
      }
      throw this.handleError(error)
    }
  }
  
  /**
   * Handles errors and transforms them to user-friendly messages
   * Property 7: API error to user-friendly message transformation
   * Property 8: Network error graceful handling
   * Validates: Requirements 4.1, 4.3
   */
  private handleError(error: unknown): GeminiServiceError {
    return createGeminiError(error)
  }
  
  /**
   * Gets the current configuration (without exposing API key)
   * Property 6: API key not exposed in responses
   * Validates: Requirements 3.3
   */
  getConfig(): Omit<GeminiServiceConfig, 'apiKey'> {
    return {
      textModel: this.config.textModel,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    }
  }
}

/**
 * Factory function for creating GeminiService instance
 * Requirements: 6.1 (dependency injection)
 */
export function createGeminiService(config?: Partial<GeminiServiceConfig>): GeminiService {
  return new GeminiService(config)
}
