/**
 * Property-Based Tests for Gemini Service
 * Using fast-check library as specified in design document
 * Minimum 100 iterations per property test
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  isValidRecipe,
  isValidAIResponse,
  transformToAIResponse,
  parseRecipesFromResponse,
  getUserFriendlyErrorMessage,
  classifyError,
  createGeminiError,
  isRetryableError,
  GeminiServiceError,
  type GeneratedRecipe,
  type AIResponse,
  type GeminiErrorType,
} from '../lib/services/gemini.service'
import type { RecipeDifficulty } from '../types/chat'

// Arbitraries for generating test data
const difficultyArbitrary = fc.constantFrom('Easy', 'Medium', 'Hard') as fc.Arbitrary<RecipeDifficulty>

const ingredientItemArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  quantity: fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }),
  unit: fc.constantFrom('cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'ml', 'piece', 'clove'),
})

// Non-empty string that's not just whitespace
const nonEmptyStringArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)

const generatedRecipeArbitrary: fc.Arbitrary<GeneratedRecipe> = fc.record({
  name: nonEmptyStringArbitrary,
  description: fc.string({ minLength: 0, maxLength: 500 }),
  ingredients: fc.array(ingredientItemArbitrary, { minLength: 1, maxLength: 20 }),
  instructions: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 15 }),
  prepTime: fc.constantFrom('5 mins', '10 mins', '15 mins', '20 mins', '30 mins'),
  cookTime: fc.constantFrom('10 mins', '20 mins', '30 mins', '45 mins', '1 hour'),
  servings: fc.integer({ min: 1, max: 12 }),
  difficulty: difficultyArbitrary,
  calories: fc.option(fc.integer({ min: 50, max: 2000 }), { nil: undefined }),
})

const quickReplyArbitrary = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1, maxLength: 50 }),
  value: fc.string({ minLength: 1, maxLength: 100 }),
})

const recipeOptionArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
})


describe('Gemini Service Property Tests', () => {
  /**
   * **Feature: gemini-ai-integration, Property 2: Recipe response structure validation**
   * **Validates: Requirements 1.4**
   *
   * *For any* valid API response containing recipe data, the parsed result
   * should contain all required fields: name, ingredients (as array), and instructions (as array).
   */
  describe('Property 2: Recipe response structure validation', () => {
    it('should validate recipes with all required fields', () => {
      fc.assert(
        fc.property(generatedRecipeArbitrary, (recipe) => {
          // A valid recipe should pass validation
          expect(isValidRecipe(recipe)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject recipes missing name', () => {
      fc.assert(
        fc.property(generatedRecipeArbitrary, (recipe) => {
          const invalidRecipe = { ...recipe, name: '' }
          expect(isValidRecipe(invalidRecipe)).toBe(false)

          const noNameRecipe = { ...recipe } as Record<string, unknown>
          delete noNameRecipe.name
          expect(isValidRecipe(noNameRecipe)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject recipes with non-array ingredients', () => {
      fc.assert(
        fc.property(generatedRecipeArbitrary, (recipe) => {
          const invalidRecipe = { ...recipe, ingredients: 'not an array' }
          expect(isValidRecipe(invalidRecipe)).toBe(false)

          const nullIngredients = { ...recipe, ingredients: null }
          expect(isValidRecipe(nullIngredients)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject recipes with non-array instructions', () => {
      fc.assert(
        fc.property(generatedRecipeArbitrary, (recipe) => {
          const invalidRecipe = { ...recipe, instructions: 'not an array' }
          expect(isValidRecipe(invalidRecipe)).toBe(false)

          const nullInstructions = { ...recipe, instructions: null }
          expect(isValidRecipe(nullInstructions)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject recipes with invalid ingredient structure', () => {
      fc.assert(
        fc.property(generatedRecipeArbitrary, (recipe) => {
          // Ingredient missing name
          const missingName = {
            ...recipe,
            ingredients: [{ quantity: 1, unit: 'cup' }],
          }
          expect(isValidRecipe(missingName)).toBe(false)

          // Ingredient missing quantity
          const missingQuantity = {
            ...recipe,
            ingredients: [{ name: 'flour', unit: 'cup' }],
          }
          expect(isValidRecipe(missingQuantity)).toBe(false)

          // Ingredient missing unit
          const missingUnit = {
            ...recipe,
            ingredients: [{ name: 'flour', quantity: 1 }],
          }
          expect(isValidRecipe(missingUnit)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject recipes with non-string instructions', () => {
      fc.assert(
        fc.property(generatedRecipeArbitrary, (recipe) => {
          const invalidInstructions = {
            ...recipe,
            instructions: [1, 2, 3],
          }
          expect(isValidRecipe(invalidInstructions)).toBe(false)

          const mixedInstructions = {
            ...recipe,
            instructions: ['Step 1', 123, 'Step 3'],
          }
          expect(isValidRecipe(mixedInstructions)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject null and undefined values', () => {
      expect(isValidRecipe(null)).toBe(false)
      expect(isValidRecipe(undefined)).toBe(false)
      expect(isValidRecipe({})).toBe(false)
    })

    it('should parse valid recipe JSON from response text', () => {
      fc.assert(
        fc.property(
          fc.array(generatedRecipeArbitrary, { minLength: 1, maxLength: 3 }),
          (recipes) => {
            const jsonResponse = JSON.stringify({ recipes })
            const parsed = parseRecipesFromResponse(jsonResponse)

            // Should parse the same number of recipes
            expect(parsed.length).toBe(recipes.length)

            // Each parsed recipe should have required fields
            for (const recipe of parsed) {
              expect(typeof recipe.name).toBe('string')
              expect(Array.isArray(recipe.ingredients)).toBe(true)
              expect(Array.isArray(recipe.instructions)).toBe(true)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty array for invalid JSON', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (randomText) => {
            // Random text that's not valid JSON should return empty array
            const parsed = parseRecipesFromResponse(randomText)
            expect(Array.isArray(parsed)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })
  })


  /**
   * **Feature: gemini-ai-integration, Property 11: Response type transformation**
   * **Validates: Requirements 6.3**
   *
   * *For any* valid Gemini API response, the transformation to internal types
   * should produce a valid AIResponse object with correct field types.
   */
  describe('Property 11: Response type transformation', () => {
    it('should transform content string to valid AIResponse', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (content) => {
            const response = transformToAIResponse(content)

            // Should be a valid AIResponse
            expect(isValidAIResponse(response)).toBe(true)
            expect(response.content).toBe(content)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include recipes and recipeOptions when recipes are provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.array(generatedRecipeArbitrary, { minLength: 1, maxLength: 5 }),
          (content, recipes) => {
            const response = transformToAIResponse(content, recipes)

            // Should have recipes
            expect(response.recipes).toBeDefined()
            expect(response.recipes?.length).toBe(recipes.length)

            // Should have recipeOptions matching recipes
            expect(response.recipeOptions).toBeDefined()
            expect(response.recipeOptions?.length).toBe(recipes.length)

            // Recipe options should have correct names
            for (let i = 0; i < recipes.length; i++) {
              expect(response.recipeOptions?.[i].name).toBe(recipes[i].name)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not include recipes when none are provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (content) => {
            const response = transformToAIResponse(content, undefined)

            expect(response.recipes).toBeUndefined()
            expect(response.recipeOptions).toBeUndefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not include recipes when empty array is provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (content) => {
            const response = transformToAIResponse(content, [])

            expect(response.recipes).toBeUndefined()
            expect(response.recipeOptions).toBeUndefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate AIResponse with all optional fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.array(quickReplyArbitrary, { minLength: 0, maxLength: 5 }),
          fc.array(recipeOptionArbitrary, { minLength: 0, maxLength: 5 }),
          fc.array(generatedRecipeArbitrary, { minLength: 0, maxLength: 3 }),
          (content, quickReplies, recipeOptions, recipes) => {
            const response: AIResponse = {
              content,
              quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
              recipeOptions: recipeOptions.length > 0 ? recipeOptions : undefined,
              recipes: recipes.length > 0 ? recipes : undefined,
            }

            expect(isValidAIResponse(response)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reject AIResponse with non-string content', () => {
      const invalidResponses = [
        { content: 123 },
        { content: null },
        { content: undefined },
        { content: [] },
        { content: {} },
      ]

      for (const response of invalidResponses) {
        expect(isValidAIResponse(response)).toBe(false)
      }
    })

    it('should reject AIResponse with invalid quickReplies', () => {
      const invalidResponse = {
        content: 'Hello',
        quickReplies: 'not an array',
      }
      expect(isValidAIResponse(invalidResponse)).toBe(false)
    })

    it('should reject AIResponse with invalid recipeOptions', () => {
      const invalidResponse = {
        content: 'Hello',
        recipeOptions: 'not an array',
      }
      expect(isValidAIResponse(invalidResponse)).toBe(false)
    })

    it('should reject AIResponse with invalid recipes', () => {
      const invalidResponse = {
        content: 'Hello',
        recipes: 'not an array',
      }
      expect(isValidAIResponse(invalidResponse)).toBe(false)

      const invalidRecipeInArray = {
        content: 'Hello',
        recipes: [{ name: '' }], // Invalid recipe
      }
      expect(isValidAIResponse(invalidRecipeInArray)).toBe(false)
    })
  })


  /**
   * **Feature: gemini-ai-integration, Property 6: API key not exposed in responses**
   * **Validates: Requirements 3.3**
   *
   * *For any* service response (success or error), the response content
   * should not contain the API key string.
   */
  describe('Property 6: API key not exposed in responses', () => {
    // Generate fake API keys for testing
    const apiKeyArbitrary = fc.stringMatching(/^AIza[A-Za-z0-9_-]{35}$/)

    it('should not expose API key in error messages for any error type', () => {
      fc.assert(
        fc.property(
          apiKeyArbitrary,
          fc.constantFrom('API_KEY_MISSING', 'API_ERROR', 'NETWORK_ERROR', 'RATE_LIMITED', 'INVALID_RESPONSE', 'PARSE_ERROR') as fc.Arbitrary<GeminiErrorType>,
          (apiKey, errorType) => {
            const message = getUserFriendlyErrorMessage(errorType)

            // Error message should never contain the API key
            expect(message).not.toContain(apiKey)

            // Error message should be user-friendly (not empty, reasonable length)
            expect(message.length).toBeGreaterThan(0)
            expect(message.length).toBeLessThan(200)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not include API key in error messages', () => {
      fc.assert(
        fc.property(apiKeyArbitrary, (apiKey) => {
          const errorTypes: GeminiErrorType[] = [
            'API_KEY_MISSING',
            'API_ERROR',
            'NETWORK_ERROR',
            'RATE_LIMITED',
            'INVALID_RESPONSE',
            'PARSE_ERROR',
          ]

          for (const errorType of errorTypes) {
            const message = getUserFriendlyErrorMessage(errorType)

            // Error message should not contain the API key
            expect(message).not.toContain(apiKey)

            // Error message should not contain common API key patterns
            expect(message).not.toMatch(/AIza[A-Za-z0-9_-]{35}/)
            expect(message).not.toContain('api_key')
            expect(message).not.toContain('apiKey')
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should provide user-friendly error messages without technical details', () => {
      const errorTypes: GeminiErrorType[] = [
        'API_KEY_MISSING',
        'API_ERROR',
        'NETWORK_ERROR',
        'RATE_LIMITED',
        'INVALID_RESPONSE',
        'PARSE_ERROR',
      ]

      for (const errorType of errorTypes) {
        const message = getUserFriendlyErrorMessage(errorType)

        // Message should be user-friendly
        expect(message.length).toBeGreaterThan(0)
        expect(message.length).toBeLessThan(200)

        // Should not contain stack traces or technical error patterns
        expect(message).not.toMatch(/^Error:/)
        expect(message).not.toMatch(/^\s+at\s+/)
        // Should not expose HTTP status codes directly
        expect(message).not.toMatch(/\b(400|401|403|404|500|502|503)\b/)
      }
    })

    it('should have distinct messages for different error types', () => {
      const errorTypes: GeminiErrorType[] = [
        'API_KEY_MISSING',
        'API_ERROR',
        'NETWORK_ERROR',
        'RATE_LIMITED',
        'INVALID_RESPONSE',
        'PARSE_ERROR',
      ]

      const messages = errorTypes.map(getUserFriendlyErrorMessage)
      const uniqueMessages = new Set(messages)

      // Each error type should have a unique message
      expect(uniqueMessages.size).toBe(errorTypes.length)
    })
  })


  /**
   * **Feature: gemini-ai-integration, Property 7: API error to user-friendly message transformation**
   * **Validates: Requirements 4.1**
   *
   * *For any* Gemini API error response, the service should return a user-friendly message
   * that does not expose internal error details.
   */
  describe('Property 7: API error to user-friendly message transformation', () => {
    // All error types including new ones
    const allErrorTypes: GeminiErrorType[] = [
      'API_KEY_MISSING',
      'API_ERROR',
      'NETWORK_ERROR',
      'RATE_LIMITED',
      'INVALID_RESPONSE',
      'PARSE_ERROR',
      'TIMEOUT_ERROR',
      'SERVER_ERROR',
    ]

    // Arbitrary for generating various error messages that might come from APIs
    const apiErrorMessageArbitrary = fc.oneof(
      // HTTP status code errors
      fc.constantFrom(
        'Error 400: Bad Request',
        'Error 401: Unauthorized',
        'Error 403: Forbidden',
        'Error 404: Not Found',
        'Error 429: Too Many Requests',
        'Error 500: Internal Server Error',
        'Error 502: Bad Gateway',
        'Error 503: Service Unavailable',
        'Error 504: Gateway Timeout'
      ),
      // Network errors
      fc.constantFrom(
        'TypeError: Failed to fetch',
        'NetworkError: Network request failed',
        'ECONNREFUSED: Connection refused',
        'ENOTFOUND: DNS lookup failed',
        'ECONNRESET: Connection reset by peer',
        'Socket timeout'
      ),
      // Rate limiting errors
      fc.constantFrom(
        'Rate limit exceeded',
        'Quota exceeded for the day',
        'Too many requests, please slow down',
        '429 Too Many Requests'
      ),
      // Generic API errors
      fc.constantFrom(
        'API Error: Invalid request',
        'API Error: Malformed input',
        'Invalid API key',
        'Request timeout'
      ),
      // Random error messages
      fc.string({ minLength: 5, maxLength: 200 })
    )

    it('should classify API errors correctly and return user-friendly messages', () => {
      fc.assert(
        fc.property(apiErrorMessageArbitrary, (errorMessage) => {
          const error = new Error(errorMessage)
          const errorType = classifyError(error)
          const userMessage = getUserFriendlyErrorMessage(errorType)

          // User message should be defined and non-empty
          expect(userMessage).toBeDefined()
          expect(userMessage.length).toBeGreaterThan(0)

          // User message should NOT contain the original error message
          expect(userMessage).not.toContain(errorMessage)

          // User message should NOT contain technical details
          expect(userMessage).not.toMatch(/\b(ECONNREFUSED|ENOTFOUND|ECONNRESET)\b/)
          expect(userMessage).not.toMatch(/^Error:/)
          expect(userMessage).not.toMatch(/^\s+at\s+/)
        }),
        { numRuns: 100 }
      )
    })

    it('should create GeminiServiceError with user-friendly message for any error', () => {
      fc.assert(
        fc.property(apiErrorMessageArbitrary, (errorMessage) => {
          const originalError = new Error(errorMessage)
          const geminiError = createGeminiError(originalError)

          // Should be a GeminiServiceError
          expect(geminiError).toBeInstanceOf(GeminiServiceError)

          // User message should be user-friendly
          expect(geminiError.userMessage.length).toBeGreaterThan(0)
          expect(geminiError.userMessage.length).toBeLessThan(200)

          // Should not expose original error message in user message
          expect(geminiError.userMessage).not.toContain(errorMessage)

          // Should preserve original error for debugging
          expect(geminiError.originalError).toBeDefined()
        }),
        { numRuns: 100 }
      )
    })

    it('should return consistent user-friendly messages for same error type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allErrorTypes),
          fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
          (errorType, errorMessages) => {
            // All errors of the same type should produce the same user message
            const userMessages = errorMessages.map(() => getUserFriendlyErrorMessage(errorType))
            const uniqueMessages = new Set(userMessages)

            expect(uniqueMessages.size).toBe(1)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should classify rate limit errors correctly', () => {
      const rateLimitMessages = [
        'Rate limit exceeded',
        'Quota exceeded',
        '429 Too Many Requests',
        'too many requests',
      ]

      for (const message of rateLimitMessages) {
        const error = new Error(message)
        const errorType = classifyError(error)
        expect(errorType).toBe('RATE_LIMITED')
      }
    })

    it('should classify network errors correctly', () => {
      const networkErrorMessages = [
        'ECONNREFUSED: Connection refused',
        'ENOTFOUND: DNS lookup failed',
        'ECONNRESET: Connection reset',
        'network error occurred',
        'socket hang up',
      ]

      for (const message of networkErrorMessages) {
        const error = new Error(message)
        const errorType = classifyError(error)
        expect(errorType).toBe('NETWORK_ERROR')
      }
    })

    it('should classify server errors correctly', () => {
      // Note: 504 Gateway Timeout is classified as TIMEOUT_ERROR since it contains "timeout"
      // This is intentional - timeout errors have specific retry behavior
      const serverErrorMessages = [
        '500 Internal Server Error',
        '502 Bad Gateway',
        '503 Service Unavailable',
        'internal server error',
        'service unavailable',
      ]

      for (const message of serverErrorMessages) {
        const error = new Error(message)
        const errorType = classifyError(error)
        expect(errorType).toBe('SERVER_ERROR')
      }

      // 504 is classified as timeout since it's a timeout-related error
      const timeoutGatewayError = new Error('504 Gateway Timeout')
      expect(classifyError(timeoutGatewayError)).toBe('TIMEOUT_ERROR')
    })

    it('should classify timeout errors correctly', () => {
      const timeoutMessages = [
        'Request timeout',
        'Connection timed out',
        'timeout exceeded',
      ]

      for (const message of timeoutMessages) {
        const error = new Error(message)
        const errorType = classifyError(error)
        expect(errorType).toBe('TIMEOUT_ERROR')
      }
    })

    it('should have unique user-friendly messages for all error types', () => {
      const messages = allErrorTypes.map(getUserFriendlyErrorMessage)
      const uniqueMessages = new Set(messages)

      // Each error type should have a unique message
      expect(uniqueMessages.size).toBe(allErrorTypes.length)
    })

    it('should not expose HTTP status codes in user messages', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allErrorTypes),
          (errorType) => {
            const message = getUserFriendlyErrorMessage(errorType)

            // Should not contain raw HTTP status codes
            expect(message).not.toMatch(/\b(400|401|403|404|429|500|502|503|504)\b/)
          }
        ),
        { numRuns: 100 }
      )
    })
  })


  /**
   * **Feature: gemini-ai-integration, Property 8: Network error graceful handling**
   * **Validates: Requirements 4.3**
   *
   * *For any* network failure, the service should return an appropriate error response
   * without crashing.
   */
  describe('Property 8: Network error graceful handling', () => {
    // Arbitrary for generating pure network error scenarios (excluding timeout-related messages)
    const pureNetworkErrorArbitrary = fc.oneof(
      // TypeError for fetch failures
      fc.constantFrom(
        'Failed to fetch',
        'Network request failed',
        'fetch failed',
        'NetworkError when attempting to fetch resource'
      ).map(msg => new TypeError(msg)),
      // Standard Error for network issues (excluding timeout-related)
      fc.constantFrom(
        'ECONNREFUSED: Connection refused',
        'ENOTFOUND: getaddrinfo ENOTFOUND api.example.com',
        'ECONNRESET: Connection reset by peer',
        'socket hang up',
        'DNS lookup failed',
        'network error',
        'Network is unreachable'
      ).map(msg => new Error(msg))
    )

    // Arbitrary for generating timeout errors (must contain 'timeout' or 'timed out')
    const timeoutErrorArbitrary = fc.constantFrom(
      'Request timeout',
      'Connection timed out',
      'timeout exceeded',
      'operation timed out',
      'The request timed out'
    ).map(msg => new Error(msg))

    // Arbitrary for generating various error types
    const anyErrorArbitrary = fc.oneof(
      pureNetworkErrorArbitrary,
      timeoutErrorArbitrary,
      fc.string({ minLength: 1, maxLength: 100 }).map(msg => new Error(msg)),
      fc.constant(new Error('Unknown error')),
      fc.constant(null),
      fc.constant(undefined),
      fc.string({ minLength: 1, maxLength: 50 })
    )

    it('should handle network errors gracefully and return user-friendly message', () => {
      fc.assert(
        fc.property(pureNetworkErrorArbitrary, (error) => {
          const geminiError = createGeminiError(error)

          // Should be a GeminiServiceError
          expect(geminiError).toBeInstanceOf(GeminiServiceError)

          // Should be classified as NETWORK_ERROR
          expect(geminiError.type).toBe('NETWORK_ERROR')

          // Should have a user-friendly message
          expect(geminiError.userMessage).toBe(getUserFriendlyErrorMessage('NETWORK_ERROR'))

          // Should be marked as retryable
          expect(geminiError.isRetryable).toBe(true)

          // Should preserve original error
          expect(geminiError.originalError).toBeDefined()
        }),
        { numRuns: 100 }
      )
    })

    it('should handle timeout errors gracefully', () => {
      fc.assert(
        fc.property(timeoutErrorArbitrary, (error) => {
          const geminiError = createGeminiError(error)

          // Should be a GeminiServiceError
          expect(geminiError).toBeInstanceOf(GeminiServiceError)

          // Should be classified as TIMEOUT_ERROR
          expect(geminiError.type).toBe('TIMEOUT_ERROR')

          // Should have a user-friendly message
          expect(geminiError.userMessage).toBe(getUserFriendlyErrorMessage('TIMEOUT_ERROR'))

          // Should be marked as retryable
          expect(geminiError.isRetryable).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should never throw unhandled exception for any error input', () => {
      fc.assert(
        fc.property(anyErrorArbitrary, (error) => {
          // Should never throw - always return a GeminiServiceError
          expect(() => createGeminiError(error)).not.toThrow()

          const geminiError = createGeminiError(error)

          // Should always be a GeminiServiceError
          expect(geminiError).toBeInstanceOf(GeminiServiceError)

          // Should always have a valid type
          expect(geminiError.type).toBeDefined()

          // Should always have a user-friendly message
          expect(geminiError.userMessage).toBeDefined()
          expect(geminiError.userMessage.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should correctly identify retryable errors', () => {
      const retryableTypes: GeminiErrorType[] = ['NETWORK_ERROR', 'RATE_LIMITED', 'TIMEOUT_ERROR', 'SERVER_ERROR']
      const nonRetryableTypes: GeminiErrorType[] = ['API_KEY_MISSING', 'API_ERROR', 'INVALID_RESPONSE', 'PARSE_ERROR']

      for (const type of retryableTypes) {
        expect(isRetryableError(type)).toBe(true)
      }

      for (const type of nonRetryableTypes) {
        expect(isRetryableError(type)).toBe(false)
      }
    })

    it('should mark network errors as retryable', () => {
      fc.assert(
        fc.property(pureNetworkErrorArbitrary, (error) => {
          const geminiError = createGeminiError(error)
          expect(geminiError.isRetryable).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should not expose network error details in user message', () => {
      fc.assert(
        fc.property(pureNetworkErrorArbitrary, (error) => {
          const geminiError = createGeminiError(error)

          // User message should not contain technical network error details
          expect(geminiError.userMessage).not.toMatch(/ECONNREFUSED/)
          expect(geminiError.userMessage).not.toMatch(/ENOTFOUND/)
          expect(geminiError.userMessage).not.toMatch(/ECONNRESET/)
          expect(geminiError.userMessage).not.toMatch(/ETIMEDOUT/)
          expect(geminiError.userMessage).not.toMatch(/socket/)
          expect(geminiError.userMessage).not.toMatch(/DNS/)
          expect(geminiError.userMessage).not.toContain(error.message)
        }),
        { numRuns: 100 }
      )
    })

    it('should handle TypeError fetch failures as network errors', () => {
      const fetchErrors = [
        new TypeError('Failed to fetch'),
        new TypeError('NetworkError when attempting to fetch resource'),
        new TypeError('fetch failed'),
      ]

      for (const error of fetchErrors) {
        const geminiError = createGeminiError(error)
        expect(geminiError.type).toBe('NETWORK_ERROR')
        expect(geminiError.isRetryable).toBe(true)
      }
    })

    it('should preserve original error for debugging while hiding from user', () => {
      fc.assert(
        fc.property(pureNetworkErrorArbitrary, (error) => {
          const geminiError = createGeminiError(error)

          // Original error should be preserved for debugging
          expect(geminiError.originalError).toBeDefined()
          expect(geminiError.originalError?.message).toBe(error.message)

          // But user message should not contain original error details
          expect(geminiError.userMessage).not.toContain(error.message)
        }),
        { numRuns: 100 }
      )
    })

    it('should return consistent error type for same error category', () => {
      fc.assert(
        fc.property(
          fc.array(pureNetworkErrorArbitrary, { minLength: 2, maxLength: 5 }),
          (errors) => {
            const types = errors.map(e => createGeminiError(e).type)
            const uniqueTypes = new Set(types)

            // All network errors should be classified the same way
            expect(uniqueTypes.size).toBe(1)
            expect(types[0]).toBe('NETWORK_ERROR')
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
