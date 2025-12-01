'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createRecipeService } from '@/lib/services/recipe.service'
import type { Recipe, RecipeDetailState, Ingredient } from '@/types/chat'

type RecipeTab = 'ingredients' | 'instructions' | 'reviews'

const DEFAULT_PORTIONS = 4

/**
 * useRecipeDetail Hook - Manages recipe detail modal state
 * Requirements: 9.1 (recipe detail view), 10.1 (portion adjuster), 10.2 (portion scaling)
 */
export function useRecipeDetail() {
  const [state, setState] = useState<RecipeDetailState>({
    recipe: null,
    isLoading: false,
    error: null,
    activeTab: 'ingredients',
    portions: DEFAULT_PORTIONS,
    originalPortions: DEFAULT_PORTIONS,
  })

  const [isOpen, setIsOpen] = useState(false)

  const supabase = useMemo(() => createClient(), [])
  const recipeService = useMemo(() => createRecipeService(supabase), [supabase])

  /**
   * Open recipe detail modal and load recipe data
   * Requirements: 9.1 - Display recipe detail view
   */
  const openRecipe = useCallback(async (recipeId: string) => {
    setIsOpen(true)
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      activeTab: 'ingredients',
      portions: DEFAULT_PORTIONS,
      originalPortions: DEFAULT_PORTIONS,
    }))

    try {
      const recipe = await recipeService.getRecipe(recipeId)
      
      if (recipe) {
        setState(prev => ({
          ...prev,
          recipe,
          isLoading: false,
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: 'Recipe not found',
          isLoading: false,
        }))
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load recipe',
        isLoading: false,
      }))
    }
  }, [recipeService])


  /**
   * Close recipe detail modal
   */
  const closeRecipe = useCallback(() => {
    setIsOpen(false)
    // Reset state after animation completes
    setTimeout(() => {
      setState({
        recipe: null,
        isLoading: false,
        error: null,
        activeTab: 'ingredients',
        portions: DEFAULT_PORTIONS,
        originalPortions: DEFAULT_PORTIONS,
      })
    }, 300)
  }, [])

  /**
   * Set active tab
   * Requirements: 9.5 - Tabbed navigation
   */
  const setActiveTab = useCallback((tab: RecipeTab) => {
    setState(prev => ({ ...prev, activeTab: tab }))
  }, [])

  /**
   * Increase portions
   * Requirements: 10.1 - Portion adjuster with plus button
   */
  const increasePortions = useCallback(() => {
    setState(prev => ({
      ...prev,
      portions: prev.portions + 1,
    }))
  }, [])

  /**
   * Decrease portions (minimum 1)
   * Requirements: 10.1 - Portion adjuster with minus button
   */
  const decreasePortions = useCallback(() => {
    setState(prev => ({
      ...prev,
      portions: Math.max(1, prev.portions - 1),
    }))
  }, [])

  /**
   * Set specific portion count
   * Requirements: 10.1 - Portion adjustment
   */
  const setPortions = useCallback((portions: number) => {
    if (portions >= 1) {
      setState(prev => ({ ...prev, portions }))
    }
  }, [])

  /**
   * Get scaled ingredients based on current portions
   * Requirements: 10.2 - Recalculate ingredient quantities
   */
  const getScaledIngredients = useCallback((): Ingredient[] => {
    if (!state.recipe) return []
    
    return recipeService.scaleIngredients(
      state.recipe.ingredients,
      state.originalPortions,
      state.portions
    )
  }, [state.recipe, state.originalPortions, state.portions, recipeService])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  /**
   * Retry loading recipe
   */
  const retryLoad = useCallback(async () => {
    if (state.recipe?.id) {
      await openRecipe(state.recipe.id)
    }
  }, [state.recipe?.id, openRecipe])

  // Computed scaled ingredients
  const scaledIngredients = useMemo(() => {
    return getScaledIngredients()
  }, [getScaledIngredients])

  return {
    // State
    recipe: state.recipe,
    isLoading: state.isLoading,
    error: state.error,
    activeTab: state.activeTab,
    portions: state.portions,
    originalPortions: state.originalPortions,
    isOpen,
    scaledIngredients,
    
    // Actions
    openRecipe,
    closeRecipe,
    setActiveTab,
    increasePortions,
    decreasePortions,
    setPortions,
    clearError,
    retryLoad,
  }
}
