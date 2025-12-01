import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  buildSystemPrompt,
  formatConversationHistory,
  estimateTokenCount,
  isWithinTokenLimit,
  type UserPreferences,
} from '../lib/services/prompt-builder'
import type { ChatMessage } from '../types/chat'

/**
 * Property-Based Tests for Prompt Builder Service
 * Using fast-check library as specified in design document
 * Minimum 100 iterations per property test
 */

// Arbitraries for generating test data
const allergyArbitrary = fc.constantFrom(
  'peanuts', 'tree nuts', 'milk', 'eggs', 'wheat', 'soy', 'fish', 'shellfish', 'sesame'
)

const dietaryArbitrary = fc.constantFrom(
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'halal', 'kosher'
)

const cuisineArbitrary = fc.constantFrom(
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'French', 'Mediterranean'
)

const cookingSkillArbitrary = fc.constantFrom('beginner', 'intermediate', 'advanced') as fc.Arbitrary<'beginner' | 'intermediate' | 'advanced'>

const userPreferencesArbitrary: fc.Arbitrary<UserPreferences> = fc.record({
  allergies: fc.option(fc.array(allergyArbitrary, { minLength: 0, maxLength: 5 }), { nil: undefined }),
  dietary: fc.option(fc.array(dietaryArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined }),
  cuisinePreferences: fc.option(fc.array(cuisineArbitrary, { minLength: 0, maxLength: 4 }), { nil: undefined }),
  cookingSkill: fc.option(cookingSkillArbitrary, { nil: undefined }),
})

const messageRoleArbitrary = fc.constantFrom('user', 'assistant', 'system') as fc.Arbitrary<'user' | 'assistant' | 'system'>

const chatMessageArbitrary: fc.Arbitrary<ChatMessage> = fc.record({
  id: fc.uuid(),
  role: messageRoleArbitrary,
  content: fc.string({ minLength: 1, maxLength: 500 }),
  timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
})

describe('Prompt Builder Property Tests', () => {
  /**
   * **Feature: gemini-ai-integration, Property 1: System prompt includes user preferences**
   * **Validates: Requirements 1.2**
   *
   * *For any* set of user preferences (allergies, dietary restrictions),
   * the generated system prompt should contain all specified preferences as text.
   */
  describe('Property 1: System prompt includes user preferences', () => {
    it('should include all allergies in the system prompt', () => {
      fc.assert(
        fc.property(
          fc.array(allergyArbitrary, { minLength: 1, maxLength: 5 }),
          (allergies) => {
            const preferences: UserPreferences = { allergies }
            const prompt = buildSystemPrompt(preferences)

            // Every allergy should appear in the prompt
            for (const allergy of allergies) {
              expect(prompt).toContain(allergy)
            }

            // The prompt should contain the "Allergies" label
            expect(prompt).toContain('Allergies')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include all dietary restrictions in the system prompt', () => {
      fc.assert(
        fc.property(
          fc.array(dietaryArbitrary, { minLength: 1, maxLength: 3 }),
          (dietary) => {
            const preferences: UserPreferences = { dietary }
            const prompt = buildSystemPrompt(preferences)

            // Every dietary restriction should appear in the prompt
            for (const diet of dietary) {
              expect(prompt).toContain(diet)
            }

            // The prompt should contain the "Dietary" label
            expect(prompt).toContain('Dietary')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include cuisine preferences in the system prompt', () => {
      fc.assert(
        fc.property(
          fc.array(cuisineArbitrary, { minLength: 1, maxLength: 4 }),
          (cuisinePreferences) => {
            const preferences: UserPreferences = { cuisinePreferences }
            const prompt = buildSystemPrompt(preferences)

            // Every cuisine preference should appear in the prompt
            for (const cuisine of cuisinePreferences) {
              expect(prompt).toContain(cuisine)
            }

            // The prompt should contain the "Cuisine" label
            expect(prompt).toContain('Cuisine')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include cooking skill level in the system prompt', () => {
      fc.assert(
        fc.property(cookingSkillArbitrary, (cookingSkill) => {
          const preferences: UserPreferences = { cookingSkill }
          const prompt = buildSystemPrompt(preferences)

          // The cooking skill should appear in the prompt
          expect(prompt).toContain(cookingSkill)

          // The prompt should contain the "Skill" label
          expect(prompt).toContain('Skill')
        }),
        { numRuns: 100 }
      )
    })

    it('should include all preference types when all are provided', () => {
      fc.assert(
        fc.property(userPreferencesArbitrary, (preferences) => {
          const prompt = buildSystemPrompt(preferences)

          // Check allergies if provided
          if (preferences.allergies && preferences.allergies.length > 0) {
            for (const allergy of preferences.allergies) {
              expect(prompt).toContain(allergy)
            }
          }

          // Check dietary if provided
          if (preferences.dietary && preferences.dietary.length > 0) {
            for (const diet of preferences.dietary) {
              expect(prompt).toContain(diet)
            }
          }

          // Check cuisine preferences if provided
          if (preferences.cuisinePreferences && preferences.cuisinePreferences.length > 0) {
            for (const cuisine of preferences.cuisinePreferences) {
              expect(prompt).toContain(cuisine)
            }
          }

          // Check cooking skill if provided
          if (preferences.cookingSkill) {
            expect(prompt).toContain(preferences.cookingSkill)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should handle undefined preferences gracefully', () => {
      fc.assert(
        fc.property(fc.constant(undefined), () => {
          const prompt = buildSystemPrompt(undefined)

          // Should still return a valid prompt
          expect(prompt).toBeTruthy()
          expect(prompt).toContain('KitchenPal')
          expect(prompt).toContain('No specific preferences provided')
        }),
        { numRuns: 10 }
      )
    })

    it('should handle empty arrays gracefully', () => {
      const emptyPreferences: UserPreferences = {
        allergies: [],
        dietary: [],
        cuisinePreferences: [],
      }

      const prompt = buildSystemPrompt(emptyPreferences)

      // Should still return a valid prompt
      expect(prompt).toBeTruthy()
      expect(prompt).toContain('KitchenPal')
      expect(prompt).toContain('No specific preferences provided')
    })
  })


  /**
   * **Feature: gemini-ai-integration, Property 9: Conversation history inclusion**
   * **Validates: Requirements 5.1**
   *
   * *For any* non-empty conversation history, the formatted prompt should
   * include content from all previous messages in chronological order.
   */
  describe('Property 9: Conversation history inclusion', () => {
    it('should include content from all messages in the formatted history', () => {
      fc.assert(
        fc.property(
          fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 10 }),
          (messages) => {
            const formatted = formatConversationHistory(messages)

            // Every message content should appear in the formatted output
            for (const message of messages) {
              expect(formatted).toContain(message.content)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should format messages in chronological order', () => {
      // Generate messages with unique content to properly test ordering
      const uniqueContentMessageArbitrary = fc.integer({ min: 1, max: 1000 }).chain((seed) =>
        fc.record({
          id: fc.uuid(),
          role: messageRoleArbitrary,
          content: fc.constant(`Unique message content ${seed}-${Math.random()}`),
          timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        })
      )

      fc.assert(
        fc.property(
          fc.array(uniqueContentMessageArbitrary, { minLength: 2, maxLength: 5 }),
          (messages) => {
            const formatted = formatConversationHistory(messages)

            // Sort messages by timestamp
            const sortedMessages = [...messages].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )

            // Check that messages appear in chronological order by finding each unique content
            let lastIndex = -1
            for (const message of sortedMessages) {
              const currentIndex = formatted.indexOf(message.content)
              // Only check if content is found (it should be)
              if (currentIndex !== -1) {
                expect(currentIndex).toBeGreaterThan(lastIndex)
                lastIndex = currentIndex
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include role labels for each message', () => {
      fc.assert(
        fc.property(
          fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 5 }),
          (messages) => {
            const formatted = formatConversationHistory(messages)

            // Check that role labels are present
            for (const message of messages) {
              const expectedRole =
                message.role === 'user' ? 'User' : message.role === 'assistant' ? 'Assistant' : 'System'
              expect(formatted).toContain(expectedRole)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty string for empty message array', () => {
      const formatted = formatConversationHistory([])
      expect(formatted).toBe('')
    })

    it('should handle single message correctly', () => {
      fc.assert(
        fc.property(chatMessageArbitrary, (message) => {
          const formatted = formatConversationHistory([message])

          expect(formatted).toContain(message.content)
          const expectedRole =
            message.role === 'user' ? 'User' : message.role === 'assistant' ? 'Assistant' : 'System'
          expect(formatted).toContain(expectedRole)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: gemini-ai-integration, Property 10: Token limit enforcement**
   * **Validates: Requirements 5.2**
   *
   * *For any* conversation history, the formatted prompt length should
   * not exceed the configured maximum token limit.
   */
  describe('Property 10: Token limit enforcement', () => {
    it('should not exceed the configured token limit', () => {
      // Generate messages with varying content lengths
      const longContentArbitrary = fc.string({ minLength: 100, maxLength: 1000 })
      const longMessageArbitrary: fc.Arbitrary<ChatMessage> = fc.record({
        id: fc.uuid(),
        role: messageRoleArbitrary,
        content: longContentArbitrary,
        timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
      })

      fc.assert(
        fc.property(
          fc.array(longMessageArbitrary, { minLength: 5, maxLength: 20 }),
          fc.integer({ min: 256, max: 2048 }),
          (messages, maxTokens) => {
            const config = { maxTokens, charsPerToken: 4 }
            const formatted = formatConversationHistory(messages, config)

            // The formatted output should be within the token limit
            expect(isWithinTokenLimit(formatted, maxTokens, 4)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve recent messages when truncating', () => {
      // Create messages with predictable content for testing
      const createMessage = (index: number, timestamp: Date): ChatMessage => ({
        id: `msg-${index}`,
        role: 'user',
        content: `Message number ${index} with some content`,
        timestamp,
      })

      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 20 }),
          (messageCount) => {
            // Create messages with sequential timestamps
            const messages: ChatMessage[] = []
            const baseTime = new Date('2024-01-01').getTime()
            for (let i = 0; i < messageCount; i++) {
              messages.push(createMessage(i, new Date(baseTime + i * 60000)))
            }

            // Use a small token limit to force truncation
            const config = { maxTokens: 100, charsPerToken: 4 }
            const formatted = formatConversationHistory(messages, config)

            // The most recent message should always be included
            const lastMessage = messages[messages.length - 1]
            expect(formatted).toContain(lastMessage.content)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should add truncation indicator when messages are truncated', () => {
      // Create many long messages to force truncation
      const longMessages: ChatMessage[] = []
      const baseTime = new Date('2024-01-01').getTime()
      for (let i = 0; i < 50; i++) {
        longMessages.push({
          id: `msg-${i}`,
          role: 'user',
          content: `This is a long message number ${i} with lots of content to ensure we exceed the token limit. `.repeat(5),
          timestamp: new Date(baseTime + i * 60000),
        })
      }

      const config = { maxTokens: 256, charsPerToken: 4 }
      const formatted = formatConversationHistory(longMessages, config)

      // Should contain truncation indicator
      expect(formatted).toContain('[Earlier conversation truncated]')
    })

    it('should not add truncation indicator when all messages fit', () => {
      const shortMessages: ChatMessage[] = [
        { id: '1', role: 'user', content: 'Hi', timestamp: new Date('2024-01-01') },
        { id: '2', role: 'assistant', content: 'Hello!', timestamp: new Date('2024-01-02') },
      ]

      const config = { maxTokens: 2048, charsPerToken: 4 }
      const formatted = formatConversationHistory(shortMessages, config)

      // Should not contain truncation indicator
      expect(formatted).not.toContain('[Earlier conversation truncated]')
    })

    it('should correctly estimate token count', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          fc.integer({ min: 1, max: 10 }),
          (text, charsPerToken) => {
            const estimatedTokens = estimateTokenCount(text, charsPerToken)

            // Token count should be approximately text.length / charsPerToken
            const expectedTokens = Math.ceil(text.length / charsPerToken)
            expect(estimatedTokens).toBe(expectedTokens)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
