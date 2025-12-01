'use client'

import { useState, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { QuickReply } from '@/types/chat'

export interface QuickRepliesProps {
  options: QuickReply[]
  onSelect: (reply: QuickReply) => void
  disabled?: boolean
  className?: string
}

/**
 * QuickReplies Component
 * Renders clickable buttons for quick reply options.
 * Disables all buttons after selection to prevent duplicate submissions.
 * Requirements: 2.1, 2.2, 2.3
 */
const QuickReplies = forwardRef<HTMLDivElement, QuickRepliesProps>(
  ({ options, onSelect, disabled = false, className }, ref) => {
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const handleSelect = (reply: QuickReply) => {
      if (disabled || selectedId) return
      setSelectedId(reply.id)
      onSelect(reply)
    }

    const isDisabled = disabled || selectedId !== null

    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-2', className)}
        role="group"
        aria-label="Quick reply options"
      >
        {options.map((reply) => (
          <button
            key={reply.id}
            type="button"
            onClick={() => handleSelect(reply)}
            disabled={isDisabled}
            className={cn(
              'rounded-full border px-4 py-2 text-body-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
              selectedId === reply.id
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-brand-primary/30 bg-white text-brand-primary hover:bg-brand-primary/5',
              isDisabled && selectedId !== reply.id && 'opacity-50 cursor-not-allowed'
            )}
            aria-pressed={selectedId === reply.id}
          >
            {reply.label}
          </button>
        ))}
      </div>
    )
  }
)

QuickReplies.displayName = 'QuickReplies'

export { QuickReplies }
