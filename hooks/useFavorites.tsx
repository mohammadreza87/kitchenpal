'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'

export interface FavoriteRecipe {
  id: string
  title: string
  description: string
  imageUrl: string
  rating: number
  prepTime?: string
  difficulty?: string
  calories?: number
  categories?: string[]
}

interface FavoritesContextType {
  favorites: FavoriteRecipe[]
  savedIds: Set<string>
  loading: boolean
  error: string | null
  isSaved: (recipeId: string) => boolean
  toggleFavorite: (recipeId: string) => Promise<boolean>
  refreshFavorites: () => Promise<void>
  getFavoritesByCategory: (category: string) => FavoriteRecipe[]
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load favorites when user changes
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setSavedIds(new Set())
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get all favorite recipes from user_generated_recipes
      const { data, error: fetchError } = await supabase
        .from('user_generated_recipes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching favorites:', fetchError)
        setError('Failed to load favorites')
        setFavorites([])
        setSavedIds(new Set())
        return
      }

      const favoriteRecipes: FavoriteRecipe[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        imageUrl: row.image_url || '',
        rating: row.rating || 5,
        prepTime: row.prep_time,
        difficulty: row.difficulty,
        calories: row.calories,
        categories: row.categories || [],
      }))

      setFavorites(favoriteRecipes)
      setSavedIds(new Set(favoriteRecipes.map(r => r.id)))
    } catch (err) {
      console.error('Error loading favorites:', err)
      setError('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // Check if a recipe is saved
  const isSaved = useCallback((recipeId: string) => {
    return savedIds.has(recipeId)
  }, [savedIds])

  // Toggle favorite status
  const toggleFavorite = useCallback(async (recipeId: string): Promise<boolean> => {
    if (!user) {
      setError('Please log in to save recipes')
      return false
    }

    const wasSaved = savedIds.has(recipeId)

    // Optimistic update
    const newSavedIds = new Set(savedIds)
    if (wasSaved) {
      newSavedIds.delete(recipeId)
      setFavorites(prev => prev.filter(f => f.id !== recipeId))
    } else {
      newSavedIds.add(recipeId)
    }
    setSavedIds(newSavedIds)

    try {
      // Update is_favorite in database
      const { error: updateError } = await supabase
        .from('user_generated_recipes')
        .update({ is_favorite: !wasSaved })
        .eq('id', recipeId)
        .eq('user_id', user.id)

      if (updateError) {
        // Revert optimistic update
        setSavedIds(savedIds)
        if (!wasSaved) {
          setFavorites(prev => prev.filter(f => f.id !== recipeId))
        }
        console.error('Error toggling favorite:', updateError)
        setError('Failed to update favorite')
        return false
      }

      // If adding to favorites, fetch the recipe data
      if (!wasSaved) {
        const { data: recipeData } = await supabase
          .from('user_generated_recipes')
          .select('*')
          .eq('id', recipeId)
          .single()

        if (recipeData) {
          const newFavorite: FavoriteRecipe = {
            id: recipeData.id,
            title: recipeData.title,
            description: recipeData.description || '',
            imageUrl: recipeData.image_url || '',
            rating: recipeData.rating || 5,
            prepTime: recipeData.prep_time,
            difficulty: recipeData.difficulty,
            calories: recipeData.calories,
            categories: recipeData.categories || [],
          }
          setFavorites(prev => [newFavorite, ...prev])
        }
      }

      return true
    } catch (err) {
      // Revert optimistic update
      setSavedIds(savedIds)
      console.error('Error toggling favorite:', err)
      setError('Failed to update favorite')
      return false
    }
  }, [user, savedIds, supabase])

  // Refresh favorites
  const refreshFavorites = useCallback(async () => {
    await loadFavorites()
  }, [loadFavorites])

  // Get favorites by category
  const getFavoritesByCategory = useCallback((category: string): FavoriteRecipe[] => {
    const normalizedCategory = category.toLowerCase()
    return favorites.filter(recipe => {
      if (recipe.categories && recipe.categories.length > 0) {
        return recipe.categories.some(cat => cat.toLowerCase().includes(normalizedCategory))
      }
      // Fallback: check title and description
      return recipe.title.toLowerCase().includes(normalizedCategory) ||
        recipe.description.toLowerCase().includes(normalizedCategory)
    })
  }, [favorites])

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        savedIds,
        loading,
        error,
        isSaved,
        toggleFavorite,
        refreshFavorites,
        getFavoritesByCategory,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)

  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }

  return context
}
