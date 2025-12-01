'use client'

import { SelectableChip } from '@/components/ui/SelectableChip'
import { dietaryOptions } from '@/lib/constants/preferences'
import { useOnboardingPreferences } from '@/hooks/useOnboardingPreferences'

export default function DietaryPreferencesPage() {
  const { dietary, toggleDietary } = useOnboardingPreferences()

  return (
    <>
      <section className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Dietary Preferences</h1>
        <p className="mb-6 text-muted-foreground">
          Help us customize your recipes by sharing your dietary preferences.
        </p>

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
      </section>
    </>
  )
}
