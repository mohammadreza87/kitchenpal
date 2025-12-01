'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Ingredient } from '@/types/chat'

export interface IngredientsTabProps {
  ingredients: Ingredient[]
  portions: number
  onIncrease: () => void
  onDecrease: () => void
  className?: string
}

/**
 * IngredientsTab Component
 * Displays portion adjuster and ingredient list with icons and quantities
 * Requirements: 10.1 (portion adjuster), 10.2 (quantity scaling), 10.3 (ingredient display)
 */
export function IngredientsTab({
  ingredients,
  portions,
  onIncrease,
  onDecrease,
  className,
}: IngredientsTabProps) {
  return (
    <div
      role="tabpanel"
      id="ingredients-panel"
      aria-labelledby="ingredients-tab"
      className={cn('px-5 py-4', className)}
    >
      {/* Portion Adjuster */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-body-md font-medium text-foreground">
          Servings
        </span>
        <div className="flex items-center gap-3">
          {/* Decrease Button */}
          <button
            onClick={onDecrease}
            disabled={portions <= 1}
            aria-label="Decrease portions"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              'bg-brand-primary text-white',
              'transition-all duration-150',
              'hover:bg-brand-primary-dark active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Image
              src="/assets/icons/Minus.svg"
              alt=""
              width={18}
              height={18}
              className="invert"
            />
          </button>

          {/* Portion Count */}
          <span
            className="min-w-[2rem] text-center text-title-md font-semibold"
            aria-live="polite"
            aria-atomic="true"
          >
            {portions}
          </span>

          {/* Increase Button */}
          <button
            onClick={onIncrease}
            aria-label="Increase portions"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              'bg-brand-primary text-white',
              'transition-all duration-150',
              'hover:bg-brand-primary-dark active:scale-95'
            )}
          >
            <Image
              src="/assets/icons/Add.svg"
              alt=""
              width={18}
              height={18}
              className="invert"
            />
          </button>
        </div>
      </div>

      {/* Ingredients List */}
      <ul className="space-y-3">
        {ingredients.map((ingredient) => (
          <li
            key={ingredient.id}
            className="flex items-center gap-3 py-2"
          >
            {/* Ingredient Icon */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary-container">
              {ingredient.iconUrl ? (
                <Image
                  src={ingredient.iconUrl}
                  alt=""
                  width={24}
                  height={24}
                />
              ) : (
                <Image
                  src="/assets/icons/Fork.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-60"
                />
              )}
            </div>

            {/* Ingredient Name */}
            <span className="flex-1 text-body-md text-foreground">
              {ingredient.name}
            </span>

            {/* Quantity and Unit */}
            <span className="text-body-md font-medium text-muted-foreground">
              {formatQuantity(ingredient.quantity)} {ingredient.unit}
            </span>
          </li>
        ))}
      </ul>

      {/* Empty State */}
      {ingredients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Image
            src="/assets/icons/Fork.svg"
            alt=""
            width={48}
            height={48}
            className="opacity-30"
          />
          <p className="mt-3 text-body-md text-muted-foreground">
            No ingredients listed
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Format quantity to display nicely (remove trailing zeros)
 */
function formatQuantity(quantity: number): string {
  // Round to 2 decimal places and remove trailing zeros
  const rounded = Math.round(quantity * 100) / 100
  return rounded.toString()
}
