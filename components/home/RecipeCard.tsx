'use client'

import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from './StarRating'

interface RecipeCardProps {
  id: string
  title: string
  description: string
  imageUrl: string
  rating: number
  isSaved?: boolean
  onToggleSave?: (id: string) => void
}

export function RecipeCard({ id, title, description, imageUrl, rating, isSaved = false, onToggleSave }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${id}`} className="block flex-shrink-0 w-44">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
        {/* Image */}
        <div className="relative h-32 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
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
              style={{ filter: 'invert(45%) sepia(97%) saturate(1752%) hue-rotate(322deg) brightness(101%) contrast(101%)' }}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <StarRating rating={rating} />
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
