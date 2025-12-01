'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => Promise<void>
  existingRating?: number
  existingComment?: string
  isEditing?: boolean
}

export function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  existingRating = 0,
  existingComment = '',
  isEditing = false,
}: ReviewModalProps) {
  const [rating, setRating] = useState(existingRating)
  const [comment, setComment] = useState(existingComment)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(existingRating)
      setComment(existingComment)
      setError(null)
    }
  }, [isOpen, existingRating, existingComment])

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(rating, comment)
      onClose()
    } catch {
      setError('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-0 z-50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:w-full">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Handle for mobile */}
          <div className="flex justify-center pt-3 pb-2 sm:hidden">
            <div className="w-10 h-1 bg-neutral-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#363636]">
              {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <Image
                src="/assets/icons/x.svg"
                alt="Close"
                width={20}
                height={20}
                className="opacity-60"
              />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Star Rating */}
            <div className="mb-6">
              <p className="text-sm text-neutral-500 mb-3">How would you rate this recipe?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill={star <= (hoverRating || rating) ? '#FFD700' : 'none'}
                      stroke={star <= (hoverRating || rating) ? '#FFD700' : '#D1D5DB'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-2 text-sm text-neutral-500">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-500 mb-2">
                Share your thoughts (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike about this recipe?"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-[#363636] placeholder:text-neutral-400 focus:outline-none focus:border-brand-primary resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-neutral-200 text-[#363636] font-medium transition-colors hover:bg-neutral-50 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className={cn(
                'flex-1 py-3 rounded-full font-medium transition-all active:scale-[0.98]',
                rating > 0 && !isSubmitting
                  ? 'bg-brand-primary text-white hover:bg-brand-primary-dark'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                isEditing ? 'Update Review' : 'Submit Review'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
