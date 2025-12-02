'use client'

interface RecipeJsonLdProps {
  name: string
  description: string
  imageUrl?: string
  author: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
  servings?: number
  calories?: number
  difficulty?: string
  rating?: number
  reviewCount?: number
  ingredients: { name: string; quantity: number; unit: string }[]
  instructions: string[]
}

// Convert time string like "30 min" or "1 hr 15 min" to ISO 8601 duration
function toIsoDuration(timeStr: string): string {
  const hrMatch = timeStr.match(/(\d+)\s*hr/)
  const minMatch = timeStr.match(/(\d+)\s*min/)
  const hours = hrMatch ? parseInt(hrMatch[1]) : 0
  const minutes = minMatch ? parseInt(minMatch[1]) : 0

  if (hours && minutes) return `PT${hours}H${minutes}M`
  if (hours) return `PT${hours}H`
  if (minutes) return `PT${minutes}M`
  return 'PT30M' // default
}

export function RecipeJsonLd({
  name,
  description,
  imageUrl,
  author,
  prepTime = '30 min',
  cookTime = '30 min',
  servings = 4,
  calories,
  rating,
  reviewCount,
  ingredients,
  instructions,
}: RecipeJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kitchenpal.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name,
    description,
    image: imageUrl || `${baseUrl}/og-image.png`,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'KitchenPal',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.png`,
      },
    },
    datePublished: new Date().toISOString().split('T')[0],
    prepTime: toIsoDuration(prepTime),
    cookTime: toIsoDuration(cookTime),
    totalTime: toIsoDuration(
      `${parseInt(prepTime) + parseInt(cookTime)} min`
    ),
    recipeYield: `${servings} servings`,
    recipeCategory: 'Main Course',
    recipeCuisine: 'International',
    keywords: `${name}, recipe, cooking, KitchenPal`,
    recipeIngredient: ingredients.map(
      (i) => `${i.quantity} ${i.unit} ${i.name}`
    ),
    recipeInstructions: instructions.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })),
    ...(calories && {
      nutrition: {
        '@type': 'NutritionInformation',
        calories: `${calories} calories`,
      },
    }),
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating.toFixed(1),
          ratingCount: reviewCount,
          bestRating: '5',
          worstRating: '1',
        },
      }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
