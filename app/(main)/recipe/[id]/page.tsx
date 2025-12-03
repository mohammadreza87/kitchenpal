'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useFavorites, useGeneratedRecipes, useReviews } from '@/hooks'
import { ReviewsTab } from '@/components/recipe/ReviewsTab'
import { InstructionsTab } from '@/components/recipe/InstructionsTab'
import { useUser } from '@/hooks/useUser'
import { RecipeJsonLd } from '@/components/seo/RecipeJsonLd'
import type { GeneratedRecipeItem } from '@/hooks/useGeneratedRecipes'

// Mock recipe data - comprehensive version of the home page recipes
const mockRecipes = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Chocolate Tart',
    author: 'Chef Marie',
    rating: 4.5,
    reviewCount: 128,
    prepTime: '30 min',
    cookTime: '15 min',
    servings: 4,
    difficulty: 'Medium',
    calories: 380,
    description: 'A rich and decadent chocolate tart with a buttery crust and silky ganache filling. Perfect for special occasions.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Dark Chocolate', quantity: 200, unit: 'g' },
      { name: 'Heavy Cream', quantity: 250, unit: 'ml' },
      { name: 'Butter', quantity: 100, unit: 'g' },
      { name: 'All-purpose Flour', quantity: 200, unit: 'g' },
      { name: 'Sugar', quantity: 80, unit: 'g' },
      { name: 'Eggs', quantity: 2, unit: 'pcs' },
      { name: 'Vanilla Extract', quantity: 1, unit: 'tsp' },
    ],
    instructions: [
      'Prepare the tart crust by mixing flour, butter, and sugar. Press into tart pan and chill for 30 minutes.',
      'Blind bake the crust at 180°C (350°F) for 15 minutes until golden.',
      'Heat cream until simmering, then pour over chopped chocolate. Stir until smooth.',
      'Add butter and vanilla to the ganache, mix well.',
      'Pour ganache into cooled crust and refrigerate for at least 2 hours.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Steamed Dumplings',
    author: 'Chef Wong',
    rating: 4.8,
    reviewCount: 256,
    prepTime: '45 min',
    cookTime: '15 min',
    servings: 4,
    difficulty: 'Medium',
    calories: 220,
    description: 'Traditional Chinese steamed dumplings filled with savory pork and vegetables. A dim sum classic.',
    imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Ground Pork', quantity: 300, unit: 'g' },
      { name: 'Dumpling Wrappers', quantity: 30, unit: 'pcs' },
      { name: 'Napa Cabbage', quantity: 150, unit: 'g' },
      { name: 'Green Onions', quantity: 3, unit: 'stalks' },
      { name: 'Ginger', quantity: 1, unit: 'tbsp' },
      { name: 'Soy Sauce', quantity: 2, unit: 'tbsp' },
      { name: 'Sesame Oil', quantity: 1, unit: 'tsp' },
    ],
    instructions: [
      'Finely chop the cabbage and squeeze out excess water.',
      'Mix pork with cabbage, green onions, ginger, soy sauce, and sesame oil.',
      'Place filling in center of wrapper, fold and pleat edges to seal.',
      'Steam dumplings for 12-15 minutes until cooked through.',
      'Serve hot with dipping sauce made of soy sauce and rice vinegar.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Berry Bowl',
    author: 'Chef Anna',
    rating: 4.3,
    reviewCount: 89,
    prepTime: '10 min',
    cookTime: '0 min',
    servings: 2,
    difficulty: 'Easy',
    calories: 280,
    description: 'A refreshing and nutritious smoothie bowl topped with fresh berries, granola, and honey.',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Frozen Mixed Berries', quantity: 200, unit: 'g' },
      { name: 'Banana', quantity: 1, unit: 'pc' },
      { name: 'Greek Yogurt', quantity: 100, unit: 'g' },
      { name: 'Almond Milk', quantity: 100, unit: 'ml' },
      { name: 'Granola', quantity: 50, unit: 'g' },
      { name: 'Honey', quantity: 1, unit: 'tbsp' },
      { name: 'Fresh Berries', quantity: 50, unit: 'g' },
    ],
    instructions: [
      'Blend frozen berries, banana, yogurt, and almond milk until smooth.',
      'Pour into a bowl - it should be thick enough to hold toppings.',
      'Top with granola, fresh berries, and drizzle with honey.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Pesto Pasta',
    author: 'Chef Marco',
    rating: 4.6,
    reviewCount: 203,
    prepTime: '10 min',
    cookTime: '15 min',
    servings: 4,
    difficulty: 'Easy',
    calories: 520,
    description: 'Fresh basil pesto tossed with al dente pasta and topped with pine nuts and parmesan.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Pasta', quantity: 200, unit: 'g' },
      { name: 'Fresh Basil', quantity: 50, unit: 'g' },
      { name: 'Pine Nuts', quantity: 30, unit: 'g' },
      { name: 'Parmesan', quantity: 50, unit: 'g' },
      { name: 'Garlic', quantity: 2, unit: 'cloves' },
      { name: 'Olive Oil', quantity: 80, unit: 'ml' },
    ],
    instructions: [
      'Toast pine nuts in a dry pan until golden.',
      'Blend basil, garlic, pine nuts, parmesan, and olive oil until smooth.',
      'Cook pasta al dente, reserve 1 cup pasta water.',
      'Toss hot pasta with pesto, adding pasta water to reach desired consistency.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Fresh Salad',
    author: 'Chef Nina',
    rating: 4.1,
    reviewCount: 67,
    prepTime: '15 min',
    cookTime: '0 min',
    servings: 2,
    difficulty: 'Easy',
    calories: 180,
    description: 'A crisp garden salad with mixed greens, cherry tomatoes, and balsamic vinaigrette.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Mixed Greens', quantity: 150, unit: 'g' },
      { name: 'Cherry Tomatoes', quantity: 100, unit: 'g' },
      { name: 'Cucumber', quantity: 1, unit: 'pc' },
      { name: 'Red Onion', quantity: 0.5, unit: 'pc' },
      { name: 'Balsamic Vinegar', quantity: 2, unit: 'tbsp' },
      { name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
    ],
    instructions: [
      'Wash and dry all vegetables thoroughly.',
      'Slice cucumber and onion, halve cherry tomatoes.',
      'Whisk balsamic vinegar with olive oil, salt, and pepper.',
      'Toss greens with vegetables and dress just before serving.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    name: 'Grilled Salmon',
    author: 'Chef Pierre',
    rating: 4.9,
    reviewCount: 178,
    prepTime: '10 min',
    cookTime: '15 min',
    servings: 2,
    difficulty: 'Medium',
    calories: 420,
    description: 'Perfectly grilled salmon fillet with lemon herb butter and roasted asparagus.',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Salmon Fillet', quantity: 200, unit: 'g' },
      { name: 'Asparagus', quantity: 150, unit: 'g' },
      { name: 'Butter', quantity: 50, unit: 'g' },
      { name: 'Lemon', quantity: 1, unit: 'pc' },
      { name: 'Fresh Dill', quantity: 2, unit: 'tbsp' },
      { name: 'Garlic', quantity: 2, unit: 'cloves' },
    ],
    instructions: [
      'Season salmon with salt, pepper, and olive oil.',
      'Make herb butter by mixing softened butter with dill, garlic, and lemon zest.',
      'Grill salmon skin-side down for 4-5 minutes, flip and cook 3 more minutes.',
      'Roast asparagus at 200°C while salmon cooks.',
      'Top salmon with herb butter and serve with asparagus.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Grilled Steak',
    author: 'Chef Roberto',
    rating: 4.8,
    reviewCount: 245,
    prepTime: '35 min',
    cookTime: '15 min',
    servings: 2,
    difficulty: 'Medium',
    calories: 550,
    description: 'Restaurant-quality ribeye steak with a perfect sear and garlic herb butter.',
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Ribeye Steak', quantity: 300, unit: 'g' },
      { name: 'Butter', quantity: 50, unit: 'g' },
      { name: 'Garlic', quantity: 3, unit: 'cloves' },
      { name: 'Fresh Thyme', quantity: 3, unit: 'sprigs' },
      { name: 'Fresh Rosemary', quantity: 2, unit: 'sprigs' },
    ],
    instructions: [
      'Bring steak to room temperature, pat dry and season generously.',
      'Heat cast iron pan until smoking hot.',
      'Sear steak 3-4 minutes per side for medium-rare.',
      'Add butter, garlic, and herbs, baste steak for 1 minute.',
      'Rest for 5 minutes before slicing.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    name: 'Chicken Breast',
    author: 'Chef Elena',
    rating: 4.3,
    reviewCount: 134,
    prepTime: '10 min',
    cookTime: '20 min',
    servings: 2,
    difficulty: 'Easy',
    calories: 320,
    description: 'Juicy pan-seared chicken breast with a crispy golden crust and lemon pan sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Chicken Breast', quantity: 250, unit: 'g' },
      { name: 'Lemon', quantity: 1, unit: 'pc' },
      { name: 'Chicken Broth', quantity: 100, unit: 'ml' },
      { name: 'Butter', quantity: 30, unit: 'g' },
      { name: 'Capers', quantity: 1, unit: 'tbsp' },
      { name: 'Fresh Parsley', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'Pound chicken to even thickness, season well.',
      'Sear chicken in hot pan 5-6 minutes per side until golden.',
      'Remove chicken, add broth and lemon juice to pan.',
      'Simmer sauce, whisk in butter and capers.',
      'Slice chicken, drizzle with sauce and garnish with parsley.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    name: 'Shrimp Salad',
    author: 'Chef Coastal',
    rating: 4.5,
    reviewCount: 92,
    prepTime: '15 min',
    cookTime: '5 min',
    servings: 2,
    difficulty: 'Easy',
    calories: 280,
    description: 'Refreshing shrimp salad with avocado, mango, and citrus dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Large Shrimp', quantity: 200, unit: 'g' },
      { name: 'Mixed Greens', quantity: 100, unit: 'g' },
      { name: 'Avocado', quantity: 1, unit: 'pc' },
      { name: 'Mango', quantity: 0.5, unit: 'pc' },
      { name: 'Lime', quantity: 2, unit: 'pcs' },
      { name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
    ],
    instructions: [
      'Season and grill shrimp 2 minutes per side.',
      'Dice avocado and mango into cubes.',
      'Whisk lime juice with olive oil and honey.',
      'Arrange greens, top with shrimp, avocado, mango, and dress.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    name: 'Croissant',
    author: 'Chef François',
    rating: 4.9,
    reviewCount: 189,
    prepTime: '3 hrs',
    cookTime: '15 min',
    servings: 8,
    difficulty: 'Hard',
    calories: 340,
    description: 'Flaky, buttery French croissants with dozens of delicate layers.',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'All-purpose Flour', quantity: 500, unit: 'g' },
      { name: 'Cold Butter', quantity: 280, unit: 'g' },
      { name: 'Milk', quantity: 240, unit: 'ml' },
      { name: 'Sugar', quantity: 50, unit: 'g' },
      { name: 'Yeast', quantity: 7, unit: 'g' },
      { name: 'Egg', quantity: 1, unit: 'pc' },
    ],
    instructions: [
      'Make dough with flour, milk, sugar, yeast. Chill 1 hour.',
      'Pound butter into a flat square, encase in dough.',
      'Perform 3 folds, chilling 30 min between each.',
      'Roll out, cut triangles, shape into croissants.',
      'Proof 2 hours, brush with egg wash, bake at 200°C for 15 min.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000014',
    name: 'Crème Brûlée',
    author: 'Chef François',
    rating: 4.7,
    reviewCount: 156,
    prepTime: '15 min',
    cookTime: '45 min',
    servings: 4,
    difficulty: 'Medium',
    calories: 420,
    description: 'Classic French vanilla custard with a caramelized sugar crust.',
    imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Heavy Cream', quantity: 400, unit: 'ml' },
      { name: 'Egg Yolks', quantity: 5, unit: 'pcs' },
      { name: 'Sugar', quantity: 100, unit: 'g' },
      { name: 'Vanilla Bean', quantity: 1, unit: 'pc' },
      { name: 'Demerara Sugar', quantity: 50, unit: 'g' },
    ],
    instructions: [
      'Heat cream with vanilla bean seeds until steaming.',
      'Whisk egg yolks with sugar until pale.',
      'Slowly temper hot cream into yolks, strain.',
      'Bake in water bath at 150°C for 40-45 minutes.',
      'Chill, then torch sugar topping until caramelized.',
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000015',
    name: 'French Onion Soup',
    author: 'Chef Lyon',
    rating: 4.6,
    reviewCount: 134,
    prepTime: '15 min',
    cookTime: '1 hr 15 min',
    servings: 4,
    difficulty: 'Medium',
    calories: 380,
    description: 'Rich caramelized onion soup topped with crusty bread and melted Gruyère.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
    ingredients: [
      { name: 'Yellow Onions', quantity: 1, unit: 'kg' },
      { name: 'Beef Broth', quantity: 1, unit: 'L' },
      { name: 'Butter', quantity: 60, unit: 'g' },
      { name: 'Baguette', quantity: 4, unit: 'slices' },
      { name: 'Gruyère Cheese', quantity: 150, unit: 'g' },
      { name: 'Dry White Wine', quantity: 100, unit: 'ml' },
    ],
    instructions: [
      'Thinly slice onions and cook in butter over medium-low heat until deeply caramelized.',
      'Deglaze with white wine, cook until evaporated.',
      'Add broth and simmer for 20 minutes.',
      'Ladle into oven-safe bowls, top with bread and cheese.',
      'Broil until cheese is bubbly and golden.',
    ],
  },
]

type RecipeTab = 'ingredients' | 'instructions' | 'review'

export default function RecipePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { user } = useUser()
  const { isSaved, toggleFavorite } = useFavorites()
  const { generatedRecipes, regenerateImage, regeneratingIds, removeGeneratedRecipe, loading: recipesLoading } = useGeneratedRecipes()
  const { getAverageRating, getReviewCount } = useReviews()
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  const [recipe, setRecipe] = useState<typeof mockRecipes[0] | null>(null)
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipeItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<RecipeTab>('ingredients')
  const [portions, setPortions] = useState(4)
  const [showMenu, setShowMenu] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Get actual rating from reviews
  const reviewCount = getReviewCount(id)
  const averageRating = getAverageRating(id)

  useEffect(() => {
    // First check generated recipes
    const foundGeneratedRecipe = generatedRecipes.find(r => r.id === id)
    if (foundGeneratedRecipe) {
      setGeneratedRecipe(foundGeneratedRecipe)
      setRecipe({
        id: foundGeneratedRecipe.id,
        name: foundGeneratedRecipe.title,
        author: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You',
        rating: foundGeneratedRecipe.rating || 5.0,
        reviewCount: 0,
        prepTime: foundGeneratedRecipe.prepTime || '30 min',
        cookTime: foundGeneratedRecipe.cookTime || '30 min',
        servings: foundGeneratedRecipe.servings || 4,
        difficulty: foundGeneratedRecipe.difficulty || 'Medium',
        calories: foundGeneratedRecipe.calories || 0,
        description: foundGeneratedRecipe.description,
        imageUrl: foundGeneratedRecipe.imageUrl,
        ingredients: foundGeneratedRecipe.ingredients || [],
        instructions: foundGeneratedRecipe.instructions || [],
      })
      setPortions(foundGeneratedRecipe.servings || 4)
      // Reset image error when image URL changes
      setImageError(false)
      setLoading(false)
      return
    }

    // Then check mock recipes
    const foundRecipe = mockRecipes.find(r => r.id === id)
    if (foundRecipe) {
      setRecipe(foundRecipe)
      setGeneratedRecipe(null)
      setPortions(foundRecipe.servings || 4)
    }

    setLoading(false)
  }, [id, generatedRecipes, user])

  useEffect(() => {
    if (!loading && recipe && cardRef.current && !hasAnimated.current) {
      hasAnimated.current = true
      gsap.fromTo(
        cardRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      )
    }
  }, [loading, recipe])

  const handleBack = () => {
    router.back()
  }

  const scaleIngredient = (quantity: number, originalServings: number, newServings: number) => {
    if (originalServings <= 0) return quantity
    return Number(((quantity * newServings) / originalServings).toFixed(2))
  }

  // Calculate total time from prepTime and cookTime
  const getTotalTime = (prepTime: string, cookTime: string): string => {
    const extractMinutes = (timeStr: string): number => {
      const hrMatch = timeStr.match(/(\d+)\s*hr/)
      const minMatch = timeStr.match(/(\d+)\s*min/)
      return (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0)
    }
    const totalMinutes = extractMinutes(prepTime) + extractMinutes(cookTime)
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`
    }
    return `${totalMinutes} min`
  }

  // Show loading while either local state or recipes from hook are loading
  if (loading || recipesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-primary/30" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-brand-primary/50" />
            <div className="absolute inset-4 rounded-full bg-brand-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Image
          src="/assets/icons/X-Circle.svg"
          alt="Error"
          width={64}
          height={64}
          className="opacity-40"
        />
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Recipe not found
        </h2>
        <p className="mt-2 text-muted-foreground text-center">
          We couldn&apos;t find the recipe you&apos;re looking for.
        </p>
        <button
          onClick={handleBack}
          className="mt-6 px-6 py-3 bg-brand-primary text-white rounded-full font-medium transition-all hover:bg-brand-primary-dark active:scale-[0.98]"
        >
          Go Back
        </button>
      </div>
    )
  }

  const originalServings = recipe.servings || 4
  const totalTime = getTotalTime(recipe.prepTime, recipe.cookTime)

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Recipe JSON-LD Structured Data for SEO */}
      <RecipeJsonLd
        name={recipe.name}
        description={recipe.description}
        imageUrl={recipe.imageUrl}
        author={recipe.author}
        prepTime={recipe.prepTime}
        cookTime={recipe.cookTime}
        servings={recipe.servings}
        calories={recipe.calories}
        rating={averageRating > 0 ? averageRating : undefined}
        reviewCount={reviewCount > 0 ? reviewCount : undefined}
        ingredients={recipe.ingredients}
        instructions={recipe.instructions}
      />

      {/* Hero Image Section */}
      <div className="relative h-[45vh] w-full">
        {recipe.imageUrl && !imageError && !regeneratingIds.has(id) ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center">
            {/* Food icon placeholder */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-sm">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                className="text-amber-400"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Regenerate button - only show for user's own generated recipes */}
            {generatedRecipe && user && generatedRecipe.userId === user.id && (
              <button
                onClick={() => regenerateImage(id)}
                disabled={regeneratingIds.has(id)}
                className="mt-4 flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-medium text-amber-600 shadow-md transition-all hover:bg-white hover:shadow-lg active:scale-95 disabled:opacity-50"
              >
                {regeneratingIds.has(id) ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Generate Image</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Back Button - curved arrow without background */}
        <button
          onClick={handleBack}
          className="absolute top-12 left-4 p-2 transition-all active:scale-95"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="#363636" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Save/Bookmark Button - Always visible */}
        <button
          onClick={async () => {
            if (recipe?.id) {
              await toggleFavorite(recipe.id)
            }
          }}
          className="absolute top-12 right-16 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md transition-all active:scale-95"
        >
          <Image
            src={isSaved(id) ? '/assets/icons/Bookmark-Filled.svg' : '/assets/icons/Bookmark.svg'}
            alt={isSaved(id) ? 'Saved' : 'Save'}
            width={20}
            height={20}
            style={{
              filter: isSaved(id)
                ? 'invert(45%) sepia(97%) saturate(1752%) hue-rotate(322deg) brightness(101%) contrast(101%)'
                : 'invert(24%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(27%) contrast(89%)'
            }}
          />
        </button>

        {/* More Menu Button */}
        <div className="absolute top-12 right-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 transition-all active:scale-95"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="12" r="2" fill="#363636"/>
              <circle cx="12" cy="12" r="2" fill="#363636"/>
              <circle cx="19" cy="12" r="2" fill="#363636"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-white shadow-lg border border-neutral-100 overflow-hidden">
                <button
                  onClick={async () => {
                    if (recipe?.id) {
                      await toggleFavorite(recipe.id)
                    }
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-[#363636] hover:bg-neutral-50 transition-colors"
                >
                  <Image
                    src={isSaved(recipe?.id || '') ? '/assets/icons/Bookmark-Filled.svg' : '/assets/icons/Bookmark.svg'}
                    alt=""
                    width={20}
                    height={20}
                    style={{ filter: 'invert(45%) sepia(97%) saturate(1752%) hue-rotate(322deg) brightness(101%) contrast(101%)' }}
                  />
                  {isSaved(recipe?.id || '') ? 'Remove from Favorites' : 'Save to Favorites'}
                </button>
                {/* Regenerate Image option - only for user's own generated recipes */}
                {generatedRecipe && user && generatedRecipe.userId === user.id && (
                  <button
                    onClick={() => {
                      regenerateImage(id)
                      setShowMenu(false)
                    }}
                    disabled={regeneratingIds.has(id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-[#363636] hover:bg-neutral-50 transition-colors border-t border-neutral-100 disabled:opacity-50"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF7043" strokeWidth="2">
                      <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {regeneratingIds.has(id) ? 'Generating...' : 'Regenerate Image'}
                  </button>
                )}
                <button
                  onClick={() => {
                    // Share functionality
                    if (navigator.share && recipe) {
                      navigator.share({
                        title: recipe.name,
                        text: recipe.description,
                      })
                    }
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-[#363636] hover:bg-neutral-50 transition-colors border-t border-neutral-100"
                >
                  <Image
                    src="/assets/icons/Direct-Send.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="opacity-60"
                  />
                  Share Recipe
                </button>
                {/* Delete Recipe option - only for user's own generated recipes */}
                {generatedRecipe && user && generatedRecipe.userId === user.id && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
                        await removeGeneratedRecipe(id)
                        setShowMenu(false)
                        router.push('/home')
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-neutral-100"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete Recipe
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Card with overlap */}
      <div
        ref={cardRef}
        className="relative -mt-8 bg-white rounded-t-[32px] min-h-[60vh] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      >
        {/* Handle indicator */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Recipe Header */}
        <div className="px-6">
          {/* Title and Rating */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#363636]">{recipe.name}</h1>
              <p className="text-sm text-neutral-400 mt-0.5">
                By {recipe.author}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 1L12.39 6.36L18.18 7.27L14.09 11.26L15.18 17.02L10 14.27L4.82 17.02L5.91 11.26L1.82 7.27L7.61 6.36L10 1Z"
                    fill={star <= Math.round(averageRating) ? '#FFD700' : 'none'}
                    stroke={star <= Math.round(averageRating) ? '#FFD700' : '#D1D5DB'}
                    strokeWidth="1.5"
                  />
                </svg>
              ))}
              {reviewCount > 0 && (
                <>
                  <span className="font-semibold text-[#363636] ml-1">{averageRating.toFixed(1)}</span>
                  <span className="text-xs text-neutral-400">({reviewCount})</span>
                </>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Image src="/assets/icons/Clock.svg" alt="" width={16} height={16} className="opacity-60" />
              <span className="text-sm text-neutral-500">{totalTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Image src="/assets/icons/Chart.svg" alt="" width={16} height={16} className="opacity-60" />
              <span className="text-sm text-neutral-500">{recipe.difficulty}</span>
            </div>
            {recipe.calories && (
              <div className="flex items-center gap-1.5">
                <Image src="/assets/icons/Fire.svg" alt="" width={16} height={16} className="opacity-60" />
                <span className="text-sm text-neutral-500">{recipe.calories} Cal</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="mt-5">
            <h2 className="text-base font-semibold text-[#363636]">Description</h2>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{recipe.description}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 mt-6 border-b border-neutral-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'ingredients'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-neutral-400'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'instructions'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-neutral-400'
              }`}
            >
              Instructions
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'review'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-neutral-400'
              }`}
            >
              Review
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6 pb-24">
          {activeTab === 'ingredients' && (
            <div>
              {/* Portion Control */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-[#363636]">Portion</h3>
                  <p className="text-sm text-neutral-400">How many serving?</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPortions(Math.max(1, portions - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF5E6] text-[#363636] text-xl font-medium transition-all hover:bg-[#FFEDCC] active:scale-95"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold text-[#363636]">{portions}</span>
                  <button
                    onClick={() => setPortions(portions + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF5E6] text-[#363636] text-xl font-medium transition-all hover:bg-[#FFEDCC] active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-0">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {/* Ingredient Icon Circle */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50">
                        <span className="text-2xl">
                          {getIngredientEmoji(ingredient.name)}
                        </span>
                      </div>
                      <span className="text-[#363636]">{ingredient.name}</span>
                    </div>
                    <span className="text-neutral-400">
                      {scaleIngredient(ingredient.quantity, originalServings, portions)} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <InstructionsTab
              instructions={recipe.instructions.map((text, index) => ({
                id: `step-${index + 1}`,
                step: index + 1,
                text,
              }))}
              recipeName={recipe.name}
              className="-mx-5 -my-4"
            />
          )}

          {activeTab === 'review' && (
            <ReviewsTab recipeId={id} className="-mx-5 -my-4" />
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to get emoji based on ingredient name
function getIngredientEmoji(ingredientName: string): string {
  const lowerName = ingredientName.toLowerCase()

  const emojiMap: Record<string, string> = {
    chicken: '🍗',
    beef: '🥩',
    pork: '🥓',
    fish: '🐟',
    salmon: '🐟',
    shrimp: '🦐',
    egg: '🥚',
    milk: '🥛',
    cheese: '🧀',
    butter: '🧈',
    bread: '🍞',
    rice: '🍚',
    pasta: '🍝',
    noodle: '🍜',
    tomato: '🍅',
    potato: '🥔',
    carrot: '🥕',
    onion: '🧅',
    garlic: '🧄',
    pepper: '🌶️',
    broccoli: '🥦',
    corn: '🌽',
    mushroom: '🍄',
    lettuce: '🥬',
    cucumber: '🥒',
    avocado: '🥑',
    lemon: '🍋',
    lime: '🍋',
    orange: '🍊',
    apple: '🍎',
    banana: '🍌',
    strawberry: '🍓',
    grape: '🍇',
    watermelon: '🍉',
    pineapple: '🍍',
    coconut: '🥥',
    olive: '🫒',
    salt: '🧂',
    honey: '🍯',
    sugar: '🍬',
    chocolate: '🍫',
    coffee: '☕',
    tea: '🍵',
    wine: '🍷',
    herb: '🌿',
    thyme: '🌿',
    rosemary: '🌿',
    basil: '🌿',
    parsley: '🌿',
    cilantro: '🌿',
    mint: '🌿',
    dill: '🌿',
    oil: '🫒',
    water: '💧',
    stock: '🍲',
    broth: '🍲',
    cream: '🥛',
    flour: '🌾',
    bean: '🫘',
    nut: '🥜',
    almond: '🥜',
    peanut: '🥜',
    pine: '🥜',
    cabbage: '🥬',
    greens: '🥬',
    mango: '🥭',
    berry: '🫐',
    yogurt: '🥛',
    granola: '🥣',
    asparagus: '🥦',
    caper: '🫒',
    vanilla: '🌿',
    yeast: '🧫',
  }

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(key)) {
      return emoji
    }
  }

  return '🥄' // Default spoon emoji
}
