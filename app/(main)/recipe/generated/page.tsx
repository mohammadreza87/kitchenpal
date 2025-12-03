'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useUser } from '@/hooks/useUser'
import { useFavorites, useReviews } from '@/hooks'
import { ReviewsTab } from '@/components/recipe/ReviewsTab'
import { InstructionsTab } from '@/components/recipe/InstructionsTab'

interface GeneratedRecipe {
  id: string
  name: string
  description: string
  ingredients: Array<{ name: string; quantity: number; unit: string }>
  instructions: string[]
  prepTime: string
  cookTime: string
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  calories?: number
  imageUrl?: string
  author?: string
  rating?: number
}

type RecipeTab = 'ingredients' | 'instructions' | 'review'


export default function GeneratedRecipePage() {
  const router = useRouter()
  const { user } = useUser()
  const { isSaved, toggleFavorite } = useFavorites()
  const { getAverageRating, getReviewCount } = useReviews()
  const containerRef = useRef<HTMLDivElement>(null)

  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<RecipeTab>('ingredients')
  const [portions, setPortions] = useState(4)
  const [showMenu, setShowMenu] = useState(false)

  // Get actual rating from reviews
  const reviewCount = recipe ? getReviewCount(recipe.id) : 0
  const averageRating = recipe ? getAverageRating(recipe.id) : 0

  useEffect(() => {
    const storedRecipe = sessionStorage.getItem('generatedRecipe')
    if (storedRecipe) {
      try {
        const parsed = JSON.parse(storedRecipe)
        setRecipe(parsed)
        setPortions(parsed.servings || 4)
      } catch (e) {
        console.error('Failed to parse stored recipe:', e)
      }
    }
    setLoading(false)
  }, [])


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
      const match = timeStr.match(/(\d+)/)
      return match ? parseInt(match[1]) : 0
    }
    const totalMinutes = extractMinutes(prepTime) + extractMinutes(cookTime)
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`
    }
    return `${totalMinutes} min`
  }

  if (loading) {
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
          No generated recipe was found. Please go back and try again.
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
      {/* Hero Image Section */}
      <div className="relative h-[45vh] w-full">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-brand-primary-container flex items-center justify-center">
            <Image
              src="/assets/icons/Fork.svg"
              alt="Recipe placeholder"
              width={64}
              height={64}
              className="opacity-30"
            />
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
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Card with overlap */}
      <div
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
                By {recipe.author || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'}
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
            <ReviewsTab recipeId={recipe.id} className="-mx-5 -my-4" />
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
  }

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(key)) {
      return emoji
    }
  }

  return '🥄' // Default spoon emoji
}
