'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'
import { useGeneratedRecipes, detectRecipeTags } from '@/hooks'
import { flattenTags, type RecipeTags } from '@/types/recipe-tags'

interface ImageRecipeTabProps {
  onRecipeGenerated?: () => void
}

export function ImageRecipeTab({ onRecipeGenerated }: ImageRecipeTabProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { addGeneratedRecipe } = useGeneratedRecipes()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [detectedDish, setDetectedDish] = useState<{ name: string; summary: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Animation
  useEffect(() => {
    if (!containerRef.current) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')
    gsap.fromTo(
      sections,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
    )
  }, [])

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setDetectedDish(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Analyze image
    await analyzeImage(file)
  }

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          const stripped = result.split(',')[1] || result
          resolve(stripped)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = (await res.json()) as { name: string; summary?: string }
      setDetectedDish({
        name: data.name || 'Unknown dish',
        summary: data.summary || '',
      })
    } catch (err) {
      console.error('Image analysis failed', err)
      setError("Could not analyze the image. Please try again or use a different photo.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateRecipe = async () => {
    if (!detectedDish) return

    setIsGenerating(true)
    setError(null)

    try {
      const prompt = `Generate a detailed recipe for: ${detectedDish.name}

${detectedDish.summary ? `Description: ${detectedDish.summary}` : ''}

IMPORTANT: You MUST respond with a JSON object in this exact format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description of the dish",
      "ingredients": [{"name": "ingredient name", "quantity": 1, "unit": "cup"}],
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "prepTime": "15 mins",
      "cookTime": "30 mins",
      "servings": 4,
      "difficulty": "Easy",
      "calories": 350
    }
  ]
}

Provide exactly one recipe that matches the identified dish.`

      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      })

      const chatData = await chatResponse.json()

      if (chatData.error || !chatData.recipes || chatData.recipes.length === 0) {
        throw new Error(chatData.error || 'Failed to generate recipe')
      }

      const recipe = chatData.recipes[0]

      let imageUrl =
        selectedImage ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'

      try {
        const imageResponse = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeName: recipe.name,
            description: recipe.description,
          }),
        })
        const imageData = await imageResponse.json()
        if (imageData.imageUrl && imageData.imageUrl !== '/assets/illustrations/food/Mediterranean Diet Dish.svg') {
          imageUrl = imageData.imageUrl
        }
      } catch (imgError) {
        console.warn('Image generation failed, using uploaded image:', imgError)
      }

      const generatedRecipe = {
        id: `generated-${Date.now()}`,
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        imageUrl,
      }

      sessionStorage.setItem('generatedRecipe', JSON.stringify(generatedRecipe))

      const structuredTags: RecipeTags = detectRecipeTags({
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        calories: recipe.calories,
        difficulty: recipe.difficulty,
        cuisine: '',
        mealType: '',
      })

      const categories = flattenTags(structuredTags)
      categories.push('new', 'generated', 'from-image')

      addGeneratedRecipe({
        id: generatedRecipe.id,
        title: recipe.name,
        description: recipe.description,
        imageUrl: imageUrl || '',
        rating: 5.0,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cuisine: '',
        mealType: '',
        tags: structuredTags,
        categories: Array.from(new Set(categories)),
      })

      onRecipeGenerated?.()
      router.push('/recipe/generated')
    } catch (err) {
      console.error('Recipe generation failed:', err)
      setError('Failed to generate recipe. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setDetectedDish(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div ref={containerRef} className="flex-1 px-6 pt-10 pb-24">
      {/* Upload Section */}
      <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
        <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
          Upload Food Photo
        </h2>

        <input
          type="file"
          accept="image/*"
          className="sr-only"
          ref={fileInputRef}
          onChange={handleImageSelect}
        />

        {!selectedImage ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <Image
                src="/assets/icons/Camera.svg"
                alt=""
                width={28}
                height={28}
                className="opacity-60"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Tap to upload photo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Take a photo or choose from gallery
              </p>
            </div>
          </button>
        ) : (
          <div className="relative">
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <Image
                src={selectedImage}
                alt="Uploaded food"
                fill
                className="object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <Image
                  src="/assets/icons/x.svg"
                  alt="Remove"
                  width={16}
                  height={16}
                  className="brightness-0 invert"
                />
              </button>
            </div>

            {isAnalyzing && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                Analyzing image...
              </div>
            )}
          </div>
        )}
      </section>

      {/* Detected Dish Section */}
      {detectedDish && !isAnalyzing && (
        <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
          <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
            Detected Dish
          </h2>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-amber-50">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground flex-shrink-0 mt-0.5">
              <svg
                className="h-3 w-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{detectedDish.name}</h3>
              {detectedDish.summary && (
                <p className="text-sm text-muted-foreground mt-1">{detectedDish.summary}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Error Message */}
      {error && (
        <section data-animate className="mb-6">
          <div className="p-4 rounded-xl border border-red-200 bg-red-50">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-red-700 font-medium underline"
            >
              Try another photo
            </button>
          </div>
        </section>
      )}

      {/* Tips Section */}
      <section data-animate className="mb-6 border-b pb-6" style={{ borderColor: '#c8c8c8' }}>
        <h2 className="mb-4 text-sm font-medium" style={{ color: '#332B10' }}>
          Tips for best results
        </h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-brand-primary mt-0.5">•</span>
            Use a clear, well-lit photo of the food
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-brand-primary mt-0.5">•</span>
            Focus on one dish at a time
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-brand-primary mt-0.5">•</span>
            Avoid blurry or dark images
          </li>
        </ul>
      </section>

      {/* Generate Button */}
      <button
        data-animate
        onClick={handleGenerateRecipe}
        disabled={!detectedDish || isAnalyzing || isGenerating}
        className={cn(
          'w-full py-4 rounded-full font-medium text-base flex items-center justify-center gap-2 transition-all',
          detectedDish && !isAnalyzing && !isGenerating
            ? 'bg-brand-primary text-white hover:bg-brand-primary-dark active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        )}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating Recipe...
          </>
        ) : (
          'Generate Recipe'
        )}
      </button>
    </div>
  )
}
