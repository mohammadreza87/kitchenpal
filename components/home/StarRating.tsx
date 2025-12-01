'use client'

import Image from 'next/image'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
}

export function StarRating({ rating, maxRating = 5, size = 16 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, index) => (
        <Image
          key={index}
          src={index < rating ? '/assets/icons/Star-Filled.svg' : '/assets/icons/Star.svg'}
          alt=""
          width={size}
          height={size}
          style={index < rating ? { filter: 'invert(76%) sepia(62%) saturate(588%) hue-rotate(359deg) brightness(103%) contrast(104%)' } : { opacity: 0.3 }}
        />
      ))}
    </div>
  )
}
