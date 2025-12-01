'use client'

import { useState, forwardRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { RecipeOption } from '@/types/chat'

export interface RecipeOptionsProps {
  options: RecipeOption[]
  onSelect: (recipe: RecipeOption) => void
  disabled?: boolean
  className?: string
}

/**
 * RecipeOptions Component
 * Renders radio-button style options for recipe suggestions.
 * Handles selection to open recipe detail modal.
 * Requirements: 3.1, 3.2, 3.3
 */
const RecipeOptions = forwardRef<HTMLDivElement, RecipeOptionsProps>(
  ({ options, onSelect, disabled = false, className }, ref) => {
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const handleSelect = (recipe: RecipeOption) => {
      if (disabled) return
      setSelectedId(recipe.id)
      onSelect(recipe)
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-2', className)}
        role="radiogroup"
        aria-label="Recipe options"
      >
        {options.map((recipe) => {
          const isSelected = selectedId === recipe.id || recipe.selected

          return (
            <button
              key={recipe.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(recipe)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
                isSelected
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-neutral-200 bg-white hover:border-brand-primary/50 hover:bg-brand-primary/5',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-brand-primary bg-brand-primary'
                    : 'border-neutral-300'
                )}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>

              {/* Recipe icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-secondary/20">
                <Image
                  src="/assets/icons/Fork.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-70"
                />
              </div>

              {/* Recipe name */}
              <span className="text-body-md font-medium text-foreground">
                {recipe.name}
              </span>

              {/* Chevron */}
              <Image
                src="/assets/icons/Chevron-Right.svg"
                alt=""
                width={20}
                height={20}
                className="ml-auto opacity-40"
              />
            </button>
          )
        })}
      </div>
    )
  }
)

RecipeOptions.displayName = 'RecipeOptions'

export { RecipeOptions }
