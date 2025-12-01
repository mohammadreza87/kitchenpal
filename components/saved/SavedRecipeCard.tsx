'use client'

import Image from 'next/image'
import Link from 'next/link'
import { RecipeRating } from '@/components/home/RecipeRating'

interface SavedRecipeCardProps {
  id: string
  title: string
  description: string
  imageUrl: string
  rating?: number
  onRemove?: (id: string) => void
}

export function SavedRecipeCard({ id, title, description, imageUrl, onRemove }: SavedRecipeCardProps) {
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
          {/* Bookmark Button - Always filled since it's saved */}
          <button
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
            style={{ backgroundColor: '#FFE4DE' }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove?.(id)
            }}
          >
            <Image
              src="/assets/icons/Bookmark-Filled.svg"
              alt="Saved"
              width={18}
              height={18}
              style={{
                filter: 'invert(36%) sepia(93%) saturate(2156%) hue-rotate(316deg) brightness(99%) contrast(105%)'
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
