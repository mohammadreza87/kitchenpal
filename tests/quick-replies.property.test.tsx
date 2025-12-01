import { describe, it, expect, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, screen, cleanup } from '@testing-library/react'
import { QuickReplies } from '../components/chat/QuickReplies'
import type { QuickReply } from '../types/chat'

// Ensure cleanup after each test
afterEach(() => {
  cleanup()
})

/**
 * Property-Based Tests for QuickReplies Component
 * Using fast-check library as specified in design document
 * Minimum 100 iterations per property test
 */

// ============================================
// ARBITRARIES FOR PROPERTY TESTS
// ============================================

/**
 * Arbitrary for generating valid quick reply options
 */
const quickReplyArbitrary: fc.Arbitrary<QuickReply> = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  value: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
})

/**
 * Arbitrary for generating arrays of quick reply options (1-10 options)
 */
const quickRepliesArrayArbitrary: fc.Arbitrary<QuickReply[]> = fc.array(quickReplyArbitrary, {
  minLength: 1,
  maxLength: 10,
}).filter(arr => {
  // Ensure unique IDs
  const ids = arr.map(r => r.id)
  return new Set(ids).size === ids.length
})

describe('QuickReplies Property Tests', () => {
  /**
   * **Feature: ai-chat, Property 3: Quick replies render for messages with options**
   * **Validates: Requirements 2.1**
   * 
   * *For any* AI message containing quick reply options, the rendered output should
   * contain exactly as many clickable buttons as there are quick reply options.
   */
  describe('Property 3: Quick replies render for messages with options', () => {
    it('should render exactly as many buttons as there are quick reply options', () => {
      fc.assert(
        fc.property(quickRepliesArrayArbitrary, (options) => {
          const mockOnSelect = vi.fn()
          const { container } = render(
            <QuickReplies options={options} onSelect={mockOnSelect} />
          )
          
          // Find all buttons in the component
          const buttons = container.querySelectorAll('button')
          
          // Verify the count matches exactly
          expect(buttons.length).toBe(options.length)
          
          // Clean up
          container.remove()
        }),
        { numRuns: 100 }
      )
    })

    it('should render each quick reply option as a clickable button', () => {
      fc.assert(
        fc.property(quickRepliesArrayArbitrary, (options) => {
          const mockOnSelect = vi.fn()
          const { container } = render(
            <QuickReplies options={options} onSelect={mockOnSelect} />
          )
          
          const buttons = container.querySelectorAll('button')
          
          // Each button should be of type "button" (clickable)
          buttons.forEach((button) => {
            expect(button.getAttribute('type')).toBe('button')
          })
          
          // Clean up
          container.remove()
        }),
        { numRuns: 100 }
      )
    })

    it('should display the label text for each quick reply option', () => {
      fc.assert(
        fc.property(quickRepliesArrayArbitrary, (options) => {
          const mockOnSelect = vi.fn()
          const { container } = render(
            <QuickReplies options={options} onSelect={mockOnSelect} />
          )
          
          // Each option's label should be visible in the rendered output
          options.forEach((option) => {
            const buttonWithLabel = Array.from(container.querySelectorAll('button'))
              .find(btn => btn.textContent === option.label)
            expect(buttonWithLabel).toBeDefined()
          })
          
          // Clean up
          container.remove()
        }),
        { numRuns: 100 }
      )
    })

    it('should render buttons that are initially enabled (not disabled)', () => {
      fc.assert(
        fc.property(quickRepliesArrayArbitrary, (options) => {
          const mockOnSelect = vi.fn()
          const { container } = render(
            <QuickReplies options={options} onSelect={mockOnSelect} disabled={false} />
          )
          
          const buttons = container.querySelectorAll('button')
          
          // All buttons should be enabled initially
          buttons.forEach((button) => {
            expect(button.disabled).toBe(false)
          })
          
          // Clean up
          container.remove()
        }),
        { numRuns: 100 }
      )
    })

    it('should have accessible role group for quick reply options', () => {
      fc.assert(
        fc.property(quickRepliesArrayArbitrary, (options) => {
          const mockOnSelect = vi.fn()
          const { container } = render(
            <QuickReplies options={options} onSelect={mockOnSelect} />
          )
          
          // The container should have role="group" for accessibility
          const group = container.querySelector('[role="group"]')
          expect(group).not.toBeNull()
          expect(group?.getAttribute('aria-label')).toBe('Quick reply options')
          
          // Clean up
          container.remove()
        }),
        { numRuns: 100 }
      )
    })
  })
})
