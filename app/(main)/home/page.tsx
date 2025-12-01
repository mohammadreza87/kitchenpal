'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from '@/lib/gsap'
import { RecipeCard } from '@/components/home'
import { useGeneratedRecipes, useFavorites } from '@/hooks'

interface RecipeSectionProps {
  title: string
  recipes: Array<{
    id: string
    title: string
    description: string
    imageUrl: string
    rating: number
  }>
  href?: string
  emptyMessage?: string
  showCreateButton?: boolean
  onCreateClick?: () => void
  isSaved: (id: string) => boolean
  onToggleSave: (id: string) => void
  onRetryImage?: (id: string) => void
}

function RecipeSection({
  title,
  recipes,
  href = '/recipes',
  emptyMessage = 'No recipes yet',
  showCreateButton = false,
  onCreateClick,
  isSaved,
  onToggleSave,
  onRetryImage,
}: RecipeSectionProps) {
  if (recipes.length === 0) {
    return (
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between px-6">
          <h2 className="text-base font-semibold" style={{ color: '#282828' }}>
            {title}
          </h2>
        </div>
        <div className="mx-6 rounded-2xl bg-neutral-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <Image
              src="/assets/icons/Fork.svg"
              alt=""
              width={24}
              height={24}
              className="opacity-40"
            />
          </div>
          <p className="text-sm text-neutral-500">{emptyMessage}</p>
          {showCreateButton && onCreateClick && (
            <button
              onClick={onCreateClick}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-primary-dark active:scale-[0.98]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Create Recipe
            </button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between px-6">
        <h2 className="text-base font-semibold" style={{ color: '#282828' }}>
          {title}
        </h2>
        <Link
          href={href}
          className="text-sm font-medium transition-colors hover:opacity-70"
          style={{ color: '#656565' }}
        >
          View All
        </Link>
      </div>

      <div className="pl-6">
        <div className="flex gap-3 overflow-x-auto pr-6 pb-2 scrollbar-hide">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              {...recipe}
              isSaved={isSaved(recipe.id)}
              onToggleSave={onToggleSave}
              onRetryImage={onRetryImage}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)
  const { generatedRecipes, getNewRecipes, regenerateImage, loading } = useGeneratedRecipes()
  const { savedIds, isSaved, toggleFavorite } = useFavorites()

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return

    hasAnimated.current = true

    const sections = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      sections,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      }
    )
  }, [])

  const handleFindRecipes = () => {
    router.push('/chat')
  }

  // Get new recipes (most recent)
  const newRecipes = useMemo(() => {
    return getNewRecipes(10).map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      rating: r.rating,
    }))
  }, [getNewRecipes])

  // Get user's saved/favorite recipes from generated recipes
  const favoriteRecipes = useMemo(() => {
    return generatedRecipes
      .filter(r => savedIds.has(r.id))
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        rating: r.rating,
      }))
  }, [generatedRecipes, savedIds])

  // Get quick & easy recipes (under 30 min total time or 'easy' difficulty)
  const quickRecipes = useMemo(() => {
    return generatedRecipes
      .filter(r =>
        (r.totalTime && r.totalTime <= 30) ||
        r.difficulty?.toLowerCase() === 'easy' ||
        r.categories.some(c => c.toLowerCase().includes('quick') || c.toLowerCase().includes('easy'))
      )
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        rating: r.rating,
      }))
  }, [generatedRecipes])

  // Get healthy/low-carb recipes
  const healthyRecipes = useMemo(() => {
    return generatedRecipes
      .filter(r =>
        r.categories.some(c =>
          c.toLowerCase().includes('healthy') ||
          c.toLowerCase().includes('low-carb') ||
          c.toLowerCase().includes('keto') ||
          c.toLowerCase().includes('salad') ||
          c.toLowerCase().includes('vegetable')
        ) ||
        (r.calories && r.calories < 400)
      )
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        rating: r.rating,
      }))
  }, [generatedRecipes])

  // Get desserts and sweets
  const dessertRecipes = useMemo(() => {
    return generatedRecipes
      .filter(r =>
        r.categories.some(c =>
          c.toLowerCase().includes('dessert') ||
          c.toLowerCase().includes('sweet') ||
          c.toLowerCase().includes('cake') ||
          c.toLowerCase().includes('cookie') ||
          c.toLowerCase().includes('chocolate')
        )
      )
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        rating: r.rating,
      }))
  }, [generatedRecipes])

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#F8D8CE' }}>
        {/* Decorative curve at bottom */}
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-64 rounded-full bg-white opacity-100 blur-lg" />

        <div className="relative z-10 px-6 pb-8 pt-10">
          {/* Greeting */}
          <div data-animate>
            <h1 className="text-2xl font-bold" style={{ color: '#2e2e2e' }}>
              Hi There
              <Image
                src="/assets/icons/IceCream.svg"
                alt=""
                width={20}
                height={20}
                className="ml-1 inline-block align-middle"
                priority
              />
            </h1>
            <p className="mt-2 text-base" style={{ color: '#3a3a3a' }}>
              Find recipes based on what you already have at home!
            </p>
          </div>

          {/* Decorative arrow */}
          <div className="absolute right-6 top-10">
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
              <path
                d="M20 5 Q28 15, 24 28 Q20 40, 28 45"
                stroke="#282828"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M24 40 L28 45 L32 39"
                stroke="#282828"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Find Recipes Button */}
          <button
            data-animate
            onClick={handleFindRecipes}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 shadow-[0px_8px_16px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0px_10px_20px_rgba(0,0,0,0.12)] active:scale-[0.98]"
          >
            <Image
              src="/assets/icons/Chef's Hat.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-70"
            />
            <span className="text-base font-medium" style={{ color: '#2e2e2e' }}>
              Find Recipes
            </span>
          </button>
        </div>
      </div>

      {/* Recipe Sections */}
      <div className="mt-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-ping rounded-full bg-brand-primary/30" />
                <div className="absolute inset-2 animate-pulse rounded-full bg-brand-primary/50" />
                <div className="absolute inset-4 rounded-full bg-brand-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            <div data-animate>
              <RecipeSection
                title="New Recipes"
                recipes={newRecipes}
                href="/recipes/new"
                emptyMessage="Start creating recipes by chatting with our AI chef!"
                showCreateButton
                onCreateClick={handleFindRecipes}
                isSaved={isSaved}
                onToggleSave={toggleFavorite}
                onRetryImage={regenerateImage}
              />
            </div>

            {favoriteRecipes.length > 0 && (
              <div data-animate>
                <RecipeSection
                  title="Your Favorites"
                  recipes={favoriteRecipes}
                  href="/saved"
                  isSaved={isSaved}
                  onToggleSave={toggleFavorite}
                  onRetryImage={regenerateImage}
                />
              </div>
            )}

            {quickRecipes.length > 0 && (
              <div data-animate>
                <RecipeSection
                  title="Quick & Easy"
                  recipes={quickRecipes}
                  href="/recipes/quick"
                  isSaved={isSaved}
                  onToggleSave={toggleFavorite}
                  onRetryImage={regenerateImage}
                />
              </div>
            )}

            {healthyRecipes.length > 0 && (
              <div data-animate>
                <RecipeSection
                  title="Healthy Choices"
                  recipes={healthyRecipes}
                  href="/recipes/healthy"
                  isSaved={isSaved}
                  onToggleSave={toggleFavorite}
                  onRetryImage={regenerateImage}
                />
              </div>
            )}

            {dessertRecipes.length > 0 && (
              <div data-animate>
                <RecipeSection
                  title="Sweet Treats"
                  recipes={dessertRecipes}
                  href="/recipes/desserts"
                  isSaved={isSaved}
                  onToggleSave={toggleFavorite}
                  onRetryImage={regenerateImage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
