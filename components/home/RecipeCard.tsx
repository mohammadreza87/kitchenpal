'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { RecipeRating } from './RecipeRating'
import { useGeneratedRecipes } from '@/hooks'

interface RecipeCardProps {
  id: string
  title: string
  description: string
  imageUrl: string
  rating?: number
  isSaved?: boolean
  onToggleSave?: (id: string) => void
  onRetryImage?: (id: string) => void
  index?: number
}

export function RecipeCard({
  id,
  title,
  description,
  imageUrl,
  isSaved = false,
  onToggleSave,
  onRetryImage,
  index = 0
}: RecipeCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { regeneratingIds } = useGeneratedRecipes()

  // Staggered animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 80) // 80ms stagger between each card

    return () => clearTimeout(timer)
  }, [index])

  // Check if this recipe is currently regenerating
  const isRegenerating = regeneratingIds.has(id)

  // Reset error state when image URL changes
  useEffect(() => {
    if (imageUrl) {
      setImageError(false)
    }
  }, [imageUrl])

  const handleImageError = () => {
    setImageError(true)
  }

  const handleRetry = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (onRetryImage && !isRegenerating) {
      onRetryImage(id)
    }
  }

  const hasValidImage = imageUrl && !imageError && !isRegenerating

  return (
    <Link
      href={`/recipe/${id}`}
      className={`block flex-shrink-0 w-44 transition-all duration-500 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 transform hover:-translate-y-2 hover:shadow-md active:-translate-y-1 active:shadow-md">
        {/* Image */}
        <div className="relative h-32 w-full bg-gradient-to-br from-amber-50 to-orange-50">
          {hasValidImage ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              onError={handleImageError}
            />
          ) : (
            /* Placeholder with retry button */
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Food icon placeholder */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-sm">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-amber-400"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              {/* Retry button */}
              {(onRetryImage || isRegenerating) && (
                <button
                  onClick={handleRetry}
                  disabled={isRegenerating}
                  className="mt-2 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-amber-600 shadow-sm transition-all hover:bg-white hover:shadow active:scale-95 disabled:opacity-50"
                >
                  {isRegenerating ? (
                    <>
                      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Generate</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Bookmark Button */}
          <button
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
            style={{ backgroundColor: '#FFE4DE' }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSave?.(id)
            }}
          >
            <Image
              src={isSaved ? '/assets/icons/Bookmark-Filled.svg' : '/assets/icons/Bookmark.svg'}
              alt="Save"
              width={18}
              height={18}
              style={{
                filter: isSaved
                  ? 'invert(36%) sepia(93%) saturate(2156%) hue-rotate(316deg) brightness(99%) contrast(105%)'
                  : 'invert(24%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(27%) contrast(89%)'
              }}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <RecipeRating recipeId={id} />
          <h3 className="mt-1.5 text-sm font-semibold line-clamp-1" style={{ color: '#282828' }}>
            {title}
          </h3>
          <p className="mt-1 text-xs line-clamp-2" style={{ color: '#656565' }}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
