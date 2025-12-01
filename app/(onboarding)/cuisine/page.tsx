'use client'

import { SelectableChip } from '@/components/ui/SelectableChip'
import { cuisineOptions } from '@/lib/constants/preferences'
import { useOnboardingPreferences } from '@/hooks/useOnboardingPreferences'

export default function CuisinePreferencesPage() {
  const { cuisine, toggleCuisine } = useOnboardingPreferences()

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
              selected={cuisine.includes(option.id)}
              onToggle={() => toggleCuisine(option.id)}
            />
          ))}
        </div>
      </section>
    </>
  )
}
