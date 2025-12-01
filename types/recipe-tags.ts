/**
 * Recipe Tagging System - 2025 Best Practices
 *
 * This module provides a comprehensive, type-safe tagging system for recipes.
 * Tags are organized into categories for better filtering and discovery.
 */

// =============================================================================
// TAG CATEGORIES - Organized by type
// =============================================================================

/**
 * Dietary & Lifestyle Tags
 * Tags related to dietary restrictions and lifestyle choices
 */
export const DIETARY_TAGS = {
  keto: { label: 'Keto', icon: '🥑', color: '#4CAF50' },
  'low-carb': { label: 'Low Carb', icon: '🥗', color: '#8BC34A' },
  paleo: { label: 'Paleo', icon: '🍖', color: '#795548' },
  vegan: { label: 'Vegan', icon: '🌱', color: '#4CAF50' },
  vegetarian: { label: 'Vegetarian', icon: '🥬', color: '#8BC34A' },
  pescatarian: { label: 'Pescatarian', icon: '🐟', color: '#03A9F4' },
  'gluten-free': { label: 'Gluten-Free', icon: '🌾', color: '#FF9800' },
  'dairy-free': { label: 'Dairy-Free', icon: '🥛', color: '#9E9E9E' },
  'nut-free': { label: 'Nut-Free', icon: '🥜', color: '#FFEB3B' },
  'egg-free': { label: 'Egg-Free', icon: '🥚', color: '#FFC107' },
  'soy-free': { label: 'Soy-Free', icon: '🫘', color: '#795548' },
  halal: { label: 'Halal', icon: '☪️', color: '#4CAF50' },
  kosher: { label: 'Kosher', icon: '✡️', color: '#2196F3' },
  whole30: { label: 'Whole30', icon: '🍎', color: '#FF5722' },
  'sugar-free': { label: 'Sugar-Free', icon: '🚫', color: '#E91E63' },
} as const

export type DietaryTag = keyof typeof DIETARY_TAGS

/**
 * Calorie Level Tags
 * Tags based on caloric content per serving
 */
export const CALORIE_TAGS = {
  'low-calorie': { label: 'Low Calorie', icon: '🔥', color: '#4CAF50', maxCalories: 300 },
  'medium-calorie': { label: 'Medium Calorie', icon: '⚡', color: '#FF9800', minCalories: 301, maxCalories: 500 },
  'high-calorie': { label: 'High Calorie', icon: '💪', color: '#F44336', minCalories: 501 },
  'calorie-conscious': { label: 'Calorie Conscious', icon: '📊', color: '#9C27B0' },
} as const

export type CalorieTag = keyof typeof CALORIE_TAGS

/**
 * Difficulty Level Tags
 * Tags based on cooking skill required
 */
export const DIFFICULTY_TAGS = {
  beginner: { label: 'Beginner', icon: '👶', color: '#4CAF50', level: 1 },
  easy: { label: 'Easy', icon: '😊', color: '#8BC34A', level: 2 },
  intermediate: { label: 'Intermediate', icon: '👨‍🍳', color: '#FF9800', level: 3 },
  advanced: { label: 'Advanced', icon: '🎓', color: '#F44336', level: 4 },
  'chef-level': { label: 'Chef Level', icon: '⭐', color: '#9C27B0', level: 5 },
} as const

export type DifficultyTag = keyof typeof DIFFICULTY_TAGS

/**
 * Time Tags
 * Tags based on total preparation + cooking time
 */
export const TIME_TAGS = {
  'under-15-min': { label: 'Under 15 min', icon: '⚡', color: '#4CAF50', maxMinutes: 15 },
  'under-30-min': { label: 'Under 30 min', icon: '🕐', color: '#8BC34A', maxMinutes: 30 },
  'under-1-hour': { label: 'Under 1 hour', icon: '🕑', color: '#FF9800', maxMinutes: 60 },
  '1-2-hours': { label: '1-2 hours', icon: '🕒', color: '#FF5722', minMinutes: 60, maxMinutes: 120 },
  'over-2-hours': { label: 'Over 2 hours', icon: '🕓', color: '#F44336', minMinutes: 120 },
  'quick-prep': { label: 'Quick Prep', icon: '🏃', color: '#00BCD4' },
  'meal-prep': { label: 'Meal Prep', icon: '📦', color: '#3F51B5' },
  'slow-cooker': { label: 'Slow Cooker', icon: '🍲', color: '#795548' },
  'instant-pot': { label: 'Instant Pot', icon: '🫕', color: '#607D8B' },
  'no-cook': { label: 'No Cook', icon: '❄️', color: '#00BCD4' },
  'make-ahead': { label: 'Make Ahead', icon: '📅', color: '#9C27B0' },
} as const

export type TimeTag = keyof typeof TIME_TAGS

/**
 * Cuisine Tags
 * Tags based on culinary origin/style
 */
export const CUISINE_TAGS = {
  italian: { label: 'Italian', icon: '🇮🇹', color: '#4CAF50' },
  french: { label: 'French', icon: '🇫🇷', color: '#2196F3' },
  asian: { label: 'Asian', icon: '🥢', color: '#F44336' },
  chinese: { label: 'Chinese', icon: '🇨🇳', color: '#F44336' },
  japanese: { label: 'Japanese', icon: '🇯🇵', color: '#E91E63' },
  korean: { label: 'Korean', icon: '🇰🇷', color: '#FF5722' },
  thai: { label: 'Thai', icon: '🇹🇭', color: '#FF9800' },
  vietnamese: { label: 'Vietnamese', icon: '🇻🇳', color: '#F44336' },
  indian: { label: 'Indian', icon: '🇮🇳', color: '#FF9800' },
  mexican: { label: 'Mexican', icon: '🇲🇽', color: '#4CAF50' },
  mediterranean: { label: 'Mediterranean', icon: '🫒', color: '#2196F3' },
  greek: { label: 'Greek', icon: '🇬🇷', color: '#03A9F4' },
  american: { label: 'American', icon: '🇺🇸', color: '#3F51B5' },
  'southern-us': { label: 'Southern US', icon: '🍗', color: '#FF5722' },
  caribbean: { label: 'Caribbean', icon: '🏝️', color: '#00BCD4' },
  'middle-eastern': { label: 'Middle Eastern', icon: '🧆', color: '#795548' },
  spanish: { label: 'Spanish', icon: '🇪🇸', color: '#F44336' },
  british: { label: 'British', icon: '🇬🇧', color: '#3F51B5' },
  german: { label: 'German', icon: '🇩🇪', color: '#FFC107' },
  fusion: { label: 'Fusion', icon: '🌍', color: '#9C27B0' },
} as const

export type CuisineTag = keyof typeof CUISINE_TAGS

/**
 * Meal Type Tags
 * Tags based on when the meal is typically eaten
 */
export const MEAL_TYPE_TAGS = {
  breakfast: { label: 'Breakfast', icon: '🌅', color: '#FF9800' },
  brunch: { label: 'Brunch', icon: '🥂', color: '#FFC107' },
  lunch: { label: 'Lunch', icon: '☀️', color: '#FFEB3B' },
  dinner: { label: 'Dinner', icon: '🌙', color: '#3F51B5' },
  snack: { label: 'Snack', icon: '🍿', color: '#9C27B0' },
  appetizer: { label: 'Appetizer', icon: '🥟', color: '#E91E63' },
  'side-dish': { label: 'Side Dish', icon: '🥗', color: '#8BC34A' },
  dessert: { label: 'Dessert', icon: '🍰', color: '#E91E63' },
  beverage: { label: 'Beverage', icon: '🥤', color: '#00BCD4' },
  'main-course': { label: 'Main Course', icon: '🍽️', color: '#FF5722' },
} as const

export type MealTypeTag = keyof typeof MEAL_TYPE_TAGS

/**
 * Protein Tags
 * Tags based on main protein source
 */
export const PROTEIN_TAGS = {
  chicken: { label: 'Chicken', icon: '🍗', color: '#FF9800' },
  beef: { label: 'Beef', icon: '🥩', color: '#F44336' },
  pork: { label: 'Pork', icon: '🐷', color: '#FF5722' },
  lamb: { label: 'Lamb', icon: '🐑', color: '#795548' },
  turkey: { label: 'Turkey', icon: '🦃', color: '#FF9800' },
  fish: { label: 'Fish', icon: '🐟', color: '#03A9F4' },
  seafood: { label: 'Seafood', icon: '🦐', color: '#00BCD4' },
  shrimp: { label: 'Shrimp', icon: '🦐', color: '#FF5722' },
  salmon: { label: 'Salmon', icon: '🐟', color: '#FF5722' },
  tuna: { label: 'Tuna', icon: '🐟', color: '#607D8B' },
  tofu: { label: 'Tofu', icon: '🧈', color: '#FFC107' },
  tempeh: { label: 'Tempeh', icon: '🫘', color: '#795548' },
  eggs: { label: 'Eggs', icon: '🥚', color: '#FFC107' },
  legumes: { label: 'Legumes', icon: '🫘', color: '#4CAF50' },
  'plant-protein': { label: 'Plant Protein', icon: '🌱', color: '#4CAF50' },
} as const

export type ProteinTag = keyof typeof PROTEIN_TAGS

/**
 * Health & Nutrition Tags
 * Tags related to nutritional benefits
 */
export const HEALTH_TAGS = {
  'high-protein': { label: 'High Protein', icon: '💪', color: '#F44336' },
  'high-fiber': { label: 'High Fiber', icon: '🌾', color: '#8BC34A' },
  'low-sodium': { label: 'Low Sodium', icon: '🧂', color: '#9E9E9E' },
  'low-fat': { label: 'Low Fat', icon: '💧', color: '#03A9F4' },
  'heart-healthy': { label: 'Heart Healthy', icon: '❤️', color: '#E91E63' },
  'anti-inflammatory': { label: 'Anti-Inflammatory', icon: '🔥', color: '#FF5722' },
  'gut-friendly': { label: 'Gut Friendly', icon: '🦠', color: '#4CAF50' },
  'immune-boosting': { label: 'Immune Boosting', icon: '🛡️', color: '#2196F3' },
  'energy-boosting': { label: 'Energy Boosting', icon: '⚡', color: '#FFEB3B' },
  'brain-food': { label: 'Brain Food', icon: '🧠', color: '#9C27B0' },
  'superfood': { label: 'Superfood', icon: '✨', color: '#4CAF50' },
  'antioxidant-rich': { label: 'Antioxidant Rich', icon: '🫐', color: '#673AB7' },
  'vitamin-rich': { label: 'Vitamin Rich', icon: '💊', color: '#FF9800' },
  'omega-3': { label: 'Omega-3 Rich', icon: '🐟', color: '#03A9F4' },
} as const

export type HealthTag = keyof typeof HEALTH_TAGS

/**
 * Occasion Tags
 * Tags for special occasions and events
 */
export const OCCASION_TAGS = {
  'date-night': { label: 'Date Night', icon: '💕', color: '#E91E63' },
  'family-friendly': { label: 'Family Friendly', icon: '👨‍👩‍👧‍👦', color: '#4CAF50' },
  'kid-friendly': { label: 'Kid Friendly', icon: '👶', color: '#FF9800' },
  'party-food': { label: 'Party Food', icon: '🎉', color: '#9C27B0' },
  'holiday': { label: 'Holiday', icon: '🎄', color: '#F44336' },
  'thanksgiving': { label: 'Thanksgiving', icon: '🦃', color: '#FF5722' },
  'christmas': { label: 'Christmas', icon: '🎅', color: '#F44336' },
  'summer-bbq': { label: 'Summer BBQ', icon: '🍖', color: '#FF9800' },
  'game-day': { label: 'Game Day', icon: '🏈', color: '#4CAF50' },
  'comfort-food': { label: 'Comfort Food', icon: '🤗', color: '#795548' },
  'potluck': { label: 'Potluck', icon: '🍱', color: '#3F51B5' },
  'weeknight': { label: 'Weeknight', icon: '📅', color: '#607D8B' },
  'special-occasion': { label: 'Special Occasion', icon: '✨', color: '#9C27B0' },
} as const

export type OccasionTag = keyof typeof OCCASION_TAGS

/**
 * Cooking Method Tags
 * Tags based on primary cooking technique
 */
export const COOKING_METHOD_TAGS = {
  grilled: { label: 'Grilled', icon: '🔥', color: '#FF5722' },
  baked: { label: 'Baked', icon: '🍞', color: '#795548' },
  'air-fried': { label: 'Air Fried', icon: '🌀', color: '#607D8B' },
  'pan-fried': { label: 'Pan Fried', icon: '🍳', color: '#FF9800' },
  'deep-fried': { label: 'Deep Fried', icon: '🍟', color: '#FFC107' },
  steamed: { label: 'Steamed', icon: '♨️', color: '#03A9F4' },
  roasted: { label: 'Roasted', icon: '🔥', color: '#FF5722' },
  sauteed: { label: 'Sautéed', icon: '🍳', color: '#FF9800' },
  boiled: { label: 'Boiled', icon: '🫕', color: '#03A9F4' },
  'slow-cooked': { label: 'Slow Cooked', icon: '🍲', color: '#795548' },
  'pressure-cooked': { label: 'Pressure Cooked', icon: '🫕', color: '#607D8B' },
  smoked: { label: 'Smoked', icon: '💨', color: '#9E9E9E' },
  raw: { label: 'Raw', icon: '🥬', color: '#4CAF50' },
  'sous-vide': { label: 'Sous Vide', icon: '🌡️', color: '#2196F3' },
  'one-pot': { label: 'One Pot', icon: '🥘', color: '#FF5722' },
  'sheet-pan': { label: 'Sheet Pan', icon: '🍳', color: '#607D8B' },
  'stir-fry': { label: 'Stir Fry', icon: '🥡', color: '#F44336' },
} as const

export type CookingMethodTag = keyof typeof COOKING_METHOD_TAGS

/**
 * Season Tags
 * Tags based on seasonal availability or preference
 */
export const SEASON_TAGS = {
  spring: { label: 'Spring', icon: '🌸', color: '#E91E63' },
  summer: { label: 'Summer', icon: '☀️', color: '#FFEB3B' },
  fall: { label: 'Fall', icon: '🍂', color: '#FF9800' },
  winter: { label: 'Winter', icon: '❄️', color: '#03A9F4' },
  'year-round': { label: 'Year Round', icon: '🌍', color: '#4CAF50' },
} as const

export type SeasonTag = keyof typeof SEASON_TAGS

/**
 * Budget Tags
 * Tags based on ingredient cost
 */
export const BUDGET_TAGS = {
  budget: { label: 'Budget Friendly', icon: '💰', color: '#4CAF50' },
  moderate: { label: 'Moderate Cost', icon: '💵', color: '#FF9800' },
  premium: { label: 'Premium', icon: '💎', color: '#9C27B0' },
  'pantry-staples': { label: 'Pantry Staples', icon: '🏪', color: '#795548' },
} as const

export type BudgetTag = keyof typeof BUDGET_TAGS

// =============================================================================
// COMBINED TYPES
// =============================================================================

/**
 * All possible tag values
 */
export type RecipeTag =
  | DietaryTag
  | CalorieTag
  | DifficultyTag
  | TimeTag
  | CuisineTag
  | MealTypeTag
  | ProteinTag
  | HealthTag
  | OccasionTag
  | CookingMethodTag
  | SeasonTag
  | BudgetTag

/**
 * Tag categories for grouping
 */
export type TagCategory =
  | 'dietary'
  | 'calorie'
  | 'difficulty'
  | 'time'
  | 'cuisine'
  | 'mealType'
  | 'protein'
  | 'health'
  | 'occasion'
  | 'cookingMethod'
  | 'season'
  | 'budget'

/**
 * Structured tags interface for a recipe
 */
export interface RecipeTags {
  dietary: DietaryTag[]
  calorie: CalorieTag[]
  difficulty: DifficultyTag[]
  time: TimeTag[]
  cuisine: CuisineTag[]
  mealType: MealTypeTag[]
  protein: ProteinTag[]
  health: HealthTag[]
  occasion: OccasionTag[]
  cookingMethod: CookingMethodTag[]
  season: SeasonTag[]
  budget: BudgetTag[]
}

/**
 * All tag definitions combined
 */
export const ALL_TAGS = {
  dietary: DIETARY_TAGS,
  calorie: CALORIE_TAGS,
  difficulty: DIFFICULTY_TAGS,
  time: TIME_TAGS,
  cuisine: CUISINE_TAGS,
  mealType: MEAL_TYPE_TAGS,
  protein: PROTEIN_TAGS,
  health: HEALTH_TAGS,
  occasion: OCCASION_TAGS,
  cookingMethod: COOKING_METHOD_TAGS,
  season: SEASON_TAGS,
  budget: BUDGET_TAGS,
} as const

/**
 * Get tag info by tag value
 */
export function getTagInfo(tag: string): { label: string; icon: string; color: string } | null {
  for (const category of Object.values(ALL_TAGS)) {
    if (tag in category) {
      return category[tag as keyof typeof category] as { label: string; icon: string; color: string }
    }
  }
  return null
}

/**
 * Get all tags as a flat array
 */
export function getAllTagValues(): string[] {
  const allTags: string[] = []
  for (const category of Object.values(ALL_TAGS)) {
    allTags.push(...Object.keys(category))
  }
  return allTags
}

/**
 * Create empty RecipeTags object
 */
export function createEmptyTags(): RecipeTags {
  return {
    dietary: [],
    calorie: [],
    difficulty: [],
    time: [],
    cuisine: [],
    mealType: [],
    protein: [],
    health: [],
    occasion: [],
    cookingMethod: [],
    season: [],
    budget: [],
  }
}

/**
 * Convert flat tags array to structured RecipeTags
 */
export function structureTags(flatTags: string[]): RecipeTags {
  const tags = createEmptyTags()

  for (const tag of flatTags) {
    if (tag in DIETARY_TAGS) tags.dietary.push(tag as DietaryTag)
    else if (tag in CALORIE_TAGS) tags.calorie.push(tag as CalorieTag)
    else if (tag in DIFFICULTY_TAGS) tags.difficulty.push(tag as DifficultyTag)
    else if (tag in TIME_TAGS) tags.time.push(tag as TimeTag)
    else if (tag in CUISINE_TAGS) tags.cuisine.push(tag as CuisineTag)
    else if (tag in MEAL_TYPE_TAGS) tags.mealType.push(tag as MealTypeTag)
    else if (tag in PROTEIN_TAGS) tags.protein.push(tag as ProteinTag)
    else if (tag in HEALTH_TAGS) tags.health.push(tag as HealthTag)
    else if (tag in OCCASION_TAGS) tags.occasion.push(tag as OccasionTag)
    else if (tag in COOKING_METHOD_TAGS) tags.cookingMethod.push(tag as CookingMethodTag)
    else if (tag in SEASON_TAGS) tags.season.push(tag as SeasonTag)
    else if (tag in BUDGET_TAGS) tags.budget.push(tag as BudgetTag)
  }

  return tags
}

/**
 * Convert structured RecipeTags to flat array
 */
export function flattenTags(tags: RecipeTags): string[] {
  return [
    ...tags.dietary,
    ...tags.calorie,
    ...tags.difficulty,
    ...tags.time,
    ...tags.cuisine,
    ...tags.mealType,
    ...tags.protein,
    ...tags.health,
    ...tags.occasion,
    ...tags.cookingMethod,
    ...tags.season,
    ...tags.budget,
  ]
}
