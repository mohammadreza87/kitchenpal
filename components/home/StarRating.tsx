'use client'

import Image from 'next/image'

interface StarRatingProps {
  rating: number | undefined | null
  maxRating?: number
  size?: number
  showEmpty?: boolean
}

export function StarRating({ rating, maxRating = 5, size = 16, showEmpty = false }: StarRatingProps) {
  // Don't render anything if there's no rating and showEmpty is false
  if ((rating === undefined || rating === null || rating === 0) && !showEmpty) {
    return null
  }

  const displayRating = rating || 0

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, index) => (
        <Image
          key={index}
          src={index < displayRating ? '/assets/icons/Star-Filled.svg' : '/assets/icons/Star.svg'}
          alt=""
          width={size}
          height={size}
          style={index < displayRating ? { filter: 'invert(76%) sepia(62%) saturate(588%) hue-rotate(359deg) brightness(103%) contrast(104%)' } : { opacity: 0.3 }}
        />
      ))}
    </div>
  )
}
