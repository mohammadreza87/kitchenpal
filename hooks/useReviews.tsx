'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useUser } from './useUser'
import type { Review } from '@/types/chat'

const REVIEWS_STORAGE_KEY = 'kitchenpal_recipe_reviews'

export interface ReviewInput {
  recipeId: string
  rating: number
  comment: string
}

interface ReviewsContextType {
  getReviewsForRecipe: (recipeId: string) => Review[]
  getAverageRating: (recipeId: string) => number
  getReviewCount: (recipeId: string) => number
  addReview: (input: ReviewInput) => Promise<boolean>
  updateReview: (reviewId: string, input: Partial<ReviewInput>) => Promise<boolean>
  deleteReview: (reviewId: string) => Promise<boolean>
  hasUserReviewed: (recipeId: string) => boolean
  getUserReview: (recipeId: string) => Review | null
}

const ReviewsContext = createContext<ReviewsContextType | null>(null)

// Helper to get all reviews from localStorage
function getReviewsFromStorage(): Review[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Helper to save reviews to localStorage
function saveReviewsToStorage(reviews: Review[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews))
  } catch (e) {
    console.error('Error saving reviews:', e)
  }
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [reviews, setReviews] = useState<Review[]>([])

  // Load reviews on mount
  useEffect(() => {
    setReviews(getReviewsFromStorage())
  }, [])

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

    const newReview: Review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipeId: input.recipeId,
      userId: user.id,
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      userAvatar: user.user_metadata?.avatar_url || '',
      date: new Date().toISOString(),
      rating: input.rating,
      comment: input.comment,
    }

    const updatedReviews = [...reviews, newReview]
    setReviews(updatedReviews)
    saveReviewsToStorage(updatedReviews)

    return true
  }, [user, reviews, hasUserReviewed])

  // Update an existing review
  const updateReview = useCallback(async (reviewId: string, input: Partial<ReviewInput>): Promise<boolean> => {
    if (!user) return false

    const reviewIndex = reviews.findIndex(r => r.id === reviewId && r.userId === user.id)
    if (reviewIndex === -1) return false

    const updatedReviews = [...reviews]
    updatedReviews[reviewIndex] = {
      ...updatedReviews[reviewIndex],
      ...(input.rating !== undefined && { rating: input.rating }),
      ...(input.comment !== undefined && { comment: input.comment }),
      date: new Date().toISOString(), // Update the date
    }

    setReviews(updatedReviews)
    saveReviewsToStorage(updatedReviews)

    return true
  }, [user, reviews])

  // Delete a review
  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!user) return false

    const review = reviews.find(r => r.id === reviewId)
    if (!review || review.userId !== user.id) return false

    const updatedReviews = reviews.filter(r => r.id !== reviewId)
    setReviews(updatedReviews)
    saveReviewsToStorage(updatedReviews)

    return true
  }, [user, reviews])

  return (
    <ReviewsContext.Provider
      value={{
        getReviewsForRecipe,
        getAverageRating,
        getReviewCount,
        addReview,
        updateReview,
        deleteReview,
        hasUserReviewed,
        getUserReview,
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
