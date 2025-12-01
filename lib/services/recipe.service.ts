import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type {
  Recipe,
  Ingredient,
  RecipeRow,
  RecipeIngredientRow,
  RecipeInstructionRow,
  RecipeReviewRow,
} from '@/types/chat'
import { recipeFromRows } from '@/types/chat'

/**
 * Recipe Service for recipe operations
 * Requirements: 3.1 (recipe display), 4.2 (allergy filtering)
 */
export class RecipeService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Gets a recipe by ID with all related data (ingredients, instructions, reviews)
   * Requirements: 3.1 - Display recipe details
   */
  async getRecipe(recipeId: string): Promise<Recipe | null> {
    // Fetch recipe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recipeData, error: recipeError } = await (this.supabase as any)
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single()

    if (recipeError) {
      if (recipeError.code === 'PGRST116') {
        return null // Not found
      }
      console.error('Error fetching recipe:', recipeError)
      throw new Error(recipeError.message)
    }

    if (!recipeData) return null

    // Fetch ingredients
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ingredientsData, error: ingredientsError } = await (this.supabase as any)
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('sort_order', { ascending: true })

    if (ingredientsError) {
      console.error('Error fetching ingredients:', ingredientsError)
    }

    // Fetch instructions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: instructionsData, error: instructionsError } = await (this.supabase as any)
      .from('recipe_instructions')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step', { ascending: true })

    if (instructionsError) {
      console.error('Error fetching instructions:', instructionsError)
    }


    // Fetch reviews with user info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reviewsData, error: reviewsError } = await (this.supabase as any)
      .from('recipe_reviews')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
    }

    // Transform reviews to include user info
    const reviewsWithUserInfo = (reviewsData || []).map((review: RecipeReviewRow & { profiles?: { full_name?: string; avatar_url?: string } }) => ({
      ...review,
      user_name: review.profiles?.full_name || 'Anonymous',
      user_avatar: review.profiles?.avatar_url || '',
    }))

    return recipeFromRows(
      recipeData as RecipeRow,
      (ingredientsData || []) as RecipeIngredientRow[],
      (instructionsData || []) as RecipeInstructionRow[],
      reviewsWithUserInfo
    )
  }

  /**
   * Gets recipes that contain specified ingredients
   * Requirements: 3.1 - Recipe suggestions based on ingredients
   */
  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    if (ingredients.length === 0) {
      return this.getAllRecipes()
    }

    // Get recipe IDs that have matching ingredients
    const ingredientPatterns = ingredients.map(ing => `%${ing.toLowerCase()}%`)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: matchingIngredients, error: matchError } = await (this.supabase as any)
      .from('recipe_ingredients')
      .select('recipe_id')
      .or(ingredientPatterns.map(pattern => `name.ilike.${pattern}`).join(','))

    if (matchError) {
      console.error('Error searching ingredients:', matchError)
      throw new Error(matchError.message)
    }

    if (!matchingIngredients || matchingIngredients.length === 0) {
      return []
    }

    // Get unique recipe IDs
    const recipeIdSet = new Set<string>(matchingIngredients.map((ing: { recipe_id: string }) => ing.recipe_id))
    const recipeIds = Array.from(recipeIdSet)

    // Fetch full recipes
    const recipes: Recipe[] = []
    for (const recipeId of recipeIds) {
      const recipe = await this.getRecipe(recipeId as string)
      if (recipe) {
        recipes.push(recipe)
      }
    }

    return recipes
  }

  /**
   * Filters recipes to exclude those containing allergens
   * Requirements: 4.2 - Filter out recipes that conflict with user allergies
   */
  filterByAllergies(recipes: Recipe[], allergies: string[]): Recipe[] {
    if (allergies.length === 0) {
      return recipes
    }

    const lowerAllergies = allergies.map(a => a.toLowerCase())

    return recipes.filter(recipe => {
      // Check if any ingredient matches any allergy
      const hasAllergen = recipe.ingredients.some(ingredient => {
        const ingredientName = ingredient.name.toLowerCase()
        return lowerAllergies.some(allergy => 
          ingredientName.includes(allergy) || allergy.includes(ingredientName)
        )
      })
      return !hasAllergen
    })
  }

  /**
   * Gets all recipes
   */
  async getAllRecipes(): Promise<Recipe[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recipesData, error } = await (this.supabase as any)
      .from('recipes')
      .select('*')
      .order('rating', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching recipes:', error)
      throw new Error(error.message)
    }

    const recipes: Recipe[] = []
    for (const recipeRow of recipesData || []) {
      const recipe = await this.getRecipe(recipeRow.id)
      if (recipe) {
        recipes.push(recipe)
      }
    }

    return recipes
  }

  /**
   * Searches recipes by name or description
   */
  async searchRecipes(query: string): Promise<Recipe[]> {
    const searchPattern = `%${query.toLowerCase()}%`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recipesData, error } = await (this.supabase as any)
      .from('recipes')
      .select('*')
      .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .order('rating', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error searching recipes:', error)
      throw new Error(error.message)
    }

    const recipes: Recipe[] = []
    for (const recipeRow of recipesData || []) {
      const recipe = await this.getRecipe(recipeRow.id)
      if (recipe) {
        recipes.push(recipe)
      }
    }

    return recipes
  }

  /**
   * Gets recipes filtered by difficulty level
   */
  async getRecipesByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<Recipe[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recipesData, error } = await (this.supabase as any)
      .from('recipes')
      .select('*')
      .eq('difficulty', difficulty)
      .order('rating', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching recipes by difficulty:', error)
      throw new Error(error.message)
    }

    const recipes: Recipe[] = []
    for (const recipeRow of recipesData || []) {
      const recipe = await this.getRecipe(recipeRow.id)
      if (recipe) {
        recipes.push(recipe)
      }
    }

    return recipes
  }

  /**
   * Scales ingredient quantities based on portion adjustment
   * Requirements: 10.2 - Recalculate ingredient quantities
   */
  scaleIngredients(ingredients: Ingredient[], originalPortions: number, newPortions: number): Ingredient[] {
    if (originalPortions <= 0 || newPortions <= 0) {
      return ingredients
    }

    const scaleFactor = newPortions / originalPortions

    return ingredients.map(ingredient => ({
      ...ingredient,
      quantity: Math.round(ingredient.quantity * scaleFactor * 100) / 100, // Round to 2 decimal places
    }))
  }
}

// Factory function for creating service instance
export function createRecipeService(supabase: SupabaseClient<Database>) {
  return new RecipeService(supabase)
}
