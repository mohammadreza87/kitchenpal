'use client'

import Image from 'next/image'
import Link from 'next/link'
import { RecipeRating } from './RecipeRating'

interface RecipeListCardProps {
  id: string
  title: string
  description: string
  imageUrl?: string
  rating?: number
  prepTime?: string
  servings?: number
  calories?: number
  difficulty?: string
  isSaved?: boolean
  onToggleSave?: (id: string) => void
}

export function RecipeListCard({
  id,
  title,
  description,
  imageUrl,
  prepTime = '30 mins',
  servings,
  calories,
  difficulty,
  isSaved = false,
  onToggleSave
}: RecipeListCardProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop'

  return (
    <Link href={`/recipe/${id}`} className="block w-full">
      <div className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm transition-all hover:shadow-md active:scale-[0.99]">
        {/* Image */}
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl">
          <Image
            src={imageUrl || fallbackImage}
            alt={title}
            fill
            className="object-cover"
          />
          {/* Bookmark Button */}
          <button
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
            style={{ backgroundColor: 'rgba(255, 228, 222, 0.95)' }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSave?.(id)
            }}
          >
            <Image
              src={isSaved ? '/assets/icons/Bookmark-Filled.svg' : '/assets/icons/Bookmark.svg'}
              alt="Save"
              width={14}
              height={14}
              style={{
                filter: isSaved
                  ? 'invert(36%) sepia(93%) saturate(2156%) hue-rotate(316deg) brightness(99%) contrast(105%)'
                  : 'invert(24%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(27%) contrast(89%)'
              }}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            {/* Rating */}
            <RecipeRating recipeId={id} size={14} />

            {/* Title */}
            <h3 className="mt-1 text-base font-semibold line-clamp-1" style={{ color: '#282828' }}>
              {title}
            </h3>

            {/* Description */}
            <p className="mt-0.5 text-xs line-clamp-2" style={{ color: '#656565' }}>
              {description}
            </p>
          </div>

          {/* Meta info */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: '#888' }}>
            {prepTime && (
              <span className="flex items-center gap-1">
                <Image
                  src="/assets/icons/Clock.svg"
                  alt=""
                  width={12}
                  height={12}
                  className="opacity-60"
                />
                {prepTime}
              </span>
            )}
            {calories && (
              <span className="flex items-center gap-1">
                <Image
                  src="/assets/icons/Fire.svg"
                  alt=""
                  width={12}
                  height={12}
                  className="opacity-60"
                />
                {calories} cal
              </span>
            )}
            {difficulty && (
              <span className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  difficulty.toLowerCase() === 'easy' ? 'bg-green-500' :
                  difficulty.toLowerCase() === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                {difficulty}
              </span>
            )}
            {servings && (
              <span className="flex items-center gap-1">
                <Image
                  src="/assets/icons/2User.svg"
                  alt=""
                  width={12}
                  height={12}
                  className="opacity-60"
                />
                {servings}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
