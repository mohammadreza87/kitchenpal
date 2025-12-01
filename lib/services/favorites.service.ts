import { createClient } from '@/lib/supabase/client'

export interface SavedRecipe {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
  recipe?: {
    id: string
    name: string
    description: string
    image_url: string
    rating: number
    prep_time: string
    difficulty: string
    calories: number
  }
}

export interface FavoriteRecipe {
  id: string
  title: string
  description: string
  imageUrl: string
  rating: number
  prepTime?: string
  difficulty?: string
  calories?: number
  savedAt: string
  categories?: string[]
}

/**
 * Get all saved recipes for the current user
 */
export async function getSavedRecipes(): Promise<FavoriteRecipe[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_saved_recipes')
    .select(`
      id,
      recipe_id,
      created_at,
      recipes (
        id,
        name,
        description,
        image_url,
        rating,
        prep_time,
        difficulty,
        calories
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved recipes:', error)
    return []
  }

  // Transform to FavoriteRecipe format
  return (data || []).map((item: SavedRecipe & { recipes: SavedRecipe['recipe'] }) => ({
    id: item.recipes?.id || item.recipe_id,
    title: item.recipes?.name || 'Unknown Recipe',
    description: item.recipes?.description || '',
    imageUrl: item.recipes?.image_url || '',
    rating: item.recipes?.rating || 0,
    prepTime: item.recipes?.prep_time,
    difficulty: item.recipes?.difficulty,
    calories: item.recipes?.calories,
    savedAt: item.created_at,
  }))
}

/**
 * Get IDs of all saved recipes for the current user (for checking if saved)
 */
export async function getSavedRecipeIds(): Promise<Set<string>> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Set()

  const { data, error } = await supabase
    .from('user_saved_recipes')
    .select('recipe_id')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching saved recipe IDs:', error)
    return new Set()
  }

  return new Set((data || []).map((item: { recipe_id: string }) => item.recipe_id))
}

/**
 * Check if a recipe is saved by the current user
 */
export async function isRecipeSaved(recipeId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('user_saved_recipes')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking if recipe is saved:', error)
  }

  return !!data
}

/**
 * Save a recipe to favorites
 */
export async function saveRecipe(recipeId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('User not authenticated')
    return false
  }

  const { error } = await supabase
    .from('user_saved_recipes')
    .insert({
      user_id: user.id,
      recipe_id: recipeId,
    })

  if (error) {
    // Ignore duplicate key error (recipe already saved)
    if (error.code === '23505') {
      return true
    }
    console.error('Error saving recipe:', error)
    return false
  }

  return true
}

/**
 * Remove a recipe from favorites
 */
export async function unsaveRecipe(recipeId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('User not authenticated')
    return false
  }

  const { error } = await supabase
    .from('user_saved_recipes')
    .delete()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)

  if (error) {
    console.error('Error unsaving recipe:', error)
    return false
  }

  return true
}

/**
 * Toggle save status for a recipe
 */
export async function toggleSaveRecipe(recipeId: string): Promise<{ saved: boolean; success: boolean }> {
  const isSaved = await isRecipeSaved(recipeId)

  if (isSaved) {
    const success = await unsaveRecipe(recipeId)
    return { saved: false, success }
  } else {
    const success = await saveRecipe(recipeId)
    return { saved: true, success }
  }
}
