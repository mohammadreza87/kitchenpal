'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createPreferencesService } from '@/lib/services/preferences.service'
import { useUser } from './useUser'
import type { UserPreferences, UserPreferencesUpdate } from '@/types/database'

export function usePreferences() {
  const { user, loading: userLoading } = useUser()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const preferencesService = useMemo(() => createPreferencesService(supabase), [supabase])

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const data = await preferencesService.getPreferences(user.id)
      setPreferences(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch preferences'))
    } finally {
      setLoading(false)
    }
  }, [user?.id, preferencesService])

  // Initial fetch
  useEffect(() => {
    if (!userLoading && user?.id) {
      fetchPreferences()
    } else if (!userLoading && !user) {
      setLoading(false)
    }
  }, [user?.id, userLoading, fetchPreferences])

  // Update preferences
  const updatePreferences = useCallback(async (updates: UserPreferencesUpdate) => {
    if (!user?.id) throw new Error('Not authenticated')

    // Optimistic update
    setPreferences(prev => prev ? { ...prev, ...updates } : null)

    try {
      const updated = await preferencesService.updatePreferences(user.id, updates)
      setPreferences(updated)
      return updated
    } catch (err) {
      await fetchPreferences()
      throw err
    }
  }, [user?.id, preferencesService, fetchPreferences])

  // Toggle dietary preference
  const toggleDietary = useCallback(async (preference: string) => {
    if (!user?.id || !preferences) return

    const isSelected = preferences.dietary.includes(preference)
    const updated = isSelected
      ? await preferencesService.removeDietaryPreference(user.id, preference)
      : await preferencesService.addDietaryPreference(user.id, preference)

    if (updated) setPreferences(updated)
    return updated
  }, [user?.id, preferences, preferencesService])

  // Toggle cuisine preference
  const toggleCuisine = useCallback(async (cuisine: string) => {
    if (!user?.id || !preferences) return

    const isSelected = preferences.cuisine.includes(cuisine)
    const updated = isSelected
      ? await preferencesService.removeCuisinePreference(user.id, cuisine)
      : await preferencesService.addCuisinePreference(user.id, cuisine)

    if (updated) setPreferences(updated)
    return updated
  }, [user?.id, preferences, preferencesService])

  // Toggle allergy
  const toggleAllergy = useCallback(async (allergy: string) => {
    if (!user?.id || !preferences) return

    const isSelected = preferences.allergies.includes(allergy)
    const updated = isSelected
      ? await preferencesService.removeAllergy(user.id, allergy)
      : await preferencesService.addAllergy(user.id, allergy)

    if (updated) setPreferences(updated)
    return updated
  }, [user?.id, preferences, preferencesService])

  // Set cooking skill
  const setCookingSkill = useCallback(async (skill: string) => {
    if (!user?.id) return

    const updated = await preferencesService.setCookingSkill(user.id, skill)
    if (updated) setPreferences(updated)
    return updated
  }, [user?.id, preferencesService])

  return {
    preferences,
    loading: userLoading || loading,
    error,
    updatePreferences,
    toggleDietary,
    toggleCuisine,
    toggleAllergy,
    setCookingSkill,
    refetch: fetchPreferences,
  }
}
