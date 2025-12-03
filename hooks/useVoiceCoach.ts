'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface VoiceCoachOptions {
  recipeName: string
  prepTime?: string
  cookTime?: string
  difficulty?: string
  autoAdvance?: boolean
  onStepChange?: (step: number) => void
  onError?: (error: string) => void
}

export interface VoiceCoachState {
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  currentStep: number
  error: string | null
}

export interface VoiceCoachActions {
  playIntro: () => Promise<void>
  playStep: (stepNumber: number, stepText: string, totalSteps: number) => Promise<void>
  playIngredients: (ingredients: Array<{ name: string; quantity: number; unit: string }>) => Promise<void>
  playCustomText: (text: string) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
}

/**
 * useVoiceCoach Hook
 * Provides voice coaching functionality for recipes using ElevenLabs
 */
export function useVoiceCoach(options: VoiceCoachOptions): [VoiceCoachState, VoiceCoachActions] {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const { recipeName, prepTime, cookTime, difficulty, onStepChange, onError } = options

  /**
   * Fetches and plays audio from the voice API
   */
  const fetchAndPlayAudio = useCallback(async (
    requestBody: Record<string, unknown>
  ): Promise<boolean> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate voice')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      return new Promise((resolve) => {
        audio.onended = () => {
          setIsPlaying(false)
          setIsPaused(false)
          URL.revokeObjectURL(audioUrl)
          resolve(true)
        }

        audio.onerror = () => {
          const errorMsg = 'Error playing audio'
          setError(errorMsg)
          onError?.(errorMsg)
          setIsPlaying(false)
          setIsLoading(false)
          URL.revokeObjectURL(audioUrl)
          resolve(false)
        }

        audio.onplay = () => {
          setIsLoading(false)
          setIsPlaying(true)
          setIsPaused(false)
        }

        audio.play().catch((err) => {
          const errorMsg = 'Could not play audio. Please check your audio settings.'
          setError(errorMsg)
          onError?.(errorMsg)
          setIsPlaying(false)
          setIsLoading(false)
          resolve(false)
        })
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return false
      }

      const errorMsg = (err as Error).message || 'Voice generation failed'
      setError(errorMsg)
      onError?.(errorMsg)
      setIsLoading(false)
      return false
    }
  }, [onError])

  /**
   * Play recipe introduction
   */
  const playIntro = useCallback(async () => {
    setCurrentStep(0)
    onStepChange?.(0)

    await fetchAndPlayAudio({
      type: 'intro',
      recipeName,
      prepTime,
      cookTime,
      difficulty,
    })
  }, [fetchAndPlayAudio, recipeName, prepTime, cookTime, difficulty, onStepChange])

  /**
   * Play a specific recipe step
   */
  const playStep = useCallback(async (
    stepNumber: number,
    stepText: string,
    totalSteps: number
  ) => {
    setCurrentStep(stepNumber)
    onStepChange?.(stepNumber)

    await fetchAndPlayAudio({
      type: 'step',
      stepNumber,
      stepText,
      totalSteps,
      encouragement: true,
    })
  }, [fetchAndPlayAudio, onStepChange])

  /**
   * Play ingredients summary
   */
  const playIngredients = useCallback(async (
    ingredients: Array<{ name: string; quantity: number; unit: string }>
  ) => {
    await fetchAndPlayAudio({
      type: 'ingredients',
      ingredients,
    })
  }, [fetchAndPlayAudio])

  /**
   * Play custom text
   */
  const playCustomText = useCallback(async (text: string) => {
    await fetchAndPlayAudio({
      type: 'custom',
      text,
    })
  }, [fetchAndPlayAudio])

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      setIsPaused(true)
    }
  }, [isPlaying])

  /**
   * Resume playback
   */
  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play()
      setIsPlaying(true)
      setIsPaused(false)
    }
  }, [isPaused])

  /**
   * Stop playback
   */
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      URL.revokeObjectURL(audioRef.current.src)
      audioRef.current = null
    }

    setIsPlaying(false)
    setIsPaused(false)
    setIsLoading(false)
    setCurrentStep(0)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
    }
  }, [])

  const state: VoiceCoachState = {
    isPlaying,
    isPaused,
    isLoading,
    currentStep,
    error,
  }

  const actions: VoiceCoachActions = {
    playIntro,
    playStep,
    playIngredients,
    playCustomText,
    pause,
    resume,
    stop,
  }

  return [state, actions]
}
