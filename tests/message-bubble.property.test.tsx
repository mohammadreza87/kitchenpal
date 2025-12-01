import { describe, it, expect, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, screen, cleanup } from '@testing-library/react'
import { MessageBubble } from '../components/chat/MessageBubble'
import type { ChatMessage, MessageRole } from '../types/chat'

// Ensure cleanup after each test
afterEach(() => {
  cleanup()
})

/**
 * Property-Based Tests for MessageBubble Component
 * Using fast-check library as specified in design document
 * Minimum 100 iterations per property test
 */

// ============================================
// ARBITRARIES FOR PROPERTY TESTS
// ============================================

/**
 * Arbitrary for generating valid message roles
 */
const messageRoleArbitrary: fc.Arbitrary<MessageRole> = fc.constantFrom('user', 'assistant', 'system')

/**
 * Arbitrary for generating valid timestamps
 */
const timestampArbitrary: fc.Arbitrary<Date> = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-01-01').getTime(),
}).map(timestamp => new Date(timestamp))

/**
 * Arbitrary for generating valid chat messages
 */
const chatMessageArbitrary: fc.Arbitrary<ChatMessage> = fc.record({
  id: fc.uuid(),
  role: messageRoleArbitrary,
  content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  timestamp: timestampArbitrary,
  quickReplies: fc.constant(undefined),
  recipeOptions: fc.constant(undefined),
  recipeCard: fc.constant(undefined),
})

/**
 * Arbitrary for generating user messages specifically
 */
const userMessageArbitrary: fc.Arbitrary<ChatMessage> = chatMessageArbitrary.map(msg => ({
  ...msg,
  role: 'user' as MessageRole,
}))

/**
 * Arbitrary for generating assistant messages specifically
 */
const assistantMessageArbitrary: fc.Arbitrary<ChatMessage> = chatMessageArbitrary.map(msg => ({
  ...msg,
  role: 'assistant' as MessageRole,
}))

describe('MessageBubble Property Tests', () => {
  /**
   * **Feature: ai-chat, Property 6: Message alignment based on role**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * *For any* message, if the role is 'user' then the message should be right-aligned,
   * and if the role is 'assistant' then the message should be left-aligned with an avatar present.
   */
  describe('Property 6: Message alignment based on role', () => {
    it('should right-align user messages (justify-end class)', () => {
      fc.assert(
        fc.property(userMessageArbitrary, (message) => {
          const { container } = render(<MessageBubble message={message} />)
          
          // Find the outer container div with data-role attribute
          const messageContainer = container.querySelector('[data-role="user"]')
          expect(messageContainer).not.toBeNull()
          
          // Verify it has justify-end class for right alignment
          expect(messageContainer?.classList.contains('justify-end')).toBe(true)
          expect(messageContainer?.classList.contains('justify-start')).toBe(false)
          
          // Clean up
          container.remove()
        }),
        { numRuns: 100 }
      )
    })

    it('should left-align assistant messages (justify-start class)', () => {
      fc.assert(
        fc.property(assistantMessageArbitrary, (message) => {
          const { container } = render(<MessageBubble message={message} />)
          
          // Find the outer container div with data-role attribute
          const messageContainer = container.querySelector('[data-role="assistant"]')
          expect(messageContainer).not.toBeNull()
          
          // Verify it has justify-start class for left alignment
          expect(messageContainer?.classList.contains('justify-start')).toBe(true)
          expect(messageContainer?.classList.contains('justify-end')).toBe(false)
          
          // Clean up
          container.remove()
        }),
        { numRuns: 100 }
      )
    })

    it('should display avatar only for assistant messages', () => {
      fc.assert(
        fc.property(assistantMessageArbitrary, (message) => {
          const { unmount } = render(<MessageBubble message={message} />)
          
          // Avatar should be present for assistant messages
          const avatar = screen.getByAltText('AI Assistant')
          expect(avatar).toBeDefined()
          
          // Clean up after each iteration
          unmount()
        }),
        { numRuns: 100 }
      )
    })

    it('should NOT display avatar for user messages', () => {
      fc.assert(
        fc.property(userMessageArbitrary, (message) => {
          const { unmount } = render(<MessageBubble message={message} />)
          
          // Avatar should NOT be present for user messages
          const avatar = screen.queryByAltText('AI Assistant')
          expect(avatar).toBeNull()
          
          // Clean up after each iteration
          unmount()
        }),
        { numRuns: 100 }
      )
    })

    it('should apply correct alignment based on any role', () => {
      fc.assert(
        fc.property(chatMessageArbitrary, (message) => {
          const { container } = render(<MessageBubble message={message} />)
          
          const messageContainer = container.querySelector(`[data-role="${message.role}"]`)
          expect(messageContainer).not.toBeNull()
          
          if (message.role === 'user') {
            // User messages should be right-aligned
            expect(messageContainer?.classList.contains('justify-end')).toBe(true)
          } else {
            // Assistant and system messages should be left-aligned
            expect(messageContainer?.classList.contains('justify-start')).toBe(true)
          }
          
          // Clean up
          container.remove()
        }),
        { numRuns: 100 }
      )
    })
  })
})
