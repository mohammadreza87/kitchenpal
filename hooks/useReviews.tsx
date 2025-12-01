'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'
import type { Review } from '@/types/chat'

export interface ReviewInput {
  recipeId: string
  rating: number
  comment: string
}

interface ReviewsContextType {
  reviews: Review[]
  loading: boolean
  getReviewsForRecipe: (recipeId: string) => Review[]
  getAverageRating: (recipeId: string) => number
  getReviewCount: (recipeId: string) => number
  addReview: (input: ReviewInput) => Promise<boolean>
  updateReview: (reviewId: string, input: Partial<ReviewInput>) => Promise<boolean>
  deleteReview: (reviewId: string) => Promise<boolean>
  hasUserReviewed: (recipeId: string) => boolean
  getUserReview: (recipeId: string) => Review | null
  refreshReviews: () => Promise<void>
}

const ReviewsContext = createContext<ReviewsContextType | null>(null)

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch all reviews from Supabase with current profile avatars
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('generated_recipe_reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
        return
      }

      // Get unique user IDs to fetch their current profile avatars
      const userIds = [...new Set((data || []).map(row => row.user_id).filter(Boolean))]

      // Fetch current profile data for all reviewers
      let profilesMap: Record<string, { avatar_url: string; full_name: string }> = {}
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, avatar_url, full_name')
          .in('id', userIds)

        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = { avatar_url: p.avatar_url || '', full_name: p.full_name || '' }
            return acc
          }, {} as Record<string, { avatar_url: string; full_name: string }>)
        }
      }

      // Transform database format to app format, using current profile avatar
      const transformedReviews: Review[] = (data || []).map((row) => {
        const profile = row.user_id ? profilesMap[row.user_id] : null
        return {
          id: row.id,
          recipeId: row.recipe_id,
          userId: row.user_id,
          userName: profile?.full_name || row.user_name || 'Anonymous',
          userAvatar: profile?.avatar_url || row.user_avatar || '',
          date: row.created_at,
          rating: row.rating,
          comment: row.comment || '',
        }
      })

      setReviews(transformedReviews)
    } catch (e) {
      console.error('Error fetching reviews:', e)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Load reviews on mount
  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Get reviews for a specific recipe
  const getReviewsForRecipe = useCallback((recipeId: string): Review[] => {
    return reviews
      .filter(r => r.recipeId === recipeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [reviews])

  // Get average rating for a recipe
  const getAverageRating = useCallback((recipeId: string): number => {
    const recipeReviews = reviews.filter(r => r.recipeId === recipeId)
    if (recipeReviews.length === 0) return 0
    const sum = recipeReviews.reduce((acc, r) => acc + r.rating, 0)
    return sum / recipeReviews.length
  }, [reviews])

  // Get review count for a recipe
  const getReviewCount = useCallback((recipeId: string): number => {
    return reviews.filter(r => r.recipeId === recipeId).length
  }, [reviews])

  // Check if current user has reviewed a recipe
  const hasUserReviewed = useCallback((recipeId: string): boolean => {
    if (!user) return false
    return reviews.some(r => r.recipeId === recipeId && r.userId === user.id)
  }, [reviews, user])

  // Get current user's review for a recipe
  const getUserReview = useCallback((recipeId: string): Review | null => {
    if (!user) return null
    return reviews.find(r => r.recipeId === recipeId && r.userId === user.id) || null
  }, [reviews, user])

  // Add a new review
  const addReview = useCallback(async (input: ReviewInput): Promise<boolean> => {
    if (!user) return false

    // Check if user already reviewed this recipe
    if (hasUserReviewed(input.recipeId)) {
      return false
    }

    try {
      // Fetch user profile to get the actual profile avatar (not Google OAuth avatar)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()

      // Use profile data if available, fallback to user metadata
      const userName = profileData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
      const userAvatar = profileData?.avatar_url || ''

      const { data, error } = await supabase
        .from('generated_recipe_reviews')
        .insert({
          recipe_id: input.recipeId,
          user_id: user.id,
          user_name: userName,
          user_avatar: userAvatar,
          rating: input.rating,
          comment: input.comment,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding review:', error)
        return false
      }

      // Add to local state
      const newReview: Review = {
        id: data.id,
        recipeId: data.recipe_id,
        userId: data.user_id,
        userName: data.user_name,
        userAvatar: data.user_avatar || '',
        date: data.created_at,
        rating: data.rating,
        comment: data.comment || '',
      }

      setReviews(prev => [newReview, ...prev])
      return true
    } catch (e) {
      console.error('Error adding review:', e)
      return false
    }
  }, [user, supabase, hasUserReviewed])

  // Update an existing review
  const updateReview = useCallback(async (reviewId: string, input: Partial<ReviewInput>): Promise<boolean> => {
    if (!user) return false

    const existingReview = reviews.find(r => r.id === reviewId && r.userId === user.id)
    if (!existingReview) return false

    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }
      if (input.rating !== undefined) updateData.rating = input.rating
      if (input.comment !== undefined) updateData.comment = input.comment

      const { error } = await supabase
        .from('generated_recipe_reviews')
        .update(updateData)
        .eq('id', reviewId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating review:', error)
        return false
      }

      // Update local state
      setReviews(prev => prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            ...(input.rating !== undefined && { rating: input.rating }),
            ...(input.comment !== undefined && { comment: input.comment }),
            date: new Date().toISOString(),
          }
        }
        return r
      }))

      return true
    } catch (e) {
      console.error('Error updating review:', e)
      return false
    }
  }, [user, reviews, supabase])

  // Delete a review
  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!user) return false

    const review = reviews.find(r => r.id === reviewId)
    if (!review || review.userId !== user.id) return false

    try {
      const { error } = await supabase
        .from('generated_recipe_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting review:', error)
        return false
      }

      // Remove from local state
      setReviews(prev => prev.filter(r => r.id !== reviewId))
      return true
    } catch (e) {
      console.error('Error deleting review:', e)
      return false
    }
  }, [user, reviews, supabase])

  // Refresh reviews
  const refreshReviews = useCallback(async () => {
    await fetchReviews()
  }, [fetchReviews])

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        loading,
        getReviewsForRecipe,
        getAverageRating,
        getReviewCount,
        addReview,
        updateReview,
        deleteReview,
        hasUserReviewed,
        getUserReview,
        refreshReviews,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewsContext)

  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider')
  }

  return context
}
