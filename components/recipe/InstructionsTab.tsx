'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Instruction } from '@/types/chat'

export interface InstructionsTabProps {
  instructions: Instruction[]
  recipeName?: string
  className?: string
}

type PlayingState = {
  stepNumber: number
  isLoading: boolean
  isPlaying: boolean
}

/**
 * InstructionsTab Component
 * Displays numbered step list with highlighted duration text and voice coaching
 * Requirements: 11.1 (numbered steps), 11.2 (readable text), 11.3 (time highlighting)
 */
export function InstructionsTab({
  instructions,
  recipeName,
  className,
}: InstructionsTabProps) {
  const [playingState, setPlayingState] = useState<PlayingState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sort instructions by step number
  const sortedInstructions = [...instructions].sort((a, b) => a.step - b.step)
  const totalSteps = sortedInstructions.length

  /**
   * Play voice coaching for a specific step
   */
  const playCoaching = useCallback(async (stepNumber: number, stepText: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setError(null)
    setPlayingState({ stepNumber, isLoading: true, isPlaying: false })

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'coach',
          stepNumber,
          stepText,
          totalSteps,
          recipeName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate voice')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setPlayingState(null)
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
      }

      audio.onerror = () => {
        setError('Error playing audio')
        setPlayingState(null)
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
      }

      await audio.play()
      setPlayingState({ stepNumber, isLoading: false, isPlaying: true })
    } catch (err) {
      setError((err as Error).message || 'Voice coaching unavailable')
      setPlayingState(null)
    }
  }, [totalSteps, recipeName])

  /**
   * Stop the currently playing audio
   */
  const stopPlaying = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPlayingState(null)
  }, [])

  return (
    <div
      role="tabpanel"
      id="instructions-panel"
      aria-labelledby="instructions-tab"
      className={cn('px-5 py-4', className)}
    >
      {/* Error message */}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-error/10 text-error text-label-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-error hover:text-error/80">
            ✕
          </button>
        </div>
      )}

      {/* Instructions List */}
      <ol className="space-y-4">
        {sortedInstructions.map((instruction) => {
          const isThisStepPlaying = playingState?.stepNumber === instruction.step
          const isLoading = isThisStepPlaying && playingState?.isLoading
          const isPlaying = isThisStepPlaying && playingState?.isPlaying

          return (
            <li
              key={instruction.id || instruction.step}
              className={cn(
                'flex gap-4 p-3 -mx-3 rounded-xl transition-colors',
                isPlaying && 'bg-brand-primary/5 ring-1 ring-brand-primary/20'
              )}
            >
              {/* Step Number */}
              <div className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-body-md font-semibold transition-colors',
                isPlaying ? 'bg-brand-primary text-white animate-pulse' : 'bg-brand-primary text-white'
              )}>
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

              {/* Voice Coach Button */}
              <button
                onClick={() => {
                  if (isPlaying) {
                    stopPlaying()
                  } else {
                    playCoaching(instruction.step, instruction.text)
                  }
                }}
                disabled={isLoading}
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  isPlaying
                    ? 'bg-brand-primary text-white shadow-lg scale-110'
                    : isLoading
                      ? 'bg-brand-primary/20 text-brand-primary'
                      : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-md'
                )}
                aria-label={isPlaying ? 'Stop coaching' : 'Play voice coaching for this step'}
                title={isPlaying ? 'Stop' : 'Coach me through this step'}
              >
                {isLoading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                ) : isPlaying ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1"/>
                    <rect x="14" y="5" width="4" height="14" rx="1"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>
            </li>
          )
        })}
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
