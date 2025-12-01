'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { RecipeDifficulty } from '@/types/chat'

export interface RecipeHeaderProps {
  title: string
  author: string
  rating: number
  reviewCount: number
  prepTime: string
  difficulty: RecipeDifficulty
  calories: number
  description?: string
  className?: string
}

/**
 * RecipeHeader Component
 * Displays recipe title, author, rating, and quick stats
 * Requirements: 9.2 (title, author, rating), 9.3 (quick stats), 9.4 (description)
 */
export function RecipeHeader({
  title,
  author,
  rating,
  reviewCount,
  prepTime,
  difficulty,
  calories,
  description,
  className,
}: RecipeHeaderProps) {
  return (
    <div className={cn('px-5 py-4', className)}>
      {/* Title and Author */}
      <h2 id="recipe-title" className="text-heading-sm font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-body-md text-muted-foreground">
        by {author}
      </p>

      {/* Rating */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Image
              key={index}
              src={index < Math.round(rating) ? '/assets/icons/Star-Filled.svg' : '/assets/icons/Star.svg'}
              alt=""
              width={16}
              height={16}
              style={index < Math.round(rating) 
                ? { filter: 'invert(76%) sepia(62%) saturate(588%) hue-rotate(359deg) brightness(103%) contrast(104%)' } 
                : { opacity: 0.3 }
              }
            />
          ))}
        </div>
        <span className="text-body-md font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
        <span className="text-body-sm text-muted-foreground">
          ({reviewCount} reviews)
        </span>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 flex items-center gap-4">
        {/* Prep Time */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary-container">
            <Image
              src="/assets/icons/Clock.svg"
              alt="Prep time"
              width={18}
              height={18}
              className="opacity-80"
            />
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Time</p>
            <p className="text-body-sm font-medium">{prepTime}</p>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary-container">
            <Image
              src="/assets/icons/Fire.svg"
              alt="Difficulty"
              width={18}
              height={18}
              className="opacity-80"
            />
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Level</p>
            <p className="text-body-sm font-medium">{difficulty}</p>
          </div>
        </div>

        {/* Calories */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tertiary-container">
            <Image
              src="/assets/icons/Fire.svg"
              alt="Calories"
              width={18}
              height={18}
              className="opacity-80"
            />
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Calories</p>
            <p className="text-body-sm font-medium">{calories} kcal</p>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="mt-4 text-body-md text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
