'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'
import { useGeneratedRecipes, detectRecipeTags } from '@/hooks'
import { flattenTags, type RecipeTags } from '@/types/recipe-tags'
import { SelectableChip } from '@/components/ui/SelectableChip'

// Recipe topic suggestions
const RECIPE_SUGGESTIONS = [
  'A quick healthy breakfast with eggs',
  'Italian pasta dinner for date night',
  'Easy weeknight chicken stir-fry',
  'Comfort food soup for cold days',
  'Kid-friendly vegetable dishes',
  'Low-carb lunch ideas',
]

// Cuisine options
const CUISINE_OPTIONS = [
  { id: 'italian', label: 'Italian' },
  { id: 'asian', label: 'Asian' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'american', label: 'American' },
  { id: 'french', label: 'French' },
  { id: 'indian', label: 'Indian' },
  { id: 'japanese', label: 'Japanese' },
]

// Meal type options
const MEAL_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'appetizer', label: 'Appetizer' },
]

interface RecipeFormTabProps {
  onRecipeGenerated?: () => void
}

export function RecipeFormTab({ onRecipeGenerated }: RecipeFormTabProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { addGeneratedRecipe } = useGeneratedRecipes()

  const [recipeTopic, setRecipeTopic] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null)
  const [quickRecipe, setQuickRecipe] = useState(false)
  const [healthyOptions, setHealthyOptions] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [visibleSuggestions, setVisibleSuggestions] = useState(RECIPE_SUGGESTIONS.slice(0, 2))

  // Animation
  useEffect(() => {
    if (!containerRef.current) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')
    gsap.fromTo(
      sections,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
    )
  }, [])

  const handleMoreIdeas = () => {
    const currentStart = RECIPE_SUGGESTIONS.indexOf(visibleSuggestions[0])
    const nextStart = (currentStart + 2) % RECIPE_SUGGESTIONS.length
    setVisibleSuggestions([
      RECIPE_SUGGESTIONS[nextStart],
      RECIPE_SUGGESTIONS[(nextStart + 1) % RECIPE_SUGGESTIONS.length],
    ])
  }

  const handleSuggestionClick = (suggestion: string) => {
    setRecipeTopic(suggestion)
  }

  const handleGenerate = async () => {
    if (!recipeTopic.trim() && !selectedCuisine && !selectedMeal) return

    setIsGenerating(true)

    try {
      const prompt = buildPrompt()

      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      })

      const chatData = await chatResponse.json()

      if (chatData.error || !chatData.recipes || chatData.recipes.length === 0) {
        throw new Error(chatData.error || 'Failed to generate recipe')
      }

      const recipe = chatData.recipes[0]

      let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'
      try {
        const imageResponse = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeName: recipe.name,
            description: recipe.description,
          }),
        })
        const imageData = await imageResponse.json()
        if (imageData.imageUrl) {
          imageUrl = imageData.imageUrl
        }
      } catch (imgError) {
        console.warn('Image generation failed, using fallback:', imgError)
      }

      const generatedRecipe = {
        id: `generated-${Date.now()}`,
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        imageUrl,
      }

      sessionStorage.setItem('generatedRecipe', JSON.stringify(generatedRecipe))

      const structuredTags: RecipeTags = detectRecipeTags({
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        calories: recipe.calories,
        difficulty: recipe.difficulty,
        cuisine: selectedCuisine || '',
        mealType: selectedMeal || '',
      })

      const categories = flattenTags(structuredTags)
      if (selectedCuisine) categories.push(selectedCuisine.toLowerCase())
      if (selectedMeal) categories.push(selectedMeal.toLowerCase())
      categories.push('new', 'generated')

      addGeneratedRecipe({
        id: generatedRecipe.id,
        title: recipe.name,
        description: recipe.description,
        imageUrl: imageUrl || '',
        rating: 5.0,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cuisine: selectedCuisine || '',
        mealType: selectedMeal || '',
        tags: structuredTags,
        categories: Array.from(new Set(categories)),
      })

      onRecipeGenerated?.()
      router.push('/recipe/generated')
    } catch (error) {
      console.error('Recipe generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const buildPrompt = (): string => {
    let prompt = 'Generate a recipe'

    if (recipeTopic) {
      prompt = `Generate a recipe for: ${recipeTopic}`
    }

    const requirements: string[] = []

    if (selectedCuisine) {
      requirements.push(`Cuisine style: ${selectedCuisine}`)
    }

    if (selectedMeal) {
      requirements.push(`Meal type: ${selectedMeal}`)
    }

    if (quickRecipe) {
      requirements.push('Should be quick to prepare (under 30 minutes)')
    }

    if (healthyOptions) {
      requirements.push('Focus on healthy ingredients and cooking methods')
    }

    if (requirements.length > 0) {
      prompt += `\n\nRequirements:\n- ${requirements.join('\n- ')}`
    }

    prompt += `

IMPORTANT: You MUST respond with a JSON object in this exact format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description of the dish",
      "ingredients": [{"name": "ingredient name", "quantity": 1, "unit": "cup"}],
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "prepTime": "15 mins",
      "cookTime": "30 mins",
      "servings": 4,
      "difficulty": "Easy",
      "calories": 350
    }
  ]
}

Provide exactly one recipe that matches all the requirements.`

    return prompt
  }

  const canGenerate = recipeTopic.trim() || selectedCuisine || selectedMeal

  return (
    <div ref={containerRef} className="flex-1 px-6 pt-10 pb-24">
      {/* Recipe Topic Section */}
      <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
        <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
          Recipe Topic
        </h2>
        <textarea
          placeholder="E.g., A delicious pasta dish with fresh tomatoes and basil..."
          value={recipeTopic}
          onChange={(e) => setRecipeTopic(e.target.value)}
          className="w-full h-24 rounded-xl border border-gray-200 bg-white p-4 text-sm resize-none focus:outline-none focus:border-gray-300 placeholder:text-gray-400"
        />

        {/* Suggestions */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Need inspiration? Try these:</span>
          <button
            onClick={handleMoreIdeas}
            className="text-xs text-brand-primary font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/assets/icons/Rotate-Left.svg"
              alt=""
              width={14}
              height={14}
              className="opacity-80"
            />
            More ideas
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {visibleSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-xs hover:border-gray-300 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      {/* Cuisine Style Section */}
      <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
        <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
          Cuisine Style
        </h2>
        <div className="flex flex-wrap gap-3">
          {CUISINE_OPTIONS.map((option) => (
            <SelectableChip
              key={option.id}
              label={option.label}
              selected={selectedCuisine === option.id}
              onToggle={() =>
                setSelectedCuisine(selectedCuisine === option.id ? null : option.id)
              }
            />
          ))}
        </div>
      </section>

      {/* Meal Type Section */}
      <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
        <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
          Meal Type
        </h2>
        <div className="flex flex-wrap gap-3">
          {MEAL_OPTIONS.map((option) => (
            <SelectableChip
              key={option.id}
              label={option.label}
              selected={selectedMeal === option.id}
              onToggle={() =>
                setSelectedMeal(selectedMeal === option.id ? null : option.id)
              }
            />
          ))}
        </div>
      </section>

      {/* Options Section */}
      <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
        <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
          Options
        </h2>

        {/* Quick Recipe Toggle */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-foreground">Quick Recipe (under 30 min)</span>
          <button
            onClick={() => setQuickRecipe(!quickRecipe)}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              quickRecipe ? 'bg-brand-primary' : 'bg-gray-300'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                quickRecipe ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>

        {/* Healthy Options Toggle */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-foreground">Healthy Options</span>
          <button
            onClick={() => setHealthyOptions(!healthyOptions)}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              healthyOptions ? 'bg-brand-primary' : 'bg-gray-300'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                healthyOptions ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>
      </section>

      {/* Generate Button */}
      <button
        data-animate
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className={cn(
          'w-full py-4 rounded-full font-medium text-base flex items-center justify-center gap-2 transition-all',
          canGenerate && !isGenerating
            ? 'bg-brand-primary text-white hover:bg-brand-primary-dark active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        )}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Recipe'
        )}
      </button>
    </div>
  )
}
