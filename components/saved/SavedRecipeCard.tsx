'use client'

import Image from 'next/image'
import Link from 'next/link'

interface SavedRecipeCardProps {
  id: string
  title: string
  imageUrl: string
  onRemove?: (id: string) => void
}

export function SavedRecipeCard({ id, title, imageUrl, onRemove }: SavedRecipeCardProps) {
  return (
    <Link href={`/recipe/${id}`} className="block flex-shrink-0 w-40">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
        {/* Image */}
        <div className="relative aspect-square w-full">
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
              onRemove?.(id)
            }}
          >
            <Image
              src="/assets/icons/Bookmark-Filled.svg"
              alt="Saved"
              width={18}
              height={18}
              style={{ filter: 'invert(45%) sepia(97%) saturate(1752%) hue-rotate(322deg) brightness(101%) contrast(101%)' }}
            />
          </button>
        </div>

        {/* Title */}
        <div className="p-3">
          <h3 className="text-sm font-semibold line-clamp-1" style={{ color: '#282828' }}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
