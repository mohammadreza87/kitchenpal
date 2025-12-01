'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { RecipeListCard } from '@/components/home'
import { useFavorites, useGeneratedRecipes } from '@/hooks'

// Category title mapping
const categoryTitles: Record<string, string> = {
  new: 'New Recipes',
  trending: 'Trending',
  'low-carb': 'Low-Carb & Keto',
  french: 'French Cuisine',
  italian: 'Italian Cuisine',
  asian: 'Asian Cuisine',
  vegetarian: 'Vegetarian & Vegan',
  mexican: 'Mexican Cuisine',
  indian: 'Indian Cuisine',
  japanese: 'Japanese Cuisine',
  mediterranean: 'Mediterranean',
  american: 'American Cuisine',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  dessert: 'Desserts',
  desserts: 'Desserts',
  snack: 'Snacks',
  quick: 'Quick & Easy',
  healthy: 'Healthy Choices',
}

// Category search expansion - maps URL categories to related search terms
const categorySearchTerms: Record<string, string[]> = {
  quick: ['quick', 'easy', 'fast', '15-min', '30-min'],
  healthy: ['healthy', 'low-carb', 'keto', 'salad', 'vegetable', 'light', 'lean'],
  desserts: ['dessert', 'sweet', 'cake', 'cookie', 'chocolate', 'pastry'],
  'low-carb': ['low-carb', 'keto', 'low-carbohydrate'],
  vegetarian: ['vegetarian', 'vegan', 'plant-based', 'meatless'],
}

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const category = params.category as string
  const containerRef = useRef<HTMLDivElement>(null)
  const { isSaved, toggleFavorite } = useFavorites()
  const { generatedRecipes } = useGeneratedRecipes()

  // Get recipes based on category
  const recipes = useMemo(() => {
    if (category === 'new') {
      // Show all generated recipes
      return generatedRecipes.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        rating: r.rating,
        prepTime: r.prepTime || '30 mins',
        servings: r.servings || 4,
        calories: r.calories,
        difficulty: r.difficulty,
      }))
    }

    // Get search terms for this category (or just the category itself)
    const searchTerms = categorySearchTerms[category] || [category]

    // Filter recipes that match any of the search terms
    const seen = new Set<string>()
    const categoryRecipes = generatedRecipes.filter(recipe => {
      // Skip if already seen
      if (seen.has(recipe.id)) return false

      // Check if any category matches any search term
      const matchesCategory = recipe.categories.some(cat =>
        searchTerms.some(term => cat.toLowerCase().includes(term.toLowerCase()))
      )

      // For 'quick' category, also check totalTime or difficulty
      if (category === 'quick' && !matchesCategory) {
        const isQuick = (recipe.totalTime && recipe.totalTime <= 30) ||
                        recipe.difficulty?.toLowerCase() === 'easy'
        if (isQuick) {
          seen.add(recipe.id)
          return true
        }
      }

      // For 'healthy' category, also check calories
      if (category === 'healthy' && !matchesCategory) {
        const isHealthy = recipe.calories && recipe.calories < 400
        if (isHealthy) {
          seen.add(recipe.id)
          return true
        }
      }

      if (matchesCategory) {
        seen.add(recipe.id)
        return true
      }

      return false
    })

    return categoryRecipes.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      rating: r.rating,
      prepTime: r.prepTime || '30 mins',
      servings: r.servings || 4,
      calories: r.calories,
      difficulty: r.difficulty,
    }))
  }, [category, generatedRecipes])

  const title = categoryTitles[category] || category.charAt(0).toUpperCase() + category.slice(1)

  useEffect(() => {
    if (!containerRef.current) return

    const cards = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      cards,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.out',
      }
    )
  }, [category, recipes])

  const handleToggleSave = async (id: string) => {
    await toggleFavorite(id)
  }

  const handleCreateRecipe = () => {
    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <Image
              src="/assets/icons/Arrow-Left.svg"
              alt="Back"
              width={20}
              height={20}
            />
          </button>
          <h1 className="text-lg font-semibold" style={{ color: '#282828' }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Recipe List */}
      <div ref={containerRef} className="px-4">
        {recipes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recipes.map((recipe) => (
              <div key={recipe.id} data-animate>
                <RecipeListCard
                  {...recipe}
                  isSaved={isSaved(recipe.id)}
                  onToggleSave={handleToggleSave}
                />
              </div>
            ))}
          </div>
        ) : (
          <div data-animate className="mt-8">
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <div className="mb-4">
                <Image
                  src="/assets/icons/Chef's Hat.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="mx-auto opacity-40"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No {title.toLowerCase()} yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Generate recipes to see them here
              </p>
              <button
                onClick={handleCreateRecipe}
                className="px-6 py-2.5 rounded-full bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary-dark transition-colors"
              >
                Create Recipe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
