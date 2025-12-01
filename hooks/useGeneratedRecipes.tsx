'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { type RecipeTags } from '@/types/recipe-tags'

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
  addGeneratedRecipe: (recipe: Omit<GeneratedRecipeItem, 'createdAt'>) => Promise<void>
  removeGeneratedRecipe: (id: string) => Promise<void>
  getRecipesByCategory: (category: string) => GeneratedRecipeItem[]
  getNewRecipes: (limit?: number) => GeneratedRecipeItem[]
  clearAllRecipes: () => Promise<void>
  loading: boolean
}

const GeneratedRecipesContext = createContext<GeneratedRecipesContextType | null>(null)

export function GeneratedRecipesProvider({ children }: { children: ReactNode }) {
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipeItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const supabase = createClient()

  // Fetch recipes from Supabase when user is logged in
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) {
        setGeneratedRecipes([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('user_generated_recipes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to fetch generated recipes:', error)
          setGeneratedRecipes([])
        } else {
          // Transform database format to app format
          const recipes: GeneratedRecipeItem[] = (data || []).map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description || '',
            imageUrl: row.image_url || '',
            rating: row.rating || 5,
            prepTime: row.prep_time,
            cookTime: row.cook_time,
            totalTime: row.total_time,
            difficulty: row.difficulty,
            calories: row.calories,
            protein: row.protein,
            carbs: row.carbs,
            fat: row.fat,
            fiber: row.fiber,
            sodium: row.sodium,
            servings: row.servings,
            cuisine: row.cuisine,
            mealType: row.meal_type,
            ingredients: row.ingredients || [],
            instructions: row.instructions || [],
            tags: row.tags || {},
            categories: row.categories || [],
            createdAt: row.created_at,
          }))
          setGeneratedRecipes(recipes)
        }
      } catch (e) {
        console.error('Failed to fetch generated recipes:', e)
        setGeneratedRecipes([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [user, supabase])

  const addGeneratedRecipe = useCallback(async (recipe: Omit<GeneratedRecipeItem, 'createdAt'>) => {
    if (!user) {
      console.warn('User not logged in, cannot save recipe')
      return
    }

    try {
      // Transform app format to database format
      const dbRecord = {
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.imageUrl,
        rating: recipe.rating,
        prep_time: recipe.prepTime,
        cook_time: recipe.cookTime,
        total_time: recipe.totalTime,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        fiber: recipe.fiber,
        sodium: recipe.sodium,
        servings: recipe.servings,
        cuisine: recipe.cuisine,
        meal_type: recipe.mealType,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        tags: recipe.tags || {},
        categories: recipe.categories || [],
      }

      const { data, error } = await supabase
        .from('user_generated_recipes')
        .insert(dbRecord)
        .select()
        .single()

      if (error) {
        console.error('Failed to save generated recipe:', error)
        return
      }

      // Add to local state
      const newRecipe: GeneratedRecipeItem = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        imageUrl: data.image_url || '',
        rating: data.rating || 5,
        prepTime: data.prep_time,
        cookTime: data.cook_time,
        totalTime: data.total_time,
        difficulty: data.difficulty,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        sodium: data.sodium,
        servings: data.servings,
        cuisine: data.cuisine,
        mealType: data.meal_type,
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        tags: data.tags || {},
        categories: data.categories || [],
        createdAt: data.created_at,
      }

      setGeneratedRecipes(prev => [newRecipe, ...prev])
    } catch (e) {
      console.error('Failed to save generated recipe:', e)
    }
  }, [user, supabase])

  const removeGeneratedRecipe = useCallback(async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_generated_recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to delete generated recipe:', error)
        return
      }

      setGeneratedRecipes(prev => prev.filter(r => r.id !== id))
    } catch (e) {
      console.error('Failed to delete generated recipe:', e)
    }
  }, [user, supabase])

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

  const clearAllRecipes = useCallback(async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_generated_recipes')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to clear generated recipes:', error)
        return
      }

      setGeneratedRecipes([])
    } catch (e) {
      console.error('Failed to clear generated recipes:', e)
    }
  }, [user, supabase])

  return (
    <GeneratedRecipesContext.Provider
      value={{
        generatedRecipes,
        addGeneratedRecipe,
        removeGeneratedRecipe,
        getRecipesByCategory,
        getNewRecipes,
        clearAllRecipes,
        loading,
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
