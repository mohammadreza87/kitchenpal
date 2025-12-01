'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Instruction } from '@/types/chat'

export interface InstructionsTabProps {
  instructions: Instruction[]
  className?: string
}

/**
 * InstructionsTab Component
 * Displays numbered step list with highlighted duration text
 * Requirements: 11.1 (numbered steps), 11.2 (readable text), 11.3 (time highlighting)
 */
export function InstructionsTab({
  instructions,
  className,
}: InstructionsTabProps) {
  // Sort instructions by step number
  const sortedInstructions = [...instructions].sort((a, b) => a.step - b.step)

  return (
    <div
      role="tabpanel"
      id="instructions-panel"
      aria-labelledby="instructions-tab"
      className={cn('px-5 py-4', className)}
    >
      {/* Instructions List */}
      <ol className="space-y-4">
        {sortedInstructions.map((instruction) => (
          <li
            key={instruction.id || instruction.step}
            className="flex gap-4"
          >
            {/* Step Number */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-white text-body-md font-semibold">
              {instruction.step}
            </div>

            {/* Step Content */}
            <div className="flex-1 pt-1">
              {/* Duration Badge (if present) */}
              {instruction.duration && (
                <span className="inline-flex items-center gap-1 mb-2 px-2 py-1 rounded-full bg-brand-secondary-container text-brand-secondary-on-container text-label-sm font-medium">
                  <Image
                    src="/assets/icons/Clock.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="opacity-80"
                  />
                  {instruction.duration}
                </span>
              )}

              {/* Step Text with highlighted time */}
              <p className="text-body-md text-foreground leading-relaxed">
                {highlightDuration(instruction.text)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* Empty State */}
      {instructions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Image
            src="/assets/icons/Document-Text.svg"
            alt=""
            width={48}
            height={48}
            className="opacity-30"
          />
          <p className="mt-3 text-body-md text-muted-foreground">
            No instructions available
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Highlight time/duration mentions in instruction text
 * Matches patterns like "5 minutes", "30 seconds", "1 hour", "2-3 mins"
 * Requirements: 11.3 - Highlight time prominently
 */
function highlightDuration(text: string): React.ReactNode {
  // Regex to match time patterns
  const timePattern = /(\d+(?:-\d+)?)\s*(minutes?|mins?|seconds?|secs?|hours?|hrs?)/gi

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset regex state
  timePattern.lastIndex = 0

  while ((match = timePattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Add highlighted time
    parts.push(
      <span
        key={match.index}
        className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-brand-secondary-container text-brand-secondary-on-container font-medium"
      >
        {match[0]}
      </span>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  // If no matches found, return original text
  if (parts.length === 0) {
    return text
  }

  return <>{parts}</>
}
