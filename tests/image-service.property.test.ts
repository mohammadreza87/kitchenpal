/**
 * Property-Based Tests for Image Service
 * Using fast-check library as specified in design document
 * Minimum 100 iterations per property test
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  isValidGeneratedImage,
  isValidBase64,
  isValidImageUrl,
  createFallbackImageResponse,
  FALLBACK_PLACEHOLDER_IMAGE,
  getImageErrorMessage,
  classifyImageError,
  createImageError,
  isImageRetryableError,
  ImageServiceError,
  type GeneratedImage,
  type ImageErrorType,
} from '../lib/services/image.service'

// Arbitraries for generating test data

// Valid base64 string arbitrary
const validBase64Arbitrary = fc.stringMatching(/^[A-Za-z0-9+/]{4,100}={0,2}$/)

// Valid mime type arbitrary
const validMimeTypeArbitrary = fc.constantFrom('image/png', 'image/jpeg') as fc.Arbitrary<'image/png' | 'image/jpeg'>

// Valid URL arbitrary
const validUrlArbitrary = fc.oneof(
  // Relative paths
  fc.stringMatching(/^\/[a-z0-9\-_/]+\.(png|jpg|jpeg|svg|webp)$/),
  // Absolute URLs
  fc.constantFrom(
    'https://example.com/image.png',
    'https://cdn.example.com/food/recipe.jpg',
    'http://localhost:3000/assets/image.png'
  )
)

// Invalid URL arbitrary
const invalidUrlArbitrary = fc.oneof(
  fc.constant(''),
  fc.constant('not-a-url'),
  fc.constant('ftp://invalid.com/image.png'),
  fc.constant('javascript:alert(1)'),
  fc.stringMatching(/^[a-z]+$/).filter(s => !s.startsWith('/'))
)

// Valid GeneratedImage arbitrary
const validGeneratedImageArbitrary: fc.Arbitrary<GeneratedImage> = fc.record({
  base64Data: fc.oneof(validBase64Arbitrary, fc.constant('')),
  mimeType: validMimeTypeArbitrary,
  url: fc.option(validUrlArbitrary, { nil: undefined }),
})


describe('Image Service Property Tests', () => {
  /**
   * **Feature: gemini-ai-integration, Property 3: Image response format validation**
   * **Validates: Requirements 2.3**
   *
   * *For any* successful image generation response, the output should be either
   * a valid base64 string or a valid URL format.
   */
  describe('Property 3: Image response format validation', () => {
    it('should validate GeneratedImage with valid base64 and mimeType', () => {
      fc.assert(
        fc.property(
          validBase64Arbitrary,
          validMimeTypeArbitrary,
          (base64Data, mimeType) => {
            const image: GeneratedImage = {
              base64Data,
              mimeType,
            }
            expect(isValidGeneratedImage(image)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate GeneratedImage with empty base64 and valid URL', () => {
      fc.assert(
        fc.property(
          validMimeTypeArbitrary,
          validUrlArbitrary,
          (mimeType, url) => {
            const image: GeneratedImage = {
              base64Data: '',
              mimeType,
              url,
            }
            expect(isValidGeneratedImage(image)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reject GeneratedImage with invalid mimeType', () => {
      fc.assert(
        fc.property(
          validBase64Arbitrary,
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== 'image/png' && s !== 'image/jpeg'),
          (base64Data, invalidMimeType) => {
            const image = {
              base64Data,
              mimeType: invalidMimeType,
            }
            expect(isValidGeneratedImage(image)).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reject GeneratedImage with non-string base64Data', () => {
      const invalidBase64Values = [null, undefined, 123, [], {}, true]
      
      for (const invalidValue of invalidBase64Values) {
        const image = {
          base64Data: invalidValue,
          mimeType: 'image/png',
        }
        expect(isValidGeneratedImage(image)).toBe(false)
      }
    })

    it('should reject null and undefined values', () => {
      expect(isValidGeneratedImage(null)).toBe(false)
      expect(isValidGeneratedImage(undefined)).toBe(false)
      expect(isValidGeneratedImage({})).toBe(false)
    })

    it('should validate base64 strings correctly', () => {
      fc.assert(
        fc.property(validBase64Arbitrary, (base64) => {
          expect(isValidBase64(base64)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject invalid base64 strings', () => {
      const invalidBase64Values = [
        '',
        'not-base64!@#$',
        'has spaces in it',
        '===invalid===',
      ]
      
      for (const invalid of invalidBase64Values) {
        expect(isValidBase64(invalid)).toBe(false)
      }
    })

    it('should validate URL formats correctly', () => {
      fc.assert(
        fc.property(validUrlArbitrary, (url) => {
          expect(isValidImageUrl(url)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject invalid URL formats', () => {
      fc.assert(
        fc.property(invalidUrlArbitrary, (url) => {
          expect(isValidImageUrl(url)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('should accept relative paths as valid URLs', () => {
      const relativePaths = [
        '/assets/image.png',
        '/images/food/recipe.jpg',
        '/public/placeholder.svg',
      ]
      
      for (const path of relativePaths) {
        expect(isValidImageUrl(path)).toBe(true)
      }
    })

    it('should accept https and http URLs', () => {
      const validUrls = [
        'https://example.com/image.png',
        'http://localhost:3000/image.jpg',
        'https://cdn.example.com/food/recipe.webp',
      ]
      
      for (const url of validUrls) {
        expect(isValidImageUrl(url)).toBe(true)
      }
    })

    it('should reject non-http/https protocols', () => {
      const invalidProtocols = [
        'ftp://example.com/image.png',
        'file:///path/to/image.png',
        'javascript:alert(1)',
        'data:image/png;base64,abc',
      ]
      
      for (const url of invalidProtocols) {
        expect(isValidImageUrl(url)).toBe(false)
      }
    })
  })


  /**
   * **Feature: gemini-ai-integration, Property 4: Image generation error fallback**
   * **Validates: Requirements 2.4**
   *
   * *For any* image generation error, the service should return a valid fallback
   * placeholder image path and not throw an unhandled exception.
   */
  describe('Property 4: Image generation error fallback', () => {
    it('should return a valid fallback image response', () => {
      const fallback = createFallbackImageResponse()
      
      // Should be a valid GeneratedImage
      expect(isValidGeneratedImage(fallback)).toBe(true)
      
      // Should have the fallback placeholder URL
      expect(fallback.url).toBe(FALLBACK_PLACEHOLDER_IMAGE)
      
      // Should have valid mimeType
      expect(fallback.mimeType).toBe('image/png')
    })

    it('should have a valid fallback placeholder path', () => {
      // Fallback should be a valid URL/path
      expect(isValidImageUrl(FALLBACK_PLACEHOLDER_IMAGE)).toBe(true)
      
      // Should be a relative path
      expect(FALLBACK_PLACEHOLDER_IMAGE.startsWith('/')).toBe(true)
    })

    it('should create consistent fallback responses', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), () => {
          const fallback1 = createFallbackImageResponse()
          const fallback2 = createFallbackImageResponse()
          
          // Multiple calls should return consistent structure
          expect(fallback1.url).toBe(fallback2.url)
          expect(fallback1.mimeType).toBe(fallback2.mimeType)
        }),
        { numRuns: 100 }
      )
    })

    it('should handle all error types gracefully and return user-friendly messages', () => {
      const allErrorTypes: ImageErrorType[] = [
        'API_KEY_MISSING',
        'API_ERROR',
        'NETWORK_ERROR',
        'RATE_LIMITED',
        'INVALID_RESPONSE',
        'GENERATION_FAILED',
        'TIMEOUT_ERROR',
        'SERVER_ERROR',
      ]

      for (const errorType of allErrorTypes) {
        const message = getImageErrorMessage(errorType)
        
        // Should have a user-friendly message
        expect(message).toBeDefined()
        expect(message.length).toBeGreaterThan(0)
        expect(message.length).toBeLessThan(200)
        
        // Should not contain technical details
        expect(message).not.toMatch(/\b(ECONNREFUSED|ENOTFOUND|ECONNRESET)\b/)
        expect(message).not.toMatch(/^Error:/)
      }
    })

    it('should classify errors correctly and create ImageServiceError', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom(
              'Network error',
              'ECONNREFUSED',
              'timeout exceeded',
              'Rate limit exceeded',
              '500 Internal Server Error',
              'generation blocked',
              'API Error'
            ),
            fc.string({ minLength: 1, maxLength: 100 })
          ),
          (errorMessage) => {
            const error = new Error(errorMessage)
            const imageError = createImageError(error)
            
            // Should be an ImageServiceError
            expect(imageError).toBeInstanceOf(ImageServiceError)
            
            // Should have a valid type
            expect(imageError.type).toBeDefined()
            
            // Should have a user-friendly message
            expect(imageError.userMessage).toBeDefined()
            expect(imageError.userMessage.length).toBeGreaterThan(0)
            
            // Should preserve original error
            expect(imageError.originalError).toBeDefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should correctly identify retryable errors', () => {
      const retryableTypes: ImageErrorType[] = ['NETWORK_ERROR', 'RATE_LIMITED', 'TIMEOUT_ERROR', 'SERVER_ERROR']
      const nonRetryableTypes: ImageErrorType[] = ['API_KEY_MISSING', 'API_ERROR', 'INVALID_RESPONSE', 'GENERATION_FAILED']

      for (const type of retryableTypes) {
        expect(isImageRetryableError(type)).toBe(true)
      }

      for (const type of nonRetryableTypes) {
        expect(isImageRetryableError(type)).toBe(false)
      }
    })

    it('should classify network errors as retryable', () => {
      const networkErrors = [
        new TypeError('Failed to fetch'),
        new Error('ECONNREFUSED'),
        new Error('network error'),
        new Error('ENOTFOUND'),
      ]

      for (const error of networkErrors) {
        const imageError = createImageError(error)
        expect(imageError.type).toBe('NETWORK_ERROR')
        expect(imageError.isRetryable).toBe(true)
      }
    })

    it('should classify generation failures as non-retryable', () => {
      const generationErrors = [
        new Error('generation blocked by safety'),
        new Error('content policy violation'),
        new Error('blocked due to safety'),
      ]

      for (const error of generationErrors) {
        const imageError = createImageError(error)
        expect(imageError.type).toBe('GENERATION_FAILED')
        expect(imageError.isRetryable).toBe(false)
      }
    })

    it('should never throw unhandled exception for any error input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 100 }).map(msg => new Error(msg)),
            fc.constant(new TypeError('Failed to fetch')),
            fc.constant(null),
            fc.constant(undefined),
            fc.string({ minLength: 1, maxLength: 50 })
          ),
          (error) => {
            // Should never throw
            expect(() => createImageError(error)).not.toThrow()
            
            const imageError = createImageError(error)
            
            // Should always be an ImageServiceError
            expect(imageError).toBeInstanceOf(ImageServiceError)
            
            // Should always have valid properties
            expect(imageError.type).toBeDefined()
            expect(imageError.userMessage).toBeDefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should have unique user-friendly messages for all error types', () => {
      const allErrorTypes: ImageErrorType[] = [
        'API_KEY_MISSING',
        'API_ERROR',
        'NETWORK_ERROR',
        'RATE_LIMITED',
        'INVALID_RESPONSE',
        'GENERATION_FAILED',
        'TIMEOUT_ERROR',
        'SERVER_ERROR',
      ]

      const messages = allErrorTypes.map(getImageErrorMessage)
      const uniqueMessages = new Set(messages)

      // Each error type should have a unique message
      expect(uniqueMessages.size).toBe(allErrorTypes.length)
    })
  })
})
