'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createSecurityService, type MFAEnrollmentData } from '@/lib/services/security.service'
import { useUser } from './useUser'
import type { SecuritySettings, UserSession } from '@/types/database'

interface MFAFactor {
  id: string
  friendly_name: string | null
  factor_type: 'totp'
  status: 'verified' | 'unverified'
  created_at: string
  updated_at: string
}

export function useSecuritySettings() {
  const { user, loading: userLoading } = useUser()
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [mfaFactors, setMfaFactors] = useState<MFAFactor[]>([])
  const [mfaEnrollment, setMfaEnrollment] = useState<MFAEnrollmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const securityService = useMemo(() => createSecurityService(supabase), [supabase])

  // Fetch settings, sessions, and MFA factors
  const fetchData = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const [settingsData, sessionsData, mfaData] = await Promise.all([
        securityService.getSettings(user.id),
        securityService.getSessions(user.id),
        securityService.getMFAFactors(),
      ])

      setSettings(settingsData)
      setSessions(sessionsData)
      setMfaFactors(mfaData?.totp || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch security settings'))
    } finally {
      setLoading(false)
    }
  }, [user?.id, securityService])


  // Initial fetch
  useEffect(() => {
    if (!userLoading && user?.id) {
      fetchData()
    } else if (!userLoading && !user) {
      setLoading(false)
    }
  }, [user?.id, userLoading, fetchData])

  // ==========================================
  // TWO-FACTOR AUTHENTICATION
  // ==========================================

  const startMFAEnrollment = useCallback(async () => {
    try {
      const enrollment = await securityService.enrollMFA()
      setMfaEnrollment(enrollment)
      return enrollment
    } catch (err) {
      throw err
    }
  }, [securityService])

  const verifyMFAEnrollment = useCallback(async (code: string) => {
    if (!mfaEnrollment || !user?.id) {
      throw new Error('No MFA enrollment in progress')
    }

    try {
      await securityService.verifyMFA(mfaEnrollment.id, code)
      
      // Update settings to reflect 2FA is enabled
      await securityService.updateSettings(user.id, { 
        two_factor_enabled: true,
        two_factor_method: 'totp',
      })
      
      setMfaEnrollment(null)
      await fetchData()
      return true
    } catch (err) {
      throw err
    }
  }, [mfaEnrollment, user?.id, securityService, fetchData])

  const cancelMFAEnrollment = useCallback(() => {
    setMfaEnrollment(null)
  }, [])

  const disableMFA = useCallback(async () => {
    if (!user?.id) return

    const verifiedFactor = mfaFactors.find(f => f.status === 'verified')
    if (!verifiedFactor) {
      throw new Error('No verified MFA factor found')
    }

    try {
      await securityService.unenrollMFA(verifiedFactor.id)
      await securityService.updateSettings(user.id, { 
        two_factor_enabled: false,
        two_factor_method: null,
      })
      await fetchData()
      return true
    } catch (err) {
      throw err
    }
  }, [user?.id, mfaFactors, securityService, fetchData])

  const toggleTwoFactor = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    if (enabled) {
      // Start enrollment flow - don't update settings yet
      return startMFAEnrollment()
    } else {
      // Disable MFA
      return disableMFA()
    }
  }, [user?.id, startMFAEnrollment, disableMFA])


  // ==========================================
  // PRIVACY TOGGLES
  // ==========================================

  const toggleLoginAlerts = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    setSettings(prev => prev ? { ...prev, login_alerts: enabled } : null)

    try {
      const updated = await securityService.updateSettings(user.id, { login_alerts: enabled })
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchData()
      throw err
    }
  }, [user?.id, securityService, fetchData])

  const toggleBiometricLock = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    // For web, we'll store the preference but actual biometric is handled by WebAuthn
    setSettings(prev => prev ? { ...prev, biometric_lock: enabled } : null)

    try {
      const updated = await securityService.updateSettings(user.id, { biometric_lock: enabled })
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchData()
      throw err
    }
  }, [user?.id, securityService, fetchData])

  const toggleDataPersonalization = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    setSettings(prev => prev ? { ...prev, data_personalization: enabled } : null)

    try {
      const updated = await securityService.updateSettings(user.id, { data_personalization: enabled })
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchData()
      throw err
    }
  }, [user?.id, securityService, fetchData])

  const toggleUsageAnalytics = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    setSettings(prev => prev ? { ...prev, usage_analytics: enabled } : null)

    try {
      const updated = await securityService.updateSettings(user.id, { usage_analytics: enabled })
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchData()
      throw err
    }
  }, [user?.id, securityService, fetchData])

  const togglePrivateMode = useCallback(async (enabled: boolean) => {
    if (!user?.id) return

    setSettings(prev => prev ? { ...prev, private_mode: enabled } : null)

    try {
      const updated = await securityService.updateSettings(user.id, { private_mode: enabled })
      setSettings(updated)
      return updated
    } catch (err) {
      await fetchData()
      throw err
    }
  }, [user?.id, securityService, fetchData])


  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================

  const signOutSession = useCallback(async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))

    try {
      await securityService.deleteSession(sessionId)
    } catch (err) {
      await fetchData()
      throw err
    }
  }, [securityService, fetchData])

  const signOutAllOtherSessions = useCallback(async (currentSessionId: string) => {
    if (!user?.id) return

    setSessions(prev => prev.filter(s => s.id === currentSessionId))

    try {
      await securityService.deleteAllOtherSessions(user.id, currentSessionId)
      // Also sign out from Supabase Auth globally (except current)
      // Note: Supabase doesn't have a "sign out others" - this clears our session tracking
    } catch (err) {
      await fetchData()
      throw err
    }
  }, [user?.id, securityService, fetchData])

  // ==========================================
  // DATA EXPORT & DELETION
  // ==========================================

  const requestDataExport = useCallback(async () => {
    if (!user?.id) return

    try {
      const blob = await securityService.downloadDataAsJSON(user.id)
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kitchenpal-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return 'Your data has been downloaded successfully.'
    } catch (err) {
      console.error('Error exporting data:', err)
      throw new Error('Failed to export data. Please try again.')
    }
  }, [user?.id, securityService])

  const requestDataDeletion = useCallback(async () => {
    if (!user?.id) return

    try {
      const message = await securityService.requestDataDeletion(user.id)
      await fetchData() // Refresh to show deletion_requested_at
      return message
    } catch (err) {
      throw err
    }
  }, [user?.id, securityService, fetchData])

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================

  const changePassword = useCallback(async (newPassword: string) => {
    try {
      await securityService.changePassword(newPassword)
      return true
    } catch (err) {
      throw err
    }
  }, [securityService])

  return {
    // State
    settings,
    sessions,
    mfaFactors,
    mfaEnrollment,
    loading: userLoading || loading,
    error,
    
    // MFA
    startMFAEnrollment,
    verifyMFAEnrollment,
    cancelMFAEnrollment,
    disableMFA,
    toggleTwoFactor,
    
    // Privacy toggles
    toggleLoginAlerts,
    toggleBiometricLock,
    toggleDataPersonalization,
    toggleUsageAnalytics,
    togglePrivateMode,
    
    // Sessions
    signOutSession,
    signOutAllOtherSessions,
    
    // Data
    requestDataExport,
    requestDataDeletion,
    changePassword,
    
    // Utility
    refetch: fetchData,
  }
}
