/**
 * Recipe Tag Detection Utility
 *
 * Automatically detects and generates tags for recipes based on their content.
 * Uses intelligent analysis of recipe name, description, ingredients, and nutritional data.
 */

import {
  type RecipeTags,
  type DietaryTag,
  type CalorieTag,
  type DifficultyTag,
  type TimeTag,
  type CuisineTag,
  type MealTypeTag,
  type ProteinTag,
  type HealthTag,
  type OccasionTag,
  type CookingMethodTag,
  type SeasonTag,
  type BudgetTag,
  createEmptyTags,
  flattenTags,
} from '@/types/recipe-tags'

/**
 * Recipe data input for tag detection
 */
export interface RecipeDataForTags {
  name?: string
  description?: string
  ingredients?: Array<{ name: string; quantity?: number; unit?: string }>
  instructions?: string[]
  prepTime?: string // e.g., "15 mins", "1 hour"
  cookTime?: string
  totalTime?: number // in minutes
  calories?: number
  protein?: number // grams
  carbs?: number // grams
  fat?: number // grams
  fiber?: number // grams
  sodium?: number // mg
  servings?: number
  difficulty?: string
  cuisine?: string
  mealType?: string
}

/**
 * Parse time string to minutes
 */
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0

  const lower = timeStr.toLowerCase()
  let minutes = 0

  // Match hours
  const hourMatch = lower.match(/(\d+)\s*(?:hour|hr|h)/)
  if (hourMatch) {
    minutes += parseInt(hourMatch[1]) * 60
  }

  // Match minutes
  const minMatch = lower.match(/(\d+)\s*(?:min|minute|m)/)
  if (minMatch) {
    minutes += parseInt(minMatch[1])
  }

  // If just a number, assume minutes
  if (minutes === 0) {
    const numMatch = lower.match(/(\d+)/)
    if (numMatch) {
      minutes = parseInt(numMatch[1])
    }
  }

  return minutes
}

/**
 * Detect dietary tags from recipe content
 */
function detectDietaryTags(text: string, ingredients: string[], recipe: RecipeDataForTags): DietaryTag[] {
  const tags: DietaryTag[] = []

  // Keto detection
  if (text.includes('keto') || (recipe.carbs !== undefined && recipe.carbs < 20)) {
    tags.push('keto')
  }

  // Low-carb detection
  if (text.includes('low-carb') || text.includes('low carb') || (recipe.carbs !== undefined && recipe.carbs < 30)) {
    tags.push('low-carb')
  }

  // Paleo detection
  if (text.includes('paleo')) {
    tags.push('paleo')
  }

  // Vegan detection - no animal products
  const animalProducts = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'egg', 'milk', 'cheese', 'cream', 'butter', 'yogurt', 'honey']
  const hasAnimalProducts = animalProducts.some(product => ingredients.some(ing => ing.includes(product)))

  if (text.includes('vegan') || (text.includes('plant') && text.includes('based'))) {
    tags.push('vegan')
  } else if (!hasAnimalProducts && ingredients.length > 0) {
    // Could be vegan if no animal products detected
    tags.push('vegan')
  }

  // Vegetarian detection - no meat but may have eggs/dairy
  const meatProducts = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'bacon', 'ham', 'steak', 'sausage']
  const hasMeat = meatProducts.some(meat => ingredients.some(ing => ing.includes(meat)))

  if (text.includes('vegetarian') || text.includes('veggie')) {
    tags.push('vegetarian')
  } else if (!hasMeat && ingredients.length > 0) {
    tags.push('vegetarian')
  }

  // Gluten-free detection
  const glutenIngredients = ['flour', 'wheat', 'bread', 'pasta', 'noodle', 'spaghetti', 'barley', 'rye', 'couscous']
  const hasGluten = glutenIngredients.some(g => ingredients.some(ing => ing.includes(g)))

  if (text.includes('gluten-free') || text.includes('gluten free')) {
    tags.push('gluten-free')
  } else if (!hasGluten && ingredients.length > 0) {
    tags.push('gluten-free')
  }

  // Dairy-free detection
  const dairyIngredients = ['milk', 'cheese', 'cream', 'butter', 'yogurt', 'ice cream', 'whey', 'casein']
  const hasDairy = dairyIngredients.some(d => ingredients.some(ing => ing.includes(d)))

  if (text.includes('dairy-free') || text.includes('dairy free')) {
    tags.push('dairy-free')
  } else if (!hasDairy && ingredients.length > 0) {
    tags.push('dairy-free')
  }

  // Nut-free detection
  const nutIngredients = ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio', 'macadamia', 'nut']
  const hasNuts = nutIngredients.some(n => ingredients.some(ing => ing.includes(n)))

  if (!hasNuts && ingredients.length > 0) {
    tags.push('nut-free')
  }

  // Egg-free detection
  const hasEgg = ingredients.some(ing => ing.includes('egg'))
  if (!hasEgg && ingredients.length > 0) {
    tags.push('egg-free')
  }

  // Sugar-free detection
  if (text.includes('sugar-free') || text.includes('sugar free') || text.includes('no sugar')) {
    tags.push('sugar-free')
  }

  // Whole30 detection
  if (text.includes('whole30') || text.includes('whole 30')) {
    tags.push('whole30')
  }

  return Array.from(new Set(tags))
}

/**
 * Detect calorie level tags
 */
function detectCalorieTags(calories?: number): CalorieTag[] {
  const tags: CalorieTag[] = []

  if (calories !== undefined) {
    if (calories <= 300) {
      tags.push('low-calorie')
    } else if (calories <= 500) {
      tags.push('medium-calorie')
    } else {
      tags.push('high-calorie')
    }
  }

  return tags
}

/**
 * Detect difficulty tags
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function detectDifficultyTags(difficulty?: string, instructions?: string[], totalTime?: number): DifficultyTag[] {
  const tags: DifficultyTag[] = []

  if (difficulty) {
    const lower = difficulty.toLowerCase()
    if (lower.includes('beginner') || lower === 'very easy') {
      tags.push('beginner')
    } else if (lower.includes('easy') || lower === 'simple') {
      tags.push('easy')
    } else if (lower.includes('intermediate') || lower === 'medium' || lower === 'moderate') {
      tags.push('intermediate')
    } else if (lower.includes('advanced') || lower === 'hard' || lower === 'difficult') {
      tags.push('advanced')
    } else if (lower.includes('chef') || lower.includes('expert')) {
      tags.push('chef-level')
    }
  }

  // Infer from instructions count and time
  if (tags.length === 0 && instructions) {
    const stepCount = instructions.length
    if (stepCount <= 3) {
      tags.push('easy')
    } else if (stepCount <= 6) {
      tags.push('intermediate')
    } else {
      tags.push('advanced')
    }
  }

  return tags
}

/**
 * Detect time-related tags
 */
function detectTimeTags(prepTime?: string, cookTime?: string, totalTime?: number, text?: string): TimeTag[] {
  const tags: TimeTag[] = []

  // Calculate total time
  let total = totalTime || 0
  if (!total && (prepTime || cookTime)) {
    total = parseTimeToMinutes(prepTime || '') + parseTimeToMinutes(cookTime || '')
  }

  // Time-based tags
  if (total > 0) {
    if (total <= 15) {
      tags.push('under-15-min')
      tags.push('quick-prep')
    } else if (total <= 30) {
      tags.push('under-30-min')
    } else if (total <= 60) {
      tags.push('under-1-hour')
    } else if (total <= 120) {
      tags.push('1-2-hours')
    } else {
      tags.push('over-2-hours')
    }
  }

  // Text-based time tags
  if (text) {
    if (text.includes('slow cooker') || text.includes('crockpot') || text.includes('slow-cooked')) {
      tags.push('slow-cooker')
    }
    if (text.includes('instant pot') || text.includes('pressure cooker')) {
      tags.push('instant-pot')
    }
    if (text.includes('no cook') || text.includes('no-cook') || text.includes('raw')) {
      tags.push('no-cook')
    }
    if (text.includes('make ahead') || text.includes('make-ahead') || text.includes('prep ahead')) {
      tags.push('make-ahead')
    }
    if (text.includes('meal prep') || text.includes('meal-prep')) {
      tags.push('meal-prep')
    }
  }

  return Array.from(new Set(tags))
}

/**
 * Detect cuisine tags
 */
function detectCuisineTags(text: string, cuisine?: string): CuisineTag[] {
  const tags: CuisineTag[] = []

  const searchText = `${text} ${cuisine || ''}`.toLowerCase()

  // Italian
  if (searchText.includes('italian') || searchText.includes('pasta') || searchText.includes('pizza') ||
      searchText.includes('risotto') || searchText.includes('lasagna') || searchText.includes('parmesan') ||
      searchText.includes('mozzarella') || searchText.includes('pesto')) {
    tags.push('italian')
  }

  // French
  if (searchText.includes('french') || searchText.includes('croissant') || searchText.includes('crème') ||
      searchText.includes('soufflé') || searchText.includes('beurre') || searchText.includes('bordeaux')) {
    tags.push('french')
  }

  // Asian (general)
  if (searchText.includes('asian') || searchText.includes('soy sauce') || searchText.includes('sesame')) {
    tags.push('asian')
  }

  // Chinese
  if (searchText.includes('chinese') || searchText.includes('wok') || searchText.includes('stir fry') ||
      searchText.includes('fried rice') || searchText.includes('dim sum') || searchText.includes('szechuan')) {
    tags.push('chinese')
    tags.push('asian')
  }

  // Japanese
  if (searchText.includes('japanese') || searchText.includes('sushi') || searchText.includes('teriyaki') ||
      searchText.includes('miso') || searchText.includes('ramen') || searchText.includes('wasabi')) {
    tags.push('japanese')
    tags.push('asian')
  }

  // Korean
  if (searchText.includes('korean') || searchText.includes('kimchi') || searchText.includes('bulgogi') ||
      searchText.includes('gochujang') || searchText.includes('bibimbap')) {
    tags.push('korean')
    tags.push('asian')
  }

  // Thai
  if (searchText.includes('thai') || searchText.includes('pad thai') || searchText.includes('curry paste') ||
      searchText.includes('coconut milk') || searchText.includes('lemongrass') || searchText.includes('fish sauce')) {
    tags.push('thai')
    tags.push('asian')
  }

  // Vietnamese
  if (searchText.includes('vietnamese') || searchText.includes('pho') || searchText.includes('banh mi') ||
      searchText.includes('spring roll') || searchText.includes('nuoc mam')) {
    tags.push('vietnamese')
    tags.push('asian')
  }

  // Indian
  if (searchText.includes('indian') || searchText.includes('curry') || searchText.includes('masala') ||
      searchText.includes('tikka') || searchText.includes('naan') || searchText.includes('tandoori') ||
      searchText.includes('garam') || searchText.includes('turmeric')) {
    tags.push('indian')
  }

  // Mexican
  if (searchText.includes('mexican') || searchText.includes('taco') || searchText.includes('burrito') ||
      searchText.includes('quesadilla') || searchText.includes('enchilada') || searchText.includes('salsa') ||
      searchText.includes('guacamole') || searchText.includes('cilantro') || searchText.includes('jalapeño')) {
    tags.push('mexican')
  }

  // Mediterranean
  if (searchText.includes('mediterranean') || searchText.includes('olive oil') || searchText.includes('hummus') ||
      searchText.includes('falafel') || searchText.includes('tahini') || searchText.includes('feta')) {
    tags.push('mediterranean')
  }

  // Greek
  if (searchText.includes('greek') || searchText.includes('gyro') || searchText.includes('tzatziki') ||
      searchText.includes('moussaka') || searchText.includes('souvlaki')) {
    tags.push('greek')
    tags.push('mediterranean')
  }

  // Middle Eastern
  if (searchText.includes('middle eastern') || searchText.includes('shawarma') || searchText.includes('kebab') ||
      searchText.includes('pita') || searchText.includes('za\'atar')) {
    tags.push('middle-eastern')
    tags.push('mediterranean')
  }

  // American
  if (searchText.includes('american') || searchText.includes('burger') || searchText.includes('bbq') ||
      searchText.includes('hot dog') || searchText.includes('mac and cheese')) {
    tags.push('american')
  }

  // Southern US
  if (searchText.includes('southern') || searchText.includes('fried chicken') || searchText.includes('biscuits') ||
      searchText.includes('grits') || searchText.includes('cornbread') || searchText.includes('collard')) {
    tags.push('southern-us')
    tags.push('american')
  }

  // Caribbean
  if (searchText.includes('caribbean') || searchText.includes('jerk') || searchText.includes('plantain') ||
      searchText.includes('jamaican') || searchText.includes('rum')) {
    tags.push('caribbean')
  }

  // Spanish
  if (searchText.includes('spanish') || searchText.includes('paella') || searchText.includes('tapas') ||
      searchText.includes('chorizo') || searchText.includes('gazpacho')) {
    tags.push('spanish')
  }

  return Array.from(new Set(tags))
}

/**
 * Detect meal type tags
 */
function detectMealTypeTags(text: string, mealType?: string): MealTypeTag[] {
  const tags: MealTypeTag[] = []

  const searchText = `${text} ${mealType || ''}`.toLowerCase()

  if (searchText.includes('breakfast') || searchText.includes('pancake') || searchText.includes('omelette') ||
      searchText.includes('scrambled') || searchText.includes('waffle') || searchText.includes('cereal') ||
      searchText.includes('morning')) {
    tags.push('breakfast')
  }

  if (searchText.includes('brunch')) {
    tags.push('brunch')
  }

  if (searchText.includes('lunch') || searchText.includes('sandwich') || searchText.includes('wrap')) {
    tags.push('lunch')
  }

  if (searchText.includes('dinner') || searchText.includes('supper') || searchText.includes('evening meal')) {
    tags.push('dinner')
  }

  if (searchText.includes('snack') || searchText.includes('bite')) {
    tags.push('snack')
  }

  if (searchText.includes('appetizer') || searchText.includes('starter') || searchText.includes('hors d\'oeuvre')) {
    tags.push('appetizer')
  }

  if (searchText.includes('side dish') || searchText.includes('side-dish') || searchText.includes('accompaniment')) {
    tags.push('side-dish')
  }

  if (searchText.includes('dessert') || searchText.includes('cake') || searchText.includes('cookie') ||
      searchText.includes('pie') || searchText.includes('ice cream') || searchText.includes('chocolate') ||
      searchText.includes('sweet')) {
    tags.push('dessert')
  }

  if (searchText.includes('beverage') || searchText.includes('drink') || searchText.includes('smoothie') ||
      searchText.includes('cocktail') || searchText.includes('juice')) {
    tags.push('beverage')
  }

  if (searchText.includes('main course') || searchText.includes('entrée') || searchText.includes('entree')) {
    tags.push('main-course')
  }

  return Array.from(new Set(tags))
}

/**
 * Detect protein tags
 */
function detectProteinTags(text: string, ingredients: string[]): ProteinTag[] {
  const tags: ProteinTag[] = []

  const searchText = text.toLowerCase()
  const allIngredients = ingredients.join(' ').toLowerCase()
  const combined = `${searchText} ${allIngredients}`

  if (combined.includes('chicken') || combined.includes('poultry')) {
    tags.push('chicken')
  }

  if (combined.includes('beef') || combined.includes('steak') || combined.includes('ground beef')) {
    tags.push('beef')
  }

  if (combined.includes('pork') || combined.includes('bacon') || combined.includes('ham') || combined.includes('sausage')) {
    tags.push('pork')
  }

  if (combined.includes('lamb') || combined.includes('mutton')) {
    tags.push('lamb')
  }

  if (combined.includes('turkey')) {
    tags.push('turkey')
  }

  if (combined.includes('salmon')) {
    tags.push('salmon')
    tags.push('fish')
  }

  if (combined.includes('tuna')) {
    tags.push('tuna')
    tags.push('fish')
  }

  if (combined.includes('fish') || combined.includes('cod') || combined.includes('tilapia') || combined.includes('halibut')) {
    tags.push('fish')
  }

  if (combined.includes('shrimp') || combined.includes('prawn')) {
    tags.push('shrimp')
    tags.push('seafood')
  }

  if (combined.includes('seafood') || combined.includes('crab') || combined.includes('lobster') ||
      combined.includes('scallop') || combined.includes('mussel') || combined.includes('clam')) {
    tags.push('seafood')
  }

  if (combined.includes('tofu') || combined.includes('bean curd')) {
    tags.push('tofu')
  }

  if (combined.includes('tempeh')) {
    tags.push('tempeh')
  }

  if (combined.includes('egg')) {
    tags.push('eggs')
  }

  if (combined.includes('bean') || combined.includes('lentil') || combined.includes('chickpea') || combined.includes('legume')) {
    tags.push('legumes')
  }

  return Array.from(new Set(tags))
}

/**
 * Detect health-related tags
 */
function detectHealthTags(recipe: RecipeDataForTags, text: string): HealthTag[] {
  const tags: HealthTag[] = []

  // High protein
  if (recipe.protein !== undefined && recipe.protein >= 25) {
    tags.push('high-protein')
  } else if (text.includes('high protein') || text.includes('high-protein') || text.includes('protein-packed')) {
    tags.push('high-protein')
  }

  // High fiber
  if (recipe.fiber !== undefined && recipe.fiber >= 5) {
    tags.push('high-fiber')
  } else if (text.includes('high fiber') || text.includes('high-fiber') || text.includes('fiber-rich')) {
    tags.push('high-fiber')
  }

  // Low sodium
  if (recipe.sodium !== undefined && recipe.sodium <= 140) {
    tags.push('low-sodium')
  } else if (text.includes('low sodium') || text.includes('low-sodium')) {
    tags.push('low-sodium')
  }

  // Low fat
  if (recipe.fat !== undefined && recipe.fat <= 5) {
    tags.push('low-fat')
  } else if (text.includes('low fat') || text.includes('low-fat')) {
    tags.push('low-fat')
  }

  // Text-based health tags
  if (text.includes('heart healthy') || text.includes('heart-healthy')) {
    tags.push('heart-healthy')
  }

  if (text.includes('anti-inflammatory') || text.includes('anti inflammatory')) {
    tags.push('anti-inflammatory')
  }

  if (text.includes('gut') || text.includes('probiotic') || text.includes('fermented')) {
    tags.push('gut-friendly')
  }

  if (text.includes('immune') || text.includes('vitamin c') || text.includes('vitamin d')) {
    tags.push('immune-boosting')
  }

  if (text.includes('energy') || text.includes('energizing')) {
    tags.push('energy-boosting')
  }

  if (text.includes('brain') || text.includes('omega-3') || text.includes('omega 3')) {
    tags.push('brain-food')
    tags.push('omega-3')
  }

  if (text.includes('superfood') || text.includes('super food')) {
    tags.push('superfood')
  }

  if (text.includes('antioxidant') || text.includes('berry') || text.includes('blueberry')) {
    tags.push('antioxidant-rich')
  }

  return Array.from(new Set(tags))
}

/**
 * Detect occasion tags
 */
function detectOccasionTags(text: string): OccasionTag[] {
  const tags: OccasionTag[] = []

  if (text.includes('date night') || text.includes('romantic') || text.includes('valentine')) {
    tags.push('date-night')
  }

  if (text.includes('family') || text.includes('everyone')) {
    tags.push('family-friendly')
  }

  if (text.includes('kid') || text.includes('children') || text.includes('child-friendly')) {
    tags.push('kid-friendly')
  }

  if (text.includes('party') || text.includes('gathering') || text.includes('crowd')) {
    tags.push('party-food')
  }

  if (text.includes('holiday') || text.includes('festive')) {
    tags.push('holiday')
  }

  if (text.includes('thanksgiving') || text.includes('turkey day')) {
    tags.push('thanksgiving')
  }

  if (text.includes('christmas') || text.includes('xmas')) {
    tags.push('christmas')
  }

  if (text.includes('bbq') || text.includes('barbecue') || text.includes('grill') || text.includes('cookout')) {
    tags.push('summer-bbq')
  }

  if (text.includes('game day') || text.includes('super bowl') || text.includes('tailgate')) {
    tags.push('game-day')
  }

  if (text.includes('comfort') || text.includes('cozy') || text.includes('homestyle')) {
    tags.push('comfort-food')
  }

  if (text.includes('potluck') || text.includes('pot luck')) {
    tags.push('potluck')
  }

  if (text.includes('weeknight') || text.includes('quick dinner') || text.includes('easy dinner')) {
    tags.push('weeknight')
  }

  if (text.includes('special occasion') || text.includes('celebration')) {
    tags.push('special-occasion')
  }

  return Array.from(new Set(tags))
}

/**
 * Detect cooking method tags
 */
function detectCookingMethodTags(text: string, instructions: string[]): CookingMethodTag[] {
  const tags: CookingMethodTag[] = []

  const searchText = `${text} ${instructions.join(' ')}`.toLowerCase()

  if (searchText.includes('grill') || searchText.includes('bbq') || searchText.includes('barbecue')) {
    tags.push('grilled')
  }

  if (searchText.includes('bake') || searchText.includes('oven')) {
    tags.push('baked')
  }

  if (searchText.includes('air fry') || searchText.includes('air-fry') || searchText.includes('air fryer')) {
    tags.push('air-fried')
  }

  if (searchText.includes('pan fry') || searchText.includes('pan-fry') || searchText.includes('skillet')) {
    tags.push('pan-fried')
  }

  if (searchText.includes('deep fry') || searchText.includes('deep-fry') || searchText.includes('frying')) {
    tags.push('deep-fried')
  }

  if (searchText.includes('steam')) {
    tags.push('steamed')
  }

  if (searchText.includes('roast')) {
    tags.push('roasted')
  }

  if (searchText.includes('sauté') || searchText.includes('saute')) {
    tags.push('sauteed')
  }

  if (searchText.includes('boil')) {
    tags.push('boiled')
  }

  if (searchText.includes('slow cook') || searchText.includes('slow-cook') || searchText.includes('crockpot')) {
    tags.push('slow-cooked')
  }

  if (searchText.includes('pressure cook') || searchText.includes('instant pot')) {
    tags.push('pressure-cooked')
  }

  if (searchText.includes('smoke') || searchText.includes('smoked')) {
    tags.push('smoked')
  }

  if (searchText.includes('raw') || searchText.includes('no-cook')) {
    tags.push('raw')
  }

  if (searchText.includes('sous vide') || searchText.includes('sous-vide')) {
    tags.push('sous-vide')
  }

  if (searchText.includes('one pot') || searchText.includes('one-pot') || searchText.includes('single pot')) {
    tags.push('one-pot')
  }

  if (searchText.includes('sheet pan') || searchText.includes('sheet-pan')) {
    tags.push('sheet-pan')
  }

  if (searchText.includes('stir fry') || searchText.includes('stir-fry') || searchText.includes('wok')) {
    tags.push('stir-fry')
  }

  return Array.from(new Set(tags))
}

/**
 * Detect season tags based on ingredients and recipe type
 */
function detectSeasonTags(text: string, ingredients: string[]): SeasonTag[] {
  const tags: SeasonTag[] = []

  const searchText = `${text} ${ingredients.join(' ')}`.toLowerCase()

  // Spring ingredients
  if (searchText.includes('asparagus') || searchText.includes('pea') || searchText.includes('spring onion') ||
      searchText.includes('artichoke') || searchText.includes('rhubarb')) {
    tags.push('spring')
  }

  // Summer ingredients
  if (searchText.includes('tomato') || searchText.includes('corn') || searchText.includes('zucchini') ||
      searchText.includes('watermelon') || searchText.includes('peach') || searchText.includes('berry') ||
      searchText.includes('bbq') || searchText.includes('grill')) {
    tags.push('summer')
  }

  // Fall ingredients
  if (searchText.includes('pumpkin') || searchText.includes('squash') || searchText.includes('apple') ||
      searchText.includes('cinnamon') || searchText.includes('maple') || searchText.includes('cranberry')) {
    tags.push('fall')
  }

  // Winter ingredients
  if (searchText.includes('root vegetable') || searchText.includes('stew') || searchText.includes('soup') ||
      searchText.includes('warm') || searchText.includes('cozy') || searchText.includes('hot chocolate')) {
    tags.push('winter')
  }

  // Default to year-round if no specific season detected
  if (tags.length === 0) {
    tags.push('year-round')
  }

  return Array.from(new Set(tags))
}

/**
 * Detect budget tags (estimate based on ingredients)
 */
function detectBudgetTags(ingredients: string[]): BudgetTag[] {
  const tags: BudgetTag[] = []

  const premiumIngredients = ['lobster', 'crab', 'filet mignon', 'truffle', 'saffron', 'wagyu', 'caviar', 'foie gras']
  const budgetIngredients = ['rice', 'bean', 'lentil', 'potato', 'pasta', 'egg', 'cabbage', 'onion', 'garlic']

  const allIngredients = ingredients.join(' ').toLowerCase()

  const hasPremium = premiumIngredients.some(ing => allIngredients.includes(ing))
  const hasBudget = budgetIngredients.some(ing => allIngredients.includes(ing))

  if (hasPremium) {
    tags.push('premium')
  } else if (hasBudget && !hasPremium) {
    tags.push('budget')
    tags.push('pantry-staples')
  } else {
    tags.push('moderate')
  }

  return tags
}

/**
 * Main function to detect all tags for a recipe
 */
export function detectRecipeTags(recipe: RecipeDataForTags): RecipeTags {
  const tags = createEmptyTags()

  // Prepare text for searching
  const text = `${recipe.name || ''} ${recipe.description || ''} ${recipe.instructions?.join(' ') || ''}`.toLowerCase()
  const ingredientNames = recipe.ingredients?.map(i => i.name.toLowerCase()) || []

  // Calculate total time
  const totalTime = recipe.totalTime || (parseTimeToMinutes(recipe.prepTime || '') + parseTimeToMinutes(recipe.cookTime || ''))

  // Detect all tag categories
  tags.dietary = detectDietaryTags(text, ingredientNames, recipe)
  tags.calorie = detectCalorieTags(recipe.calories)
  tags.difficulty = detectDifficultyTags(recipe.difficulty, recipe.instructions, totalTime)
  tags.time = detectTimeTags(recipe.prepTime, recipe.cookTime, totalTime, text)
  tags.cuisine = detectCuisineTags(text, recipe.cuisine)
  tags.mealType = detectMealTypeTags(text, recipe.mealType)
  tags.protein = detectProteinTags(text, ingredientNames)
  tags.health = detectHealthTags(recipe, text)
  tags.occasion = detectOccasionTags(text)
  tags.cookingMethod = detectCookingMethodTags(text, recipe.instructions || [])
  tags.season = detectSeasonTags(text, ingredientNames)
  tags.budget = detectBudgetTags(ingredientNames)

  return tags
}

/**
 * Get flat array of all detected tags
 */
export function detectRecipeTagsFlat(recipe: RecipeDataForTags): string[] {
  return flattenTags(detectRecipeTags(recipe))
}

/**
 * Export for backward compatibility with existing code
 */
export { flattenTags, createEmptyTags }
