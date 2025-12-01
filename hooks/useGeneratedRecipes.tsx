'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { type RecipeTags, flattenTags, structureTags, createEmptyTags } from '@/types/recipe-tags'

export interface GeneratedRecipeItem {
  id: string
  title: string
  description: string
  imageUrl: string
  rating: number
  prepTime?: string
  cookTime?: string
  totalTime?: number // in minutes
  difficulty?: string
  calories?: number
  protein?: number // grams
  carbs?: number // grams
  fat?: number // grams
  fiber?: number // grams
  sodium?: number // mg
  servings?: number
  ingredients?: Array<{ name: string; quantity: number; unit: string }>
  instructions?: string[]
  cuisine?: string
  mealType?: string
  // Structured tags following 2025 best practices
  tags?: RecipeTags
  // Legacy flat categories for backward compatibility
  categories: string[]
  createdAt: string
}

interface GeneratedRecipesContextType {
  generatedRecipes: GeneratedRecipeItem[]
  addGeneratedRecipe: (recipe: Omit<GeneratedRecipeItem, 'createdAt'>) => void
  removeGeneratedRecipe: (id: string) => void
  getRecipesByCategory: (category: string) => GeneratedRecipeItem[]
  getNewRecipes: (limit?: number) => GeneratedRecipeItem[]
  clearAllRecipes: () => void
}

const LOCAL_STORAGE_KEY = 'kitchenpal_generated_recipes'

const GeneratedRecipesContext = createContext<GeneratedRecipesContextType | null>(null)

export function GeneratedRecipesProvider({ children }: { children: ReactNode }) {
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipeItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setGeneratedRecipes(parsed)
      }
    } catch (e) {
      console.error('Failed to load generated recipes:', e)
    }
  }, [])

  // Save to localStorage whenever recipes change
  const saveToStorage = useCallback((recipes: GeneratedRecipeItem[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recipes))
    } catch (e) {
      console.error('Failed to save generated recipes:', e)
    }
  }, [])

  const addGeneratedRecipe = useCallback((recipe: Omit<GeneratedRecipeItem, 'createdAt'>) => {
    const newRecipe: GeneratedRecipeItem = {
      ...recipe,
      createdAt: new Date().toISOString(),
    }

    setGeneratedRecipes(prev => {
      // Check if recipe already exists (by ID)
      const exists = prev.some(r => r.id === recipe.id)
      if (exists) return prev

      const updated = [newRecipe, ...prev]
      saveToStorage(updated)
      return updated
    })
  }, [saveToStorage])

  const removeGeneratedRecipe = useCallback((id: string) => {
    setGeneratedRecipes(prev => {
      const updated = prev.filter(r => r.id !== id)
      saveToStorage(updated)
      return updated
    })
  }, [saveToStorage])

  const getRecipesByCategory = useCallback((category: string): GeneratedRecipeItem[] => {
    const normalizedCategory = category.toLowerCase()
    return generatedRecipes.filter(recipe =>
      recipe.categories.some(cat => cat.toLowerCase() === normalizedCategory)
    )
  }, [generatedRecipes])

  const getNewRecipes = useCallback((limit = 10): GeneratedRecipeItem[] => {
    // Return most recent recipes
    return generatedRecipes.slice(0, limit)
  }, [generatedRecipes])

  const clearAllRecipes = useCallback(() => {
    setGeneratedRecipes([])
    saveToStorage([])
  }, [saveToStorage])

  return (
    <GeneratedRecipesContext.Provider
      value={{
        generatedRecipes,
        addGeneratedRecipe,
        removeGeneratedRecipe,
        getRecipesByCategory,
        getNewRecipes,
        clearAllRecipes,
      }}
    >
      {children}
    </GeneratedRecipesContext.Provider>
  )
}

export function useGeneratedRecipes() {
  const context = useContext(GeneratedRecipesContext)

  if (!context) {
    throw new Error('useGeneratedRecipes must be used within a GeneratedRecipesProvider')
  }

  return context
}

// Re-export the comprehensive tag detection from the new tag-detector utility
export { detectRecipeTags, detectRecipeTagsFlat, type RecipeDataForTags } from '@/lib/utils/tag-detector'

// Helper function to detect recipe categories based on content
// This is kept for backward compatibility with existing code
export function detectRecipeCategories(recipe: {
  name?: string
  description?: string
  ingredients?: Array<{ name: string }>
  calories?: number
}): string[] {
  // Import the flat tag detection function dynamically to avoid circular deps
  const { detectRecipeTagsFlat } = require('@/lib/utils/tag-detector')

  // Convert to the expected format
  const recipeData = {
    name: recipe.name,
    description: recipe.description,
    ingredients: recipe.ingredients?.map(i => ({ name: i.name })),
    calories: recipe.calories,
  }

  // Get all detected tags
  const tags = detectRecipeTagsFlat(recipeData)

  // Add legacy 'new' and 'generated' markers
  tags.push('new', 'generated')

  return Array.from(new Set(tags))
}
