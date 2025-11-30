'use client'

import { useState } from 'react'
import { SelectableChip } from '@/components/ui/SelectableChip'

const dietaryOptions = [
  { id: 'dairy-free', label: 'Dairy-Free', icon: '/assets/illustrations/food/Dairy-Free Diet Dish.svg' },
  { id: 'keto', label: 'Keto', icon: '/assets/illustrations/food/Keto Diet Dish.svg' },
  { id: 'low-fat', label: 'Low-Fat', icon: '/assets/illustrations/food/Low-Fat Diet Dish.svg' },
  { id: 'low-carb', label: 'Low-Carb', icon: '/assets/illustrations/food/Low-Carb Diet Dish.svg' },
  { id: 'vegan', label: 'Vegan', icon: '/assets/illustrations/food/Vegan Diet Dish.svg' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '/assets/illustrations/food/Vegan Diet Dish_1.svg' },
  { id: 'mediterranean-diet', label: 'Mediterranean', icon: '/assets/illustrations/food/Mediterranean Diet Dish.svg' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '/assets/illustrations/food/Gluten-Free Diet Dish.svg' },
]

export default function DietaryPreferencesPage() {
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])

  const toggleDietary = (id: string) => {
    setSelectedDietary((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

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
              selected={selectedDietary.includes(option.id)}
              onToggle={() => toggleDietary(option.id)}
            />
          ))}
        </div>
      </section>
    </>
  )
}
