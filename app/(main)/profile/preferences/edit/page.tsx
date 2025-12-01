'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'
import { usePreferences } from '@/hooks/usePreferences'
import { SelectableChip } from '@/components/ui/SelectableChip'
import { 
  dietaryOptions, 
  cuisineOptions, 
  allergyCategories, 
  cookingSkillLevels 
} from '@/lib/constants/preferences'

type TabId = 'dietary' | 'cuisine' | 'allergies' | 'skills'

const tabs = [
  { id: 'dietary' as TabId, label: 'Dietary' },
  { id: 'cuisine' as TabId, label: 'Cuisine' },
  { id: 'allergies' as TabId, label: 'Allergies' },
  { id: 'skills' as TabId, label: 'Skills' },
]

function PreferencesEditSkeleton() {
  return (
    <div className="w-full px-6 py-8 animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="h-10 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="mb-8 h-8 w-40 rounded bg-gray-200" />
      <div className="mb-6 flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 rounded bg-gray-200" />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 w-28 rounded-full bg-gray-200" />
        ))}
      </div>
    </div>
  )
}

export default function PreferencesEditPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map())
  
  const { preferences, loading, updatePreferences } = usePreferences()
  
  const [activeTab, setActiveTab] = useState<TabId>('dietary')
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Local state for editing
  const [dietary, setDietary] = useState<string[]>([])
  const [cuisine, setCuisine] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [cookingSkill, setCookingSkill] = useState<string>('Beginner')
  
  // Allergy search
  const [allergySearch, setAllergySearch] = useState('')
  const [activeAllergyTab, setActiveAllergyTab] = useState('nuts')

  // Initialize from preferences
  useEffect(() => {
    if (preferences) {
      setDietary(preferences.dietary || [])
      setCuisine(preferences.cuisine || [])
      setAllergies(preferences.allergies || [])
      setCookingSkill(preferences.cooking_skill || 'Beginner')
    }
  }, [preferences])

  // Track changes
  useEffect(() => {
    if (!preferences) return
    
    const changed = 
      JSON.stringify(dietary.sort()) !== JSON.stringify((preferences.dietary || []).sort()) ||
      JSON.stringify(cuisine.sort()) !== JSON.stringify((preferences.cuisine || []).sort()) ||
      JSON.stringify(allergies.sort()) !== JSON.stringify((preferences.allergies || []).sort()) ||
      cookingSkill !== (preferences.cooking_skill || 'Beginner')
    
    setHasChanges(changed)
  }, [dietary, cuisine, allergies, cookingSkill, preferences])

  // Animate tab indicator
  useEffect(() => {
    const activeButton = tabRefs.current.get(activeTab)
    if (!activeButton || !indicatorRef.current || !tabsRef.current) return

    const tabsRect = tabsRef.current.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()

    gsap.to(indicatorRef.current, {
      x: buttonRect.left - tabsRect.left,
      width: buttonRect.width,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [activeTab])

  // Initial animation
  useEffect(() => {
    if (!containerRef.current || loading) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')
    gsap.fromTo(
      sections,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
    )
  }, [loading])

  const handleBack = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updatePreferences({
        dietary,
        cuisine,
        allergies,
        cooking_skill: cookingSkill,
      })
      router.back()
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleDietary = (id: string) => {
    setDietary(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const toggleCuisine = (id: string) => {
    setCuisine(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleAllergy = (item: string) => {
    setAllergies(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    )
  }

  const activeAllergyCategory = allergyCategories.find(c => c.id === activeAllergyTab)
  const filteredAllergyItems = useMemo(() => {
    if (!activeAllergyCategory) return []
    if (!allergySearch.trim()) return activeAllergyCategory.items
    return activeAllergyCategory.items.filter(item =>
      item.toLowerCase().includes(allergySearch.toLowerCase())
    )
  }, [activeAllergyCategory, allergySearch])

  if (loading) {
    return <PreferencesEditSkeleton />
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div ref={containerRef} className="relative z-10 w-full px-6 py-8 pb-24">
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
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={cn(
              'px-4 py-2 rounded-full text-base font-medium transition-all',
              hasChanges && !saving
                ? 'bg-brand-primary text-white hover:bg-brand-primary-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Title */}
        <h1 data-animate className="mb-6 text-2xl font-bold" style={{ color: '#282828' }}>
          Edit Preferences
        </h1>

        {/* Tabs */}
        <div data-animate className="mb-6 -mx-6 px-6 overflow-x-auto scrollbar-hide">
          <div ref={tabsRef} className="relative flex gap-6">
            <div
              ref={indicatorRef}
              className="absolute bottom-0 h-0.5 bg-brand-primary rounded-full"
            />
            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el)
                }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'whitespace-nowrap pb-3 text-sm font-medium transition-colors duration-200',
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-100 -z-10" />
          </div>
        </div>

        {/* Content */}
        <div data-animate>
          {activeTab === 'dietary' && (
            <div className="flex flex-wrap gap-3">
              {dietaryOptions.map((option) => (
                <SelectableChip
                  key={option.id}
                  label={option.label}
                  icon={option.icon}
                  selected={dietary.includes(option.id)}
                  onToggle={() => toggleDietary(option.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'cuisine' && (
            <div className="flex flex-wrap gap-3">
              {cuisineOptions.map((option) => (
                <SelectableChip
                  key={option.id}
                  label={option.label}
                  icon={option.icon}
                  selected={cuisine.includes(option.id)}
                  onToggle={() => toggleCuisine(option.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'allergies' && (
            <>
              {/* Search */}
              <div className="relative mb-4">
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
                  value={allergySearch}
                  onChange={(e) => setAllergySearch(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 pl-12 text-base placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                />
              </div>

              {/* Category tabs */}
              <div className="mb-4 -mx-6 px-6 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2">
                  {allergyCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveAllergyTab(cat.id)
                        setAllergySearch('')
                      }}
                      className={cn(
                        'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                        activeAllergyTab === cat.id
                          ? 'bg-brand-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-2">
                {filteredAllergyItems.map((item) => {
                  const isSelected = allergies.includes(item)
                  return (
                    <button
                      key={item}
                      onClick={() => toggleAllergy(item)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      )}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {item}
                    </button>
                  )
                })}
              </div>

              {allergies.length > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {allergies.length} allerg{allergies.length === 1 ? 'y' : 'ies'} selected
                </p>
              )}
            </>
          )}

          {activeTab === 'skills' && (
            <div className="flex flex-wrap gap-3">
              {cookingSkillLevels.map((skill) => {
                const isSelected = cookingSkill === skill.id
                return (
                  <button
                    key={skill.id}
                    onClick={() => setCookingSkill(skill.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 p-4 transition-all',
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Image
                      src={skill.icon}
                      alt={skill.label}
                      width={40}
                      height={40}
                    />
                    <div className="text-left">
                      <p className="font-medium" style={{ color: '#282828' }}>{skill.label}</p>
                      <p className="text-xs" style={{ color: '#656565' }}>{skill.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
