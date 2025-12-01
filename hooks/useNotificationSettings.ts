'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createNotificationsService } from '@/lib/services/notifications.service'
import { useUser } from './useUser'
import type { NotificationSettings } from '@/types/database'

export function useNotificationSettings() {
  const { user, loading: userLoading } = useUser()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const notificationsService = useMemo(() => createNotificationsService(supabase), [supabase])

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const data = await notificationsService.getSettings(user.id)
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notification settings'))
    } finally {
      setLoading(false)
    }
  }, [user?.id, notificationsService])

  // Initial fetch
  useEffect(() => {
    if (!userLoading && user?.id) {
      fetchSettings()
    } else if (!userLoading && !user) {
      setLoading(false)
    }
  }, [user?.id, userLoading, fetchSettings])

  // Toggle push inspiration
  const togglePushInspiration = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    setSettings(prev => prev ? { ...prev, push_inspiration: enabled } : null)

    try {
      const updated = await notificationsService.togglePushInspiration(user.id, enabled)
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchSettings()
      throw err
    }
  }, [user?.id, notificationsService, fetchSettings])

  // Toggle push updates
  const togglePushUpdates = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    setSettings(prev => prev ? { ...prev, push_updates: enabled } : null)

    try {
      const updated = await notificationsService.togglePushUpdates(user.id, enabled)
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchSettings()
      throw err
    }
  }, [user?.id, notificationsService, fetchSettings])

  // Toggle email inspiration
  const toggleEmailInspiration = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    setSettings(prev => prev ? { ...prev, email_inspiration: enabled } : null)

    try {
      const updated = await notificationsService.toggleEmailInspiration(user.id, enabled)
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchSettings()
      throw err
    }
  }, [user?.id, notificationsService, fetchSettings])

  // Toggle email updates
  const toggleEmailUpdates = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    setSettings(prev => prev ? { ...prev, email_updates: enabled } : null)

    try {
      const updated = await notificationsService.toggleEmailUpdates(user.id, enabled)
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchSettings()
      throw err
    }
  }, [user?.id, notificationsService, fetchSettings])

  // Unsubscribe all
  const unsubscribeAll = useCallback(async () => {
    if (!user?.id) return

    setSettings(prev => prev ? {
      ...prev,
      push_inspiration: false,
      push_updates: false,
      email_inspiration: false,
      email_updates: false,
    } : null)

    try {
      const updated = await notificationsService.unsubscribeAll(user.id)
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchSettings()
      throw err
    }
  }, [user?.id, notificationsService, fetchSettings])

  return {
    settings,
    loading: userLoading || loading,
    error,
    togglePushInspiration,
    togglePushUpdates,
    toggleEmailInspiration,
    toggleEmailUpdates,
    unsubscribeAll,
    refetch: fetchSettings,
  }
}
