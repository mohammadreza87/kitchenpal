'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createFeedbackService, type SubmitFeedbackData } from '@/lib/services/feedback.service'
import { useUser } from './useUser'
import type { UserFeedback } from '@/types/database'

export function useFeedback() {
  const { user } = useUser()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const feedbackService = useMemo(() => createFeedbackService(supabase), [supabase])

  const submitFeedback = useCallback(async (data: SubmitFeedbackData): Promise<UserFeedback | null> => {
    setSubmitting(true)
    setError(null)

    try {
      const feedback = await feedbackService.submitFeedback(user?.id || null, data)
      return feedback
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit feedback')
      setError(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [user?.id, feedbackService])

  const uploadAttachment = useCallback(async (feedbackId: string, file: File) => {
    try {
      return await feedbackService.uploadAttachment(feedbackId, file)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload attachment')
      setError(error)
      throw error
    }
  }, [feedbackService])

  return {
    submitFeedback,
    uploadAttachment,
    submitting,
    error,
    isAuthenticated: !!user,
    userEmail: user?.email,
  }
}

export function useUserFeedbackHistory() {
  const { user, loading: userLoading } = useUser()
  const [feedback, setFeedback] = useState<UserFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const feedbackService = useMemo(() => createFeedbackService(supabase), [supabase])

  const fetchFeedback = useCallback(async () => {
    if (!user?.id) {
      setFeedback([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await feedbackService.getUserFeedback(user.id)
      setFeedback(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch feedback'))
    } finally {
      setLoading(false)
    }
  }, [user?.id, feedbackService])

  return {
    feedback,
    loading: userLoading || loading,
    error,
    refetch: fetchFeedback,
  }
}
