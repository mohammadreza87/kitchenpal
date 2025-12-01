'use client'

import { forwardRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface TypingIndicatorProps {
  className?: string
}

/**
 * TypingIndicator Component
 * Animated three-dot indicator shown when AI is processing a response.
 * Requirements: 8.1, 8.2
 */
const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex w-full gap-3 justify-start', className)}
        role="status"
        aria-label="AI is typing"
      >
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10">
            <Image
              src="/assets/icons/Chef's Hat.svg"
              alt="AI Assistant"
              width={24}
              height={24}
              className="opacity-80"
            />
          </div>
        </div>

        {/* Typing dots */}
        <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
          <span
            className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '600ms' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce"
            style={{ animationDelay: '150ms', animationDuration: '600ms' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce"
            style={{ animationDelay: '300ms', animationDuration: '600ms' }}
          />
        </div>
      </div>
    )
  }
)

TypingIndicator.displayName = 'TypingIndicator'

export { TypingIndicator }
