'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SelectableChipProps {
  label: string
  icon?: string
  selected: boolean
  onToggle: () => void
}

export function SelectableChip({ label, icon, selected, onToggle }: SelectableChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-200 active:scale-95',
        selected
          ? 'border-gray-300 bg-amber-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      {/* Icon with checkmark overlay - only shown if icon is provided */}
      {icon && (
        <div className="relative h-6 w-6 flex-shrink-0">
          <Image
            src={icon}
            alt={label}
            width={24}
            height={24}
            className={cn(
              'h-6 w-6 rounded-full object-cover transition-all duration-200',
              selected && 'scale-90 opacity-30'
            )}
          />
          {/* Checkmark overlay - centered on image when selected */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-all duration-200',
              selected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            )}
          >
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full bg-foreground transition-transform duration-300',
                selected && 'animate-check-pop'
              )}
            >
              <svg
                className={cn(
                  'h-3 w-3 text-white transition-all duration-200 delay-75',
                  selected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  className={cn(
                    selected && 'animate-check-draw'
                  )}
                  style={{
                    strokeDasharray: 24,
                    strokeDashoffset: selected ? 0 : 24,
                    transition: 'stroke-dashoffset 0.3s ease-out 0.1s'
                  }}
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Checkmark for text-only chips */}
      {!icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-foreground transition-all duration-200',
            selected
              ? 'h-4 w-4 opacity-100 scale-100 animate-check-pop'
              : 'h-0 w-0 opacity-0 scale-50'
          )}
        >
          <svg
            className={cn(
              'h-2 w-2 text-white transition-all duration-150',
              selected ? 'opacity-100' : 'opacity-0'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: selected ? 0 : 24,
                transition: 'stroke-dashoffset 0.25s ease-out 0.1s'
              }}
            />
          </svg>
        </div>
      )}

      <span className={cn(
        'text-sm font-medium transition-colors duration-200',
        selected ? 'text-foreground' : 'text-gray-700'
      )}>
        {label}
      </span>
    </button>
  )
}
