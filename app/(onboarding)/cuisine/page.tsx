'use client'

import { useState } from 'react'
import { SelectableChip } from '@/components/ui/SelectableChip'

const cuisineOptions = [
  { id: 'chinese', label: 'Chinese', icon: '/assets/illustrations/food/Chinese Food.svg' },
  { id: 'thai', label: 'Thai', icon: '/assets/illustrations/food/Thai Food.svg' },
  { id: 'japanese', label: 'Japanese', icon: '/assets/illustrations/food/Japanese Dishes.svg' },
  { id: 'italian', label: 'Italian', icon: '/assets/illustrations/food/Italian Cuisine.svg' },
  { id: 'french', label: 'French', icon: '/assets/illustrations/food/French Cuisine.svg' },
  { id: 'mexican', label: 'Mexican', icon: '/assets/illustrations/food/Mexican Delights.svg' },
  { id: 'mediterranean', label: 'Mediterranean', icon: '/assets/illustrations/food/Mediterranean Food.svg' },
  { id: 'indian', label: 'Indian', icon: '/assets/illustrations/food/Indian Food.svg' },
  { id: 'middle-eastern', label: 'Middle Eastern', icon: '/assets/illustrations/food/Middle Eastern Cuisine.svg' },
  { id: 'spanish', label: 'Spanish Tapas', icon: '/assets/illustrations/food/Spanish Tapas.svg' },
]

export default function CuisinePreferencesPage() {
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([])

  const toggleCuisine = (id: string) => {
    setSelectedCuisine((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <>
      <section className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Cuisine Preferences</h1>
        <p className="mb-6 text-muted-foreground">
          Share your favorite cuisines and the types of meals you enjoy the most.
        </p>

        <div className="flex flex-wrap gap-3">
          {cuisineOptions.map((option) => (
            <SelectableChip
              key={option.id}
              label={option.label}
              icon={option.icon}
              selected={selectedCuisine.includes(option.id)}
              onToggle={() => toggleCuisine(option.id)}
            />
          ))}
        </div>
      </section>
    </>
  )
}
