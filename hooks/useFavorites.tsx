'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useUser } from './useUser'
import {
  getSavedRecipes,
  getSavedRecipeIds,
  toggleSaveRecipe,
  type FavoriteRecipe,
} from '@/lib/services/favorites.service'
import { detectRecipeCategories } from './useGeneratedRecipes'


const LOCAL_STORAGE_KEY = 'kitchenpal_favorites'
const GENERATED_RECIPES_STORAGE_KEY = 'kitchenpal_generated_recipes'

// Helper to check if a recipe ID is a generated recipe (stored locally)
function isLocalRecipeId(id: string): boolean {
  return id.startsWith('generated-')
}

// Helper to get generated recipes from localStorage
function getGeneratedRecipesFromStorage(): Record<string, Omit<FavoriteRecipe, 'savedAt'>> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(GENERATED_RECIPES_STORAGE_KEY)
    if (!stored) return {}
    const recipes = JSON.parse(stored)
    // Convert array to record by ID
    const record: Record<string, Omit<FavoriteRecipe, 'savedAt'>> = {}
    for (const r of recipes) {
      record[r.id] = {
        id: r.id,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        rating: r.rating || 5,
      }
    }
    return record
  } catch {
    return {}
  }
}

// Helper to get local favorites from localStorage (for generated recipes)
function getLocalFavoritesFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

// Helper to save local favorites to localStorage
function saveLocalFavoritesToStorage(ids: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch (e) {
    console.error('Error saving local favorites:', e)
  }
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
  const [localSavedIds, setLocalSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load favorites when user changes
  const loadFavorites = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Load local favorites from localStorage (for generated recipes)
      const localIds = getLocalFavoritesFromStorage()
      setLocalSavedIds(localIds)

      // Get generated recipes and filter to only favorites
      const generatedRecipes = getGeneratedRecipesFromStorage()
      const localFavorites: FavoriteRecipe[] = Array.from(localIds)
        .map(id => {
          const recipe = generatedRecipes[id]
          if (!recipe) return null
          return {
            ...recipe,
            savedAt: new Date().toISOString(),
          }
        })
        .filter((f): f is FavoriteRecipe => f !== null)

      if (!user) {
        // If no user, only show local favorites
        setFavorites(localFavorites)
        setSavedIds(localIds)
        setLoading(false)
        return
      }

      // Load database favorites for logged-in users
      const [dbFavs, dbIds] = await Promise.all([
        getSavedRecipes(),
        getSavedRecipeIds(),
      ])

      // Combine local and database favorites
      const allFavorites = [...localFavorites, ...dbFavs]
      const allIds = new Set([...Array.from(localIds), ...Array.from(dbIds)])

      setFavorites(allFavorites)
      setSavedIds(allIds)
    } catch (err) {
      console.error('Error loading favorites:', err)
      setError('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // Check if a recipe is saved
  const isSaved = useCallback((recipeId: string) => {
    return savedIds.has(recipeId)
  }, [savedIds])

  // Toggle favorite status
  const toggleFavorite = useCallback(async (recipeId: string): Promise<boolean> => {
    // Check if this is a generated recipe (stored locally)
    if (isLocalRecipeId(recipeId)) {
      // Handle generated recipe with localStorage
      const wasSaved = localSavedIds.has(recipeId)
      const newLocalIds = new Set(localSavedIds)

      if (wasSaved) {
        newLocalIds.delete(recipeId)
      } else {
        newLocalIds.add(recipeId)
      }

      setLocalSavedIds(newLocalIds)
      saveLocalFavoritesToStorage(newLocalIds)

      // Update combined savedIds
      const newSavedIds = new Set(savedIds)
      if (wasSaved) {
        newSavedIds.delete(recipeId)
      } else {
        newSavedIds.add(recipeId)
      }
      setSavedIds(newSavedIds)

      // Update favorites list
      if (wasSaved) {
        setFavorites(prev => prev.filter(f => f.id !== recipeId))
      } else {
        // Get generated recipe from storage
        const generatedRecipes = getGeneratedRecipesFromStorage()
        const recipe = generatedRecipes[recipeId]

        if (recipe) {
          setFavorites(prev => [{
            ...recipe,
            savedAt: new Date().toISOString(),
          }, ...prev])
        }
      }

      return true
    }

    // Handle real recipe with database
    if (!user) {
      setError('Please log in to save recipes')
      return false
    }

    // Optimistic update
    const wasSaved = savedIds.has(recipeId)
    const newSavedIds = new Set(savedIds)

    if (wasSaved) {
      newSavedIds.delete(recipeId)
    } else {
      newSavedIds.add(recipeId)
    }
    setSavedIds(newSavedIds)

    try {
      const result = await toggleSaveRecipe(recipeId)

      if (!result.success) {
        // Revert optimistic update
        setSavedIds(savedIds)
        setError('Failed to update favorite')
        return false
      }

      // Refresh favorites list to get updated data
      await loadFavorites()
      return true
    } catch (err) {
      // Revert optimistic update
      setSavedIds(savedIds)
      console.error('Error toggling favorite:', err)
      setError('Failed to update favorite')
      return false
    }
  }, [user, savedIds, localSavedIds, loadFavorites])

  // Refresh favorites
  const refreshFavorites = useCallback(async () => {
    await loadFavorites()
  }, [loadFavorites])

  // Get favorites by category
  const getFavoritesByCategory = useCallback((category: string): FavoriteRecipe[] => {
    const normalizedCategory = category.toLowerCase()
    return favorites.filter(recipe => {
      // Check if recipe has categories and includes the specified category
      if (recipe.categories && recipe.categories.length > 0) {
        return recipe.categories.some(cat => cat.toLowerCase() === normalizedCategory)
      }
      // Fallback: detect categories from recipe name/description if no categories set
      const detectedCategories = detectRecipeCategories({
        name: recipe.title,
        description: recipe.description,
        calories: recipe.calories,
      })
      return detectedCategories.some(cat => cat.toLowerCase() === normalizedCategory)
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
