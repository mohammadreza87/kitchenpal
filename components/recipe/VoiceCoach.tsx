'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Instruction } from '@/types/chat'

export interface VoiceCoachProps {
  /** Recipe name for intro */
  recipeName: string
  /** Recipe instructions */
  instructions: Instruction[]
  /** Optional prep time for intro */
  prepTime?: string
  /** Optional cook time for intro */
  cookTime?: string
  /** Optional difficulty for intro */
  difficulty?: string
  /** Additional CSS classes */
  className?: string
}

type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

/**
 * VoiceCoach Component
 * Provides hands-free voice guidance through recipe steps using ElevenLabs
 * Requirements: Voice coaching for recipes, hands-free cooking assistance
 */
export function VoiceCoach({
  recipeName,
  instructions,
  prepTime,
  cookTime,
  difficulty,
  className,
}: VoiceCoachProps) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle')
  const [currentStep, setCurrentStep] = useState(0) // 0 = intro, 1+ = steps
  const [autoPlay, setAutoPlay] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sort instructions by step number
  const sortedInstructions = [...instructions].sort((a, b) => a.step - b.step)
  const totalSteps = sortedInstructions.length

  /**
   * Fetches audio from the voice API
   */
  const fetchAudio = useCallback(async (step: number): Promise<Blob | null> => {
    try {
      let requestBody: Record<string, unknown>

      if (step === 0) {
        // Recipe intro
        requestBody = {
          type: 'intro',
          recipeName,
          prepTime,
          cookTime,
          difficulty,
        }
      } else {
        // Recipe step
        const instruction = sortedInstructions[step - 1]
        requestBody = {
          type: 'step',
          stepNumber: step,
          stepText: instruction.text,
          totalSteps,
          encouragement: true,
        }
      }

      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate voice')
      }

      return await response.blob()
    } catch (err) {
      console.error('Voice fetch error:', err)
      return null
    }
  }, [recipeName, prepTime, cookTime, difficulty, sortedInstructions, totalSteps])

  /**
   * Plays audio for a specific step
   */
  const playStep = useCallback(async (step: number) => {
    setError(null)
    setPlaybackState('loading')
    setCurrentStep(step)

    const audioBlob = await fetchAudio(step)

    if (!audioBlob) {
      setError('Could not generate voice. Please try again.')
      setPlaybackState('error')
      return
    }

    // Create audio URL and play
    const audioUrl = URL.createObjectURL(audioBlob)

    if (audioRef.current) {
      audioRef.current.pause()
      URL.revokeObjectURL(audioRef.current.src)
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.onended = () => {
      setPlaybackState('idle')
      URL.revokeObjectURL(audioUrl)

      // Auto-play next step if enabled
      if (autoPlay && step < totalSteps) {
        setTimeout(() => playStep(step + 1), 1500) // Small delay between steps
      }
    }

    audio.onerror = () => {
      setError('Error playing audio')
      setPlaybackState('error')
      URL.revokeObjectURL(audioUrl)
    }

    try {
      await audio.play()
      setPlaybackState('playing')
    } catch {
      setError('Could not play audio. Please check your audio settings.')
      setPlaybackState('error')
    }
  }, [fetchAudio, autoPlay, totalSteps])

  /**
   * Toggles play/pause
   */
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return

    if (playbackState === 'playing') {
      audioRef.current.pause()
      setPlaybackState('paused')
    } else if (playbackState === 'paused') {
      audioRef.current.play()
      setPlaybackState('playing')
    }
  }, [playbackState])

  /**
   * Stops playback
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlaybackState('idle')
    setCurrentStep(0)
    setAutoPlay(false)
  }, [])

  /**
   * Starts the voice coach from the beginning
   */
  const startCoaching = useCallback(() => {
    setAutoPlay(true)
    playStep(0) // Start with intro
  }, [playStep])

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      playStep(currentStep + 1)
    }
  }, [currentStep, totalSteps, playStep])

  /**
   * Go to previous step
   */
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      playStep(currentStep - 1)
    }
  }, [currentStep, playStep])

  /**
   * Play a specific step directly
   */
  const goToStep = useCallback((step: number) => {
    playStep(step)
  }, [playStep])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
    }
  }, [])

  const isActive = playbackState === 'playing' || playbackState === 'paused' || playbackState === 'loading'

  return (
    <div className={cn('bg-surface rounded-2xl shadow-sm border border-outline/10', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-outline/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isActive ? 'bg-brand-primary' : 'bg-brand-primary/10'
            )}>
              <Image
                src="/assets/icons/Volume-High.svg"
                alt="Voice Coach"
                width={20}
                height={20}
                className={isActive ? 'brightness-0 invert' : 'opacity-60'}
              />
            </div>
            <div>
              <h3 className="text-label-lg font-semibold text-foreground">
                Voice Coach
              </h3>
              <p className="text-label-sm text-muted-foreground">
                {isActive
                  ? currentStep === 0
                    ? 'Playing introduction...'
                    : `Step ${currentStep} of ${totalSteps}`
                  : 'Hands-free cooking guidance'}
              </p>
            </div>
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={cn(
              'px-3 py-1.5 rounded-full text-label-sm font-medium transition-colors',
              autoPlay
                ? 'bg-brand-primary text-white'
                : 'bg-surface-variant text-muted-foreground hover:bg-surface-variant/80'
            )}
          >
            {autoPlay ? 'Auto-play On' : 'Auto-play Off'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-4">
        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-error/10 text-error text-label-sm">
            {error}
          </div>
        )}

        {/* Main controls */}
        <div className="flex items-center justify-center gap-3">
          {/* Previous */}
          <button
            onClick={prevStep}
            disabled={currentStep <= 0 || playbackState === 'loading'}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              currentStep <= 0 || playbackState === 'loading'
                ? 'bg-surface-variant/50 text-muted-foreground/50'
                : 'bg-surface-variant text-foreground hover:bg-surface-variant/80'
            )}
            aria-label="Previous step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
            </svg>
          </button>

          {/* Play/Pause/Start */}
          {!isActive ? (
            <button
              onClick={startCoaching}
              className="w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg hover:bg-brand-primary/90 transition-colors"
              aria-label="Start voice coaching"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          ) : playbackState === 'loading' ? (
            <button
              disabled
              className="w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg"
              aria-label="Loading"
            >
              <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={togglePlayPause}
              className="w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg hover:bg-brand-primary/90 transition-colors"
              aria-label={playbackState === 'playing' ? 'Pause' : 'Resume'}
            >
              {playbackState === 'playing' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          )}

          {/* Next */}
          <button
            onClick={nextStep}
            disabled={currentStep >= totalSteps || playbackState === 'loading'}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              currentStep >= totalSteps || playbackState === 'loading'
                ? 'bg-surface-variant/50 text-muted-foreground/50'
                : 'bg-surface-variant text-foreground hover:bg-surface-variant/80'
            )}
            aria-label="Next step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z"/>
            </svg>
          </button>

          {/* Stop */}
          {isActive && (
            <button
              onClick={stop}
              className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors"
              aria-label="Stop"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h12v12H6z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Step indicators */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {/* Intro indicator */}
          <button
            onClick={() => goToStep(0)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              currentStep === 0 && isActive
                ? 'w-6 bg-brand-primary'
                : 'bg-surface-variant hover:bg-brand-primary/30'
            )}
            aria-label="Go to introduction"
          />

          {/* Step indicators */}
          {sortedInstructions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index + 1)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentStep === index + 1 && isActive
                  ? 'w-6 bg-brand-primary'
                  : index + 1 < currentStep
                    ? 'bg-brand-primary/50'
                    : 'bg-surface-variant hover:bg-brand-primary/30'
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Current step text preview */}
        {isActive && currentStep > 0 && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-surface-variant/50">
            <p className="text-label-sm text-muted-foreground">
              {sortedInstructions[currentStep - 1]?.text}
            </p>
          </div>
        )}
      </div>

      {/* Quick step access */}
      <div className="px-4 pb-4">
        <p className="text-label-sm text-muted-foreground mb-2">Jump to step:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => goToStep(0)}
            className={cn(
              'px-3 py-1.5 rounded-full text-label-sm font-medium transition-colors',
              currentStep === 0 && isActive
                ? 'bg-brand-primary text-white'
                : 'bg-surface-variant text-foreground hover:bg-surface-variant/80'
            )}
          >
            Intro
          </button>
          {sortedInstructions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index + 1)}
              className={cn(
                'w-9 h-9 rounded-full text-label-sm font-medium transition-colors',
                currentStep === index + 1 && isActive
                  ? 'bg-brand-primary text-white'
                  : 'bg-surface-variant text-foreground hover:bg-surface-variant/80'
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
