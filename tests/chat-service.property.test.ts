import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { ChatService } from '../lib/services/chat.service'
import {
  chatMessageFromRow,
  type ChatMessage,
  type ChatMessageRow,
  type MessageRole,
  type QuickReply,
  type RecipeOption,
} from '../types/chat'

/**
 * Property-Based Tests for Chat Service
 * Using fast-check library as specified in design document
 * Minimum 100 iterations per property test
 */

// Create a mock Supabase client for testing validateMessage (pure function)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSupabase = {} as any

// ============================================
// ARBITRARIES FOR PROPERTY TESTS
// ============================================

/**
 * Arbitrary for generating valid message roles
 */
const messageRoleArbitrary: fc.Arbitrary<MessageRole> = fc.constantFrom('user', 'assistant', 'system')

/**
 * Arbitrary for generating valid quick replies
 */
const quickReplyArbitrary: fc.Arbitrary<QuickReply> = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  value: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
})

/**
 * Arbitrary for generating valid recipe options
 */
const recipeOptionArbitrary: fc.Arbitrary<RecipeOption> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  selected: fc.option(fc.boolean(), { nil: undefined }),
})

/**
 * Arbitrary for generating valid ISO date strings
 * Using integer timestamps to avoid invalid date issues
 */
const isoDateStringArbitrary: fc.Arbitrary<string> = fc.integer({
  min: new Date('2020-01-01T00:00:00.000Z').getTime(),
  max: new Date('2030-01-01T00:00:00.000Z').getTime(),
}).map(timestamp => new Date(timestamp).toISOString())

/**
 * Arbitrary for generating valid chat message rows (as stored in database)
 */
const chatMessageRowArbitrary: fc.Arbitrary<ChatMessageRow> = fc.record({
  id: fc.uuid(),
  conversation_id: fc.uuid(),
  role: messageRoleArbitrary,
  content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  metadata: fc.record({
    quickReplies: fc.option(fc.array(quickReplyArbitrary, { minLength: 0, maxLength: 5 }), { nil: undefined }),
    recipeOptions: fc.option(fc.array(recipeOptionArbitrary, { minLength: 0, maxLength: 5 }), { nil: undefined }),
  }),
  created_at: isoDateStringArbitrary,
})

/**
 * Arbitrary for generating a list of chat message rows with consistent conversation_id
 * and sequential timestamps (to simulate real conversation flow)
 */
const conversationMessagesArbitrary = (conversationId: string): fc.Arbitrary<ChatMessageRow[]> =>
  fc.array(chatMessageRowArbitrary, { minLength: 1, maxLength: 20 })
    .map(messages => {
      // Ensure all messages have the same conversation_id
      // and timestamps are in ascending order
      const baseTime = new Date('2024-01-01').getTime()
      return messages.map((msg, index) => ({
        ...msg,
        conversation_id: conversationId,
        created_at: new Date(baseTime + index * 60000).toISOString(), // 1 minute apart
      }))
    })

describe('ChatService Property Tests', () => {
  /**
   * **Feature: ai-chat, Property 2: Empty message rejection**
   * **Validates: Requirements 1.3**
   * 
   * *For any* string composed entirely of whitespace characters,
   * attempting to submit should be rejected and the message list should remain unchanged.
   */
  describe('Property 2: Empty message rejection', () => {
    const chatService = new ChatService(mockSupabase)

    it('should reject any string composed entirely of whitespace characters', () => {
      // Generate strings that are either empty or contain only whitespace
      const whitespaceChars = [' ', '\t', '\n', '\r', '\f', '\v']
      const whitespaceOnlyArbitrary = fc.array(
        fc.constantFrom(...whitespaceChars),
        { minLength: 0, maxLength: 50 }
      ).map(chars => chars.join(''))

      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (whitespaceString) => {
          // validateMessage should return false for whitespace-only strings
          const isValid = chatService.validateMessage(whitespaceString)
          expect(isValid).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('should accept any string with at least one non-whitespace character', () => {
      // Generate strings that contain at least one non-whitespace character
      const nonWhitespaceArbitrary = fc.string({ minLength: 1 }).filter(
        (s) => s.trim().length > 0
      )

      fc.assert(
        fc.property(nonWhitespaceArbitrary, (validString) => {
          // validateMessage should return true for strings with non-whitespace content
          const isValid = chatService.validateMessage(validString)
          expect(isValid).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should handle mixed whitespace and content correctly', () => {
      // Generate strings with leading/trailing whitespace but valid content
      const whitespaceChars = [' ', '\t', '\n']
      const whitespaceArbitrary = fc.array(
        fc.constantFrom(...whitespaceChars),
        { minLength: 0, maxLength: 10 }
      ).map(chars => chars.join(''))

      const mixedArbitrary = fc.tuple(
        whitespaceArbitrary, // leading whitespace
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0), // content
        whitespaceArbitrary  // trailing whitespace
      ).map(([leading, content, trailing]) => leading + content + trailing)

      fc.assert(
        fc.property(mixedArbitrary, (mixedString) => {
          // Should accept strings that have content even with surrounding whitespace
          const isValid = chatService.validateMessage(mixedString)
          expect(isValid).toBe(true)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: ai-chat, Property 7: Message persistence across sessions**
   * **Validates: Requirements 6.2**
   * 
   * *For any* conversation with messages, when the conversation is reloaded,
   * all previously sent messages should be restored in the same order.
   * 
   * This property tests the transformation layer (chatMessageFromRow) which is
   * the core logic for message persistence. The actual database operations are
   * tested via integration tests, but the transformation must preserve:
   * 1. Message order (based on created_at timestamps)
   * 2. Message content integrity
   * 3. Message metadata (quickReplies, recipeOptions)
   */
  describe('Property 7: Message persistence across sessions', () => {
    it('should preserve message order when transforming from database rows', () => {
      const conversationId = 'test-conversation-id'
      
      fc.assert(
        fc.property(conversationMessagesArbitrary(conversationId), (messageRows) => {
          // Transform rows to ChatMessage objects (simulating load from database)
          const messages: ChatMessage[] = messageRows.map(row => chatMessageFromRow(row))
          
          // Verify order is preserved (messages should be in same order as input)
          for (let i = 0; i < messages.length; i++) {
            expect(messages[i].id).toBe(messageRows[i].id)
          }
          
          // Verify timestamps are in ascending order (as they would be from DB query)
          for (let i = 1; i < messages.length; i++) {
            const prevTime = messages[i - 1].timestamp.getTime()
            const currTime = messages[i].timestamp.getTime()
            expect(currTime).toBeGreaterThanOrEqual(prevTime)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should preserve message content when transforming from database rows', () => {
      fc.assert(
        fc.property(chatMessageRowArbitrary, (messageRow) => {
          // Transform row to ChatMessage
          const message = chatMessageFromRow(messageRow)
          
          // Verify content is preserved exactly
          expect(message.id).toBe(messageRow.id)
          expect(message.role).toBe(messageRow.role)
          expect(message.content).toBe(messageRow.content)
          expect(message.timestamp.toISOString()).toBe(messageRow.created_at)
        }),
        { numRuns: 100 }
      )
    })

    it('should preserve message metadata (quickReplies) when transforming from database rows', () => {
      // Generate messages that specifically have quickReplies
      const messageWithQuickRepliesArbitrary = chatMessageRowArbitrary.map(row => ({
        ...row,
        metadata: {
          ...row.metadata,
          quickReplies: row.metadata.quickReplies || [],
        },
      }))

      fc.assert(
        fc.property(messageWithQuickRepliesArbitrary, (messageRow) => {
          const message = chatMessageFromRow(messageRow)
          
          // Verify quickReplies are preserved
          if (messageRow.metadata.quickReplies && messageRow.metadata.quickReplies.length > 0) {
            expect(message.quickReplies).toBeDefined()
            expect(message.quickReplies).toHaveLength(messageRow.metadata.quickReplies.length)
            
            // Verify each quick reply is preserved
            messageRow.metadata.quickReplies.forEach((qr, index) => {
              expect(message.quickReplies![index].id).toBe(qr.id)
              expect(message.quickReplies![index].label).toBe(qr.label)
              expect(message.quickReplies![index].value).toBe(qr.value)
            })
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should preserve message metadata (recipeOptions) when transforming from database rows', () => {
      // Generate messages that specifically have recipeOptions
      const messageWithRecipeOptionsArbitrary = chatMessageRowArbitrary.map(row => ({
        ...row,
        metadata: {
          ...row.metadata,
          recipeOptions: row.metadata.recipeOptions || [],
        },
      }))

      fc.assert(
        fc.property(messageWithRecipeOptionsArbitrary, (messageRow) => {
          const message = chatMessageFromRow(messageRow)
          
          // Verify recipeOptions are preserved
          if (messageRow.metadata.recipeOptions && messageRow.metadata.recipeOptions.length > 0) {
            expect(message.recipeOptions).toBeDefined()
            expect(message.recipeOptions).toHaveLength(messageRow.metadata.recipeOptions.length)
            
            // Verify each recipe option is preserved
            messageRow.metadata.recipeOptions.forEach((ro, index) => {
              expect(message.recipeOptions![index].id).toBe(ro.id)
              expect(message.recipeOptions![index].name).toBe(ro.name)
              expect(message.recipeOptions![index].selected).toBe(ro.selected)
            })
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should maintain message count after transformation (no messages lost)', () => {
      const conversationId = 'test-conversation-id'
      
      fc.assert(
        fc.property(conversationMessagesArbitrary(conversationId), (messageRows) => {
          // Transform all rows
          const messages = messageRows.map(row => chatMessageFromRow(row))
          
          // Verify no messages are lost
          expect(messages.length).toBe(messageRows.length)
        }),
        { numRuns: 100 }
      )
    })
  })
})
