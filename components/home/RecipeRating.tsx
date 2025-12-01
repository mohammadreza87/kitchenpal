'use client'

import { useReviews } from '@/hooks'
import { StarRating } from './StarRating'

interface RecipeRatingProps {
  recipeId: string
  size?: number
  showCount?: boolean
}

/**
 * RecipeRating Component
 * Shows the average star rating from actual user reviews
 * Shows empty stars if no reviews exist
 */
export function RecipeRating({
  recipeId,
  size = 16,
  showCount = false
}: RecipeRatingProps) {
  const { getAverageRating, getReviewCount } = useReviews()

  const reviewCount = getReviewCount(recipeId)
  const averageRating = getAverageRating(recipeId)
  const displayRating = reviewCount > 0 ? Math.round(averageRating) : 0

  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={displayRating} size={size} showEmpty />
      {showCount && reviewCount > 0 && (
        <span className="text-xs text-neutral-500">({reviewCount})</span>
      )}
    </div>
  )
}
