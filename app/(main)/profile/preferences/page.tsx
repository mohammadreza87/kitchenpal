'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'

// Mock saved preferences - in real app, this would come from user's profile/database
const savedPreferences = {
  dietary: ['Dairy-Free', 'Mediterranean'],
  cuisine: ['Italian', 'Chinese', 'Japanese', 'Spanish Tapas'],
  allergies: ['Peanuts', 'Sesame', 'Dairy', 'Nuts'],
  cookingSkill: 'Enthusiast',
}

interface PreferenceChipProps {
  label: string
}

function PreferenceChip({ label }: PreferenceChipProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-amber-50 px-3 py-2">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
        <svg
          className="h-3 w-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  )
}

export default function PreferencesSummaryPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

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
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    router.push('/preferences')
  }

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
              src="/assets/icons/Edit.svg"
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
            {savedPreferences.dietary.map((pref) => (
              <PreferenceChip key={pref} label={pref} />
            ))}
          </div>
        </section>

        {/* Cuisine Preferences */}
        <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
          <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
            Cuisine Preferences
          </h2>
          <div className="flex flex-wrap gap-2">
            {savedPreferences.cuisine.map((pref) => (
              <PreferenceChip key={pref} label={pref} />
            ))}
          </div>
        </section>

        {/* Allergy & Dietary Restrictions */}
        <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
          <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
            Allergy & Dietary Restrictions
          </h2>
          <div className="flex flex-wrap gap-2">
            {savedPreferences.allergies.map((pref) => (
              <PreferenceChip key={pref} label={pref} />
            ))}
          </div>
        </section>

        {/* Cooking Skills */}
        <section data-animate className="mb-6">
          <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
            Cooking Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            <PreferenceChip label={savedPreferences.cookingSkill} />
          </div>
        </section>
      </div>
    </div>
  )
}
