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
  // User info for social features
  userId?: string
  isOwn?: boolean
}

interface GeneratedRecipesContextType {
  generatedRecipes: GeneratedRecipeItem[]
  addGeneratedRecipe: (recipe: Omit<GeneratedRecipeItem, 'createdAt'>) => Promise<void>
  removeGeneratedRecipe: (id: string) => Promise<void>
  getRecipesByCategory: (category: string) => GeneratedRecipeItem[]
  getNewRecipes: (limit?: number) => GeneratedRecipeItem[]
  clearAllRecipes: () => Promise<void>
  regenerateImage: (id: string) => void
  regeneratingIds: Set<string>
  loading: boolean
}

const GeneratedRecipesContext = createContext<GeneratedRecipesContextType | null>(null)

export function GeneratedRecipesProvider({ children }: { children: ReactNode }) {
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set())
  const { user } = useUser()
  const supabase = createClient()

  // Fetch ALL recipes from Supabase (public feed)
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true)
        // Fetch all recipes from all users (public feed)
        const { data, error } = await supabase
          .from('user_generated_recipes')
          .select('*')
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
            userId: row.user_id,
            isOwn: user ? row.user_id === user.id : false,
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

      // Also insert into public recipes table for discovery
      try {
        await supabase.from('recipes').insert({
          id: data.id, // keep IDs aligned so favorites FK works
          name: recipe.title,
          author_id: user.id,
          author_name: user.user_metadata?.full_name || user.email || 'KitchenPal User',
          description: recipe.description,
          image_url: recipe.imageUrl,
          rating: recipe.rating,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          calories: recipe.calories,
          difficulty: recipe.difficulty,
        })
      } catch (err) {
        console.error('Failed to insert generated recipe into public recipes:', err)
      }
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

  const regenerateImage = useCallback((id: string) => {
    // Find the recipe
    const recipe = generatedRecipes.find(r => r.id === id)
    if (!recipe) {
      console.error('Recipe not found for image regeneration')
      return
    }

    // Check if user owns this recipe - only allow regeneration for owned recipes
    if (!user || recipe.userId !== user.id) {
      console.error('Cannot regenerate image: you do not own this recipe')
      window.dispatchEvent(new CustomEvent('image-regenerated', {
        detail: { id, title: recipe.title, success: false, error: 'You can only regenerate images for your own recipes' }
      }))
      return
    }

    // Check if already regenerating
    if (regeneratingIds.has(id)) {
      return
    }

    // Add to regenerating set
    setRegeneratingIds(prev => new Set(prev).add(id))

    // Fire and forget - runs in background
    const doRegenerate = async () => {
      try {
        // Call the image generation API (server handles persistence to Supabase storage)
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeName: recipe.title,
            description: recipe.description,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to regenerate image')
        }

        const data = await response.json()
        const newImageUrl = data.imageUrl

        if (!newImageUrl || newImageUrl.includes('placeholder')) {
          throw new Error('Image generation returned placeholder')
        }

        console.log('[Regenerate] Got new image URL:', newImageUrl)
        console.log('[Regenerate] User:', user?.id, 'Recipe userId:', recipe.userId, 'Recipe isOwn:', recipe.isOwn)

        // The API now returns a Supabase storage URL, use it directly
        // Update the recipe in the database
        // Update user_generated_recipes table
        const { data: updateData, error, count } = await supabase
          .from('user_generated_recipes')
          .update({ image_url: newImageUrl })
          .eq('id', id)
          .select()

        if (error) {
          console.error('[Regenerate] Failed to update image URL in user_generated_recipes:', error)
        } else {
          console.log('[Regenerate] user_generated_recipes update result:', updateData?.length || 0, 'rows affected')
        }

        // Also update the public recipes table
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .update({ image_url: newImageUrl })
          .eq('id', id)
          .select()

        if (recipesError) {
          console.error('[Regenerate] Failed to update image URL in recipes table:', recipesError)
        } else {
          console.log('[Regenerate] recipes table update result:', recipesData?.length || 0, 'rows affected')
        }

        // Update local state
        setGeneratedRecipes(prev =>
          prev.map(r => (r.id === id ? { ...r, imageUrl: newImageUrl } : r))
        )

        // Dispatch custom event for toast notification
        window.dispatchEvent(new CustomEvent('image-regenerated', {
          detail: { id, title: recipe.title, success: true }
        }))
      } catch (e) {
        console.error('Failed to regenerate image:', e)
        // Dispatch error event
        window.dispatchEvent(new CustomEvent('image-regenerated', {
          detail: { id, title: recipe.title, success: false }
        }))
      } finally {
        // Remove from regenerating set
        setRegeneratingIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    }

    // Start background regeneration
    doRegenerate()
  }, [generatedRecipes, regeneratingIds, user, supabase])

  return (
    <GeneratedRecipesContext.Provider
      value={{
        generatedRecipes,
        addGeneratedRecipe,
        removeGeneratedRecipe,
        getRecipesByCategory,
        getNewRecipes,
        clearAllRecipes,
        regenerateImage,
        regeneratingIds,
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
