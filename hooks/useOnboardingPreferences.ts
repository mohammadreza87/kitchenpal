'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createPreferencesService } from '@/lib/services/preferences.service'
import { useUser } from './useUser'

interface OnboardingState {
  dietary: string[]
  cuisine: string[]
  allergies: string[]
  cookingSkill: string | null
}

const STORAGE_KEY = 'kitchenpal_onboarding_preferences'

export function useOnboardingPreferences() {
  const { user } = useUser()
  const [state, setState] = useState<OnboardingState>({
    dietary: [],
    cuisine: [],
    allergies: [],
    cookingSkill: null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const preferencesService = useMemo(() => createPreferencesService(supabase), [supabase])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState(parsed)
      } catch (e) {
        console.error('Failed to parse saved preferences:', e)
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Toggle dietary preference
  const toggleDietary = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      dietary: prev.dietary.includes(id)
        ? prev.dietary.filter(d => d !== id)
        : [...prev.dietary, id]
    }))
  }, [])

  // Toggle cuisine preference
  const toggleCuisine = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(id)
        ? prev.cuisine.filter(c => c !== id)
        : [...prev.cuisine, id]
    }))
  }, [])

  // Toggle allergy
  const toggleAllergy = useCallback((item: string) => {
    setState(prev => ({
      ...prev,
      allergies: prev.allergies.includes(item)
        ? prev.allergies.filter(a => a !== item)
        : [...prev.allergies, item]
    }))
  }, [])

  // Set cooking skill
  const setCookingSkill = useCallback((skill: string) => {
    setState(prev => ({
      ...prev,
      cookingSkill: skill
    }))
  }, [])

  // Save all preferences to database
  const saveToDatabase = useCallback(async () => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    setSaving(true)
    setError(null)

    try {
      await preferencesService.updatePreferences(user.id, {
        dietary: state.dietary,
        cuisine: state.cuisine,
        allergies: state.allergies,
        cooking_skill: state.cookingSkill || 'Beginner',
      })

      // Clear localStorage after successful save
      localStorage.removeItem(STORAGE_KEY)

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save preferences')
      setError(error)
      throw error
    } finally {
      setSaving(false)
    }
  }, [user?.id, state, preferencesService])

  // Reset state
  const reset = useCallback(() => {
    setState({
      dietary: [],
      cuisine: [],
      allergies: [],
      cookingSkill: null,
    })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    // State
    dietary: state.dietary,
    cuisine: state.cuisine,
    allergies: state.allergies,
    cookingSkill: state.cookingSkill,

    // Actions
    toggleDietary,
    toggleCuisine,
    toggleAllergy,
    setCookingSkill,
    saveToDatabase,
    reset,

    // Status
    saving,
    error,
    isAuthenticated: !!user,
  }
}
