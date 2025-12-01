'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { usePreferences } from '@/hooks/usePreferences'
import { PreferenceChip } from '@/components/profile'
import { dietaryOptions, cuisineOptions } from '@/lib/constants/preferences'

function PreferencesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-8 animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="h-10 w-10 rounded-full bg-gray-200" />
      </div>
      <div className="mb-8 h-8 w-32 rounded bg-gray-200" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mb-6 border-b pb-6 border-gray-100">
          <div className="mb-4 h-4 w-32 rounded bg-gray-200" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-10 w-24 rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PreferencesSummaryPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { preferences, loading } = usePreferences()

  useEffect(() => {
    if (!containerRef.current || loading) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      sections,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      }
    )
  }, [loading])

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    router.push('/profile/preferences/edit')
  }

  if (loading) {
    return <PreferencesSkeleton />
  }

  const dietary = preferences?.dietary || []
  const cuisine = preferences?.cuisine || []
  const allergies = preferences?.allergies || []
  const cookingSkill = preferences?.cooking_skill || 'Beginner'

  // Get display labels from constants
  const getDietaryLabel = (id: string) =>
    dietaryOptions.find(o => o.id === id)?.label || id
  const getCuisineLabel = (id: string) =>
    cuisineOptions.find(o => o.id === id)?.label || id

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Shape */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 flex items-end justify-center">
        <img
          src="/assets/backgrounds/background-shape-3.svg"
          alt=""
          className="h-auto w-full translate-y-1/2 opacity-30 md:w-3/4 lg:w-1/2"
        />
      </div>

      <div ref={containerRef} className="relative z-10 mx-auto w-full max-w-md px-6 py-8">
        {/* Header */}
        <div data-animate className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <Image
              src="/assets/icons/Arrow-Left.svg"
              alt="Back"
              width={24}
              height={24}
            />
          </button>
          <button
            onClick={handleEdit}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <Image
              src="/assets/icons/Edit-2.svg"
              alt="Edit"
              width={24}
              height={24}
            />
          </button>
        </div>

        {/* Title */}
        <h1 data-animate className="mb-8 text-2xl font-bold" style={{ color: '#282828' }}>Preferences</h1>

        {/* Dietary Preferences */}
        <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
          <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
            Dietary Preferences
          </h2>
          <div className="flex flex-wrap gap-2">
            {dietary.length > 0 ? (
              dietary.map((pref) => (
                <PreferenceChip key={pref} label={getDietaryLabel(pref)} />
              ))
            ) : (
              <p className="text-sm text-gray-400">No dietary preferences set</p>
            )}
          </div>
        </section>

        {/* Cuisine Preferences */}
        <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
          <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
            Cuisine Preferences
          </h2>
          <div className="flex flex-wrap gap-2">
            {cuisine.length > 0 ? (
              cuisine.map((pref) => (
                <PreferenceChip key={pref} label={getCuisineLabel(pref)} />
              ))
            ) : (
              <p className="text-sm text-gray-400">No cuisine preferences set</p>
            )}
          </div>
        </section>

        {/* Allergy & Dietary Restrictions */}
        <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
          <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
            Allergy & Dietary Restrictions
          </h2>
          <div className="flex flex-wrap gap-2">
            {allergies.length > 0 ? (
              allergies.map((pref) => (
                <PreferenceChip key={pref} label={pref} />
              ))
            ) : (
              <p className="text-sm text-gray-400">No allergies set</p>
            )}
          </div>
        </section>

        {/* Cooking Skills */}
        <section data-animate className="mb-6">
          <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
            Cooking Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            <PreferenceChip label={cookingSkill} />
          </div>
        </section>
      </div>
    </div>
  )
}
