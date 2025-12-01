'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createProfileService } from '@/lib/services/profile.service'
import { useUser } from './useUser'
import type { Profile, ProfileUpdate, SocialLinks, SocialLinksUpdate } from '@/types/database'

export function useProfile() {
  const { user, loading: userLoading } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const profileService = useMemo(() => createProfileService(supabase), [supabase])

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const [profileData, socialData] = await Promise.all([
        profileService.getProfile(user.id),
        profileService.getSocialLinks(user.id),
      ])

      setProfile(profileData)
      setSocialLinks(socialData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
    } finally {
      setLoading(false)
    }
  }, [user?.id, profileService])

  // Initial fetch
  useEffect(() => {
    if (!userLoading && user?.id) {
      fetchProfile()
    } else if (!userLoading && !user) {
      setLoading(false)
    }
  }, [user?.id, userLoading, fetchProfile])

  // Update profile
  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!user?.id) throw new Error('Not authenticated')

    // Optimistic update
    setProfile(prev => prev ? { ...prev, ...updates } : null)

    try {
      const updated = await profileService.updateProfile(user.id, updates)
      setProfile(updated)
      return updated
    } catch (err) {
      // Revert on error
      await fetchProfile()
      throw err
    }
  }, [user?.id, profileService, fetchProfile])

  // Update social links
  const updateSocialLinks = useCallback(async (updates: SocialLinksUpdate) => {
    if (!user?.id) throw new Error('Not authenticated')

    // Optimistic update
    setSocialLinks(prev => prev ? { ...prev, ...updates } : null)

    try {
      const updated = await profileService.updateSocialLinks(user.id, updates)
      setSocialLinks(updated)
      return updated
    } catch (err) {
      // Revert on error
      await fetchProfile()
      throw err
    }
  }, [user?.id, profileService, fetchProfile])

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File) => {
    if (!user?.id) throw new Error('Not authenticated')

    try {
      const avatarUrl = await profileService.uploadAvatar(user.id, file)
      if (avatarUrl) {
        setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
      }
      return avatarUrl
    } catch (err) {
      throw err
    }
  }, [user?.id, profileService])

  return {
    profile,
    socialLinks,
    loading: userLoading || loading,
    error,
    updateProfile,
    updateSocialLinks,
    uploadAvatar,
    refetch: fetchProfile,
  }
}
