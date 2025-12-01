'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { gsap } from '@/lib/gsap'
import { allergyCategories } from '@/lib/constants/preferences'
import { useOnboardingPreferences } from '@/hooks/useOnboardingPreferences'

export default function AllergiesPage() {
  const { allergies, toggleAllergy } = useOnboardingPreferences()
  const [activeTab, setActiveTab] = useState('nuts')
  const [searchQuery, setSearchQuery] = useState('')

  const tabsRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const activeCategory = allergyCategories.find(c => c.id === activeTab)

  const filteredItems = useMemo(() => {
    if (!activeCategory) return []
    if (!searchQuery.trim()) return activeCategory.items
    return activeCategory.items.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [activeCategory, searchQuery])

  // Animate indicator on tab change
  useEffect(() => {
    const activeButton = tabRefs.current.get(activeTab)
    if (!activeButton || !indicatorRef.current || !tabsRef.current) return

    const tabsRect = tabsRef.current.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()

    gsap.to(indicatorRef.current, {
      x: buttonRect.left - tabsRect.left + tabsRef.current.scrollLeft,
      width: buttonRect.width,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [activeTab])

  // Animate content on tab change
  useEffect(() => {
    if (!contentRef.current) return

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    )
  }, [activeTab])

  // Set initial indicator position
  useEffect(() => {
    const activeButton = tabRefs.current.get(activeTab)
    if (!activeButton || !indicatorRef.current || !tabsRef.current) return

    const tabsRect = tabsRef.current.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()

    gsap.set(indicatorRef.current, {
      x: buttonRect.left - tabsRect.left,
      width: buttonRect.width,
    })
  }, [])

  const handleTabClick = (categoryId: string) => {
    setActiveTab(categoryId)
    setSearchQuery('')

    const activeButton = tabRefs.current.get(categoryId)
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }

  return (
    <>
      <section className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Allergy & Dietary Restrictions</h1>
        <p className="mb-6 text-muted-foreground">
          Let us know about your allergies and dietary restrictions to tailor recipes to your needs.
        </p>

        {/* Selected count */}
        {allergies.length > 0 && (
          <p className="mb-4 text-sm text-brand-primary">
            {allergies.length} item{allergies.length !== 1 ? 's' : ''} selected
          </p>
        )}

        {/* Search Input */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <Image
              src="/assets/icons/Search.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-40"
            />
          </div>
          <input
            type="text"
            placeholder="Search allergies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 pl-12 text-base placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
          />
        </div>

        {/* Animated Tabs */}
        <div className="mb-6 -mx-6 px-6 overflow-x-auto scrollbar-hide">
          <div ref={tabsRef} className="relative flex gap-6">
            <div
              ref={indicatorRef}
              className="absolute bottom-0 h-0.5 bg-brand-primary rounded-full"
            />

            {allergyCategories.map((category) => (
              <button
                key={category.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(category.id, el)
                }}
                onClick={() => handleTabClick(category.id)}
                className={cn(
                  'whitespace-nowrap pb-3 text-sm font-medium transition-colors duration-200',
                  activeTab === category.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {category.label}
              </button>
            ))}

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-100 -z-10" />
          </div>
        </div>

        {/* Items Grid */}
        <div ref={contentRef} className="flex flex-wrap gap-3">
          {filteredItems.map((item) => {
            const isSelected = allergies.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleAllergy(item)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-200 active:scale-95',
                  isSelected
                    ? 'border-gray-300 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full bg-foreground transition-all duration-200',
                    isSelected
                      ? 'h-4 w-4 opacity-100 scale-100 animate-check-pop'
                      : 'h-0 w-0 opacity-0 scale-50'
                  )}
                >
                  <svg
                    className={cn(
                      'h-2 w-2 text-white transition-all duration-150',
                      isSelected ? 'opacity-100' : 'opacity-0'
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
                        strokeDashoffset: isSelected ? 0 : 24,
                        transition: 'stroke-dashoffset 0.25s ease-out 0.1s'
                      }}
                    />
                  </svg>
                </div>

                <span className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  isSelected ? 'text-foreground' : 'text-gray-700'
                )}>
                  {item}
                </span>
              </button>
            )
          })}
        </div>

        {filteredItems.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No items found for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </section>
    </>
  )
}
