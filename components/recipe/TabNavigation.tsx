'use client'

import { cn } from '@/lib/utils'

export type RecipeTab = 'ingredients' | 'instructions' | 'reviews'

export interface TabNavigationProps {
  activeTab: RecipeTab
  onTabChange: (tab: RecipeTab) => void
  className?: string
}

const TABS: { id: RecipeTab; label: string }[] = [
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'instructions', label: 'Instructions' },
  { id: 'reviews', label: 'Reviews' },
]

/**
 * TabNavigation Component
 * Three tabs for Ingredients, Instructions, and Reviews with underline indicator
 * Requirements: 9.5 - Tabbed navigation for recipe sections
 */
export function TabNavigation({
  activeTab,
  onTabChange,
  className,
}: TabNavigationProps) {
  return (
    <div className={cn('border-b border-border', className)}>
      <nav className="flex" role="tablist" aria-label="Recipe sections">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex-1 py-3 text-body-md font-medium transition-colors relative',
                isActive
                  ? 'text-brand-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {/* Active underline indicator */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                  style={{
                    animation: 'tab-underline 0.2s ease-out',
                  }}
                />
              )}
            </button>
          )
        })}
      </nav>

      <style jsx>{`
        @keyframes tab-underline {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  )
}
