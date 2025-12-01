'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useReviews } from '@/hooks'
import { useUser } from '@/hooks/useUser'
import { ReviewModal } from './ReviewModal'
import type { Review } from '@/types/chat'

export interface ReviewsTabProps {
  recipeId: string
  className?: string
}

/**
 * ReviewsTab Component
 * Displays review summary with avatars and scrollable review list
 * Allows users to add/edit their own reviews
 */
export function ReviewsTab({
  recipeId,
  className,
}: ReviewsTabProps) {
  const { user } = useUser()
  const {
    getReviewsForRecipe,
    getReviewCount,
    addReview,
    updateReview,
    deleteReview,
    hasUserReviewed,
    getUserReview,
  } = useReviews()

  const [showReviewModal, setShowReviewModal] = useState(false)

  const reviews = getReviewsForRecipe(recipeId)
  const totalCount = getReviewCount(recipeId)
  const userHasReviewed = hasUserReviewed(recipeId)
  const userReview = getUserReview(recipeId)

  // Get unique avatars for summary (max 4)
  const summaryAvatars = reviews
    .filter((r) => r.userAvatar)
    .slice(0, 4)
    .map((r) => r.userAvatar)

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (userHasReviewed && userReview) {
      await updateReview(userReview.id, { rating, comment })
    } else {
      await addReview({ recipeId, rating, comment })
    }
  }

  const handleDeleteReview = async () => {
    if (userReview) {
      await deleteReview(userReview.id)
    }
  }

  return (
    <div
      role="tabpanel"
      id="reviews-panel"
      aria-labelledby="reviews-tab"
      className={cn('px-5 py-4', className)}
    >
      {/* Review Summary Header - "People said" with avatars */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-[#363636]">People said</span>
          {/* Stacked Avatars */}
          <div className="flex -space-x-2">
            {summaryAvatars.length > 0 ? (
              summaryAvatars.map((avatar, index) => (
                <div
                  key={index}
                  className="relative h-8 w-8 rounded-2xl border-2 border-white overflow-hidden"
                >
                  <Image
                    src={avatar}
                    alt=""
                    fill
                    className="object-cover scale-110 rounded-2xl"
                  />
                </div>
              ))
            ) : (
              // Placeholder avatars
              Array.from({ length: Math.min(4, Math.max(totalCount, 1)) }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-8 w-8 items-center justify-center rounded-2xl border-2 border-white bg-neutral-100"
                >
                  <Image
                    src="/assets/icons/Profile.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-40"
                  />
                </div>
              ))
            )}
          </div>
          {/* Review Count Badge */}
          {totalCount > 0 && (
            <span className="text-sm text-neutral-500">+{totalCount}</span>
          )}
        </div>
      </div>

      {/* Add Review Button (if user hasn't reviewed yet) */}
      {user && !userHasReviewed && (
        <button
          onClick={() => setShowReviewModal(true)}
          className="w-full mb-6 py-3 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-500 font-medium flex items-center justify-center gap-2 hover:border-brand-primary hover:text-brand-primary transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Write a Review
        </button>
      )}

      {/* Reviews List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {reviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            isOwnReview={review.userId === user?.id}
            onEdit={() => setShowReviewModal(true)}
            onDelete={handleDeleteReview}
          />
        ))}
      </div>

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-30"
          >
            <path
              d="M32 4L39.56 21.08L58.18 23.54L44.09 37.26L47.56 55.78L32 47.54L16.44 55.78L19.91 37.26L5.82 23.54L24.44 21.08L32 4Z"
              stroke="#666666"
              strokeWidth="2"
            />
          </svg>
          <p className="mt-4 text-base text-neutral-500">No reviews yet</p>
          <p className="mt-1 text-sm text-neutral-400">
            Be the first to review this recipe!
          </p>
          {user && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="mt-4 px-6 py-2.5 rounded-full bg-brand-primary text-white font-medium hover:bg-brand-primary-dark transition-colors active:scale-[0.98]"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        existingRating={userReview?.rating}
        existingComment={userReview?.comment}
        isEditing={userHasReviewed}
      />
    </div>
  )
}

/**
 * Individual Review Item
 */
interface ReviewItemProps {
  review: Review
  isOwnReview?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

function ReviewItem({ review, isOwnReview, onEdit, onDelete }: ReviewItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleShowMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setShowActions(!showActions)
  }

  return (
    <div className="relative bg-amber-50 rounded-xl p-4">
      {/* User Info Row */}
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {review.userAvatar ? (
            <div className="relative h-10 w-10 rounded-2xl overflow-hidden">
              <Image
                src={review.userAvatar}
                alt={review.userName}
                fill
                className="object-cover scale-110 rounded-2xl"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-200">
              <Image
                src="/assets/icons/Profile.svg"
                alt=""
                width={20}
                height={20}
                className="opacity-60"
              />
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          {/* Name and Date */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#363636]">
              {review.userName}
            </span>
            {isOwnReview && (
              <span className="text-xs text-brand-primary font-medium">(You)</span>
            )}
          </div>
          <span className="text-xs text-neutral-400">
            {formatDate(review.date)}
          </span>

          {/* Comment */}
          {review.comment && (
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Star Rating */}
          <div className="flex items-center gap-0.5 mt-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <svg
                key={index}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={index < review.rating ? '#FFD700' : 'none'}
                stroke={index < review.rating ? '#FFD700' : '#D1D5DB'}
                strokeWidth="2"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Actions Menu for own review */}
        {isOwnReview && (
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleShowMenu}
              className="p-1 hover:bg-amber-100 rounded-full transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="1.5" fill="#666" />
                <circle cx="12" cy="12" r="1.5" fill="#666" />
                <circle cx="12" cy="19" r="1.5" fill="#666" />
              </svg>
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-[60]"
                  onClick={() => setShowActions(false)}
                />
                <div
                  className="fixed w-32 bg-white rounded-lg shadow-lg border border-neutral-100 overflow-hidden z-[70]"
                  style={{ top: menuPosition.top, right: menuPosition.right }}
                >
                  <button
                    onClick={() => {
                      setShowActions(false)
                      onEdit?.()
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#363636] hover:bg-neutral-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false)
                      onDelete?.()
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-neutral-100"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    // Format as "DD-MM-YYYY"
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return dateString
  }
}
