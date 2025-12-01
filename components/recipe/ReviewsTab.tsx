'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Review } from '@/types/chat'

export interface ReviewsTabProps {
  reviews: Review[]
  totalCount: number
  averageRating: number
  className?: string
}

/**
 * ReviewsTab Component
 * Displays review summary with avatars and scrollable review list
 * Requirements: 12.1 (summary with count and avatars), 12.2 (review details), 12.3 (scrollable list)
 */
export function ReviewsTab({
  reviews,
  totalCount,
  averageRating,
  className,
}: ReviewsTabProps) {
  // Get unique avatars for summary (max 3)
  const summaryAvatars = reviews
    .filter((r) => r.userAvatar)
    .slice(0, 3)
    .map((r) => r.userAvatar)

  return (
    <div
      role="tabpanel"
      id="reviews-panel"
      aria-labelledby="reviews-tab"
      className={cn('px-5 py-4', className)}
    >
      {/* Review Summary */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Stacked Avatars */}
          <div className="flex -space-x-2">
            {summaryAvatars.length > 0 ? (
              summaryAvatars.map((avatar, index) => (
                <div
                  key={index}
                  className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden"
                >
                  <Image
                    src={avatar}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
              // Placeholder avatars
              Array.from({ length: Math.min(3, totalCount || 1) }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-brand-primary-container"
                >
                  <Image
                    src="/assets/icons/Profile.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-60"
                  />
                </div>
              ))
            )}
          </div>

          {/* Review Count */}
          <span className="text-body-md text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Average Rating */}
        <div className="flex items-center gap-1">
          <Image
            src="/assets/icons/Star-Filled.svg"
            alt=""
            width={18}
            height={18}
            style={{ filter: 'invert(76%) sepia(62%) saturate(588%) hue-rotate(359deg) brightness(103%) contrast(104%)' }}
          />
          <span className="text-title-md font-semibold">
            {averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Image
            src="/assets/icons/Message.svg"
            alt=""
            width={48}
            height={48}
            className="opacity-30"
          />
          <p className="mt-3 text-body-md text-muted-foreground">
            No reviews yet
          </p>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Be the first to review this recipe!
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Individual Review Item
 */
interface ReviewItemProps {
  review: Review
}

function ReviewItem({ review }: ReviewItemProps) {
  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      {/* User Avatar */}
      <div className="flex-shrink-0">
        {review.userAvatar ? (
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src={review.userAvatar}
              alt={review.userName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-container">
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
        {/* Header: Name, Date, Rating */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-body-md font-medium text-foreground truncate">
              {review.userName}
            </span>
            <span className="text-body-sm text-muted-foreground flex-shrink-0">
              {formatDate(review.date)}
            </span>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <Image
                key={index}
                src={index < review.rating ? '/assets/icons/Star-Filled.svg' : '/assets/icons/Star.svg'}
                alt=""
                width={14}
                height={14}
                style={index < review.rating 
                  ? { filter: 'invert(76%) sepia(62%) saturate(588%) hue-rotate(359deg) brightness(103%) contrast(104%)' } 
                  : { opacity: 0.3 }
                }
              />
            ))}
          </div>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="mt-1 text-body-md text-muted-foreground leading-relaxed">
            {review.comment}
          </p>
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
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  } catch {
    return dateString
  }
}
