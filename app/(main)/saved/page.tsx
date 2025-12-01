'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from '@/lib/gsap'
import { RecipeCard } from '@/components/home'
import { useFavorites } from '@/hooks'
import type { FavoriteRecipe } from '@/lib/services/favorites.service'

// Category definitions for grouping favorites
const CATEGORY_GROUPS = [
  { key: 'italian', title: 'Italian' },
  { key: 'asian', title: 'Asian Cuisine' },
  { key: 'french', title: 'French Cuisine' },
  { key: 'mexican', title: 'Mexican' },
  { key: 'mediterranean', title: 'Mediterranean' },
  { key: 'indian', title: 'Indian' },
  { key: 'keto', title: 'Keto & Low-Carb' },
  { key: 'vegetarian', title: 'Vegetarian' },
  { key: 'vegan', title: 'Vegan' },
  { key: 'breakfast', title: 'Breakfast' },
  { key: 'lunch', title: 'Lunch' },
  { key: 'dinner', title: 'Dinner' },
  { key: 'dessert', title: 'Desserts' },
  { key: 'seafood', title: 'Seafood' },
  { key: 'chicken', title: 'Chicken' },
  { key: 'beef', title: 'Beef' },
]

interface RecipeSectionProps {
  title: string
  recipes: FavoriteRecipe[]
  onToggleSave: (id: string) => void
}

function RecipeSection({ title, recipes, onToggleSave }: RecipeSectionProps) {
  if (recipes.length === 0) return null

  return (
    <section className="mb-6" data-animate>
      <div className="mb-3 flex items-center justify-between px-6">
        <h2 className="text-base font-semibold" style={{ color: '#282828' }}>
          {title}
        </h2>
        <span className="text-sm" style={{ color: '#656565' }}>
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </span>
      </div>

      <div className="pl-6">
        <div className="flex gap-3 overflow-x-auto pr-6 pb-2 scrollbar-hide">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              imageUrl={recipe.imageUrl}
              rating={recipe.rating}
              isSaved={true}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function SavedPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { favorites, loading, toggleFavorite, getFavoritesByCategory } = useFavorites()

  useEffect(() => {
    if (!containerRef.current || loading) return

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
  }, [loading])

  const handleRemove = async (id: string) => {
    await toggleFavorite(id)
  }

  // Filter favorites based on search query
  const filteredFavorites = useMemo(() => {
    if (!searchQuery) return favorites
    return favorites.filter(recipe =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [favorites, searchQuery])

  // Get category groups with recipes
  const categoryGroups = useMemo(() => {
    return CATEGORY_GROUPS.map(group => ({
      ...group,
      recipes: getFavoritesByCategory(group.key).filter(recipe => {
        // If searching, also filter by search query
        if (!searchQuery) return true
        return recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      })
    })).filter(group => group.recipes.length > 0)
  }, [getFavoritesByCategory, searchQuery])

  const hasRecipes = filteredFavorites.length > 0
  const hasCategories = categoryGroups.length > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-primary/30" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-brand-primary/50" />
            <div className="absolute inset-4 rounded-full bg-brand-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 data-animate className="text-2xl font-bold" style={{ color: '#282828' }}>
          Favorites
        </h1>
      </div>

      {/* Search Bar */}
      <div data-animate className="px-6 mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <Image
              src="/assets/icons/Search.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-40"
            />
          </div>
          <input
            type="text"
            placeholder="Find Your Favorite Recipes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-0 bg-gray-100 py-4 pl-12 pr-4 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      </div>

      {hasRecipes ? (
        <>
          {/* Category Sections with horizontal scroll like home page */}
          {hasCategories && (
            <div className="mb-4">
              {categoryGroups.map(group => (
                <RecipeSection
                  key={group.key}
                  title={group.title}
                  recipes={group.recipes}
                  onToggleSave={handleRemove}
                />
              ))}
            </div>
          )}

          {/* All Saved Recipes Section */}
          <section className="mb-6" data-animate>
            <div className="mb-3 flex items-center justify-between px-6">
              <h2 className="text-base font-semibold" style={{ color: '#282828' }}>
                All Saved Recipes
              </h2>
              <span className="text-sm" style={{ color: '#656565' }}>
                {filteredFavorites.length} {filteredFavorites.length === 1 ? 'recipe' : 'recipes'}
              </span>
            </div>

            <div className="pl-6">
              <div className="flex gap-3 overflow-x-auto pr-6 pb-2 scrollbar-hide">
                {filteredFavorites.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    imageUrl={recipe.imageUrl}
                    rating={recipe.rating}
                    isSaved={true}
                    onToggleSave={handleRemove}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Empty State */
        <div data-animate className="mx-6 mt-8 flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
            <Image
              src="/assets/icons/Bookmark.svg"
              alt=""
              width={32}
              height={32}
              className="opacity-60"
            />
          </div>
          <p className="text-center text-muted-foreground">
            {searchQuery ? 'No recipes found' : 'No saved recipes yet'}
          </p>
          <p className="mt-2 text-center text-sm text-gray-400">
            {searchQuery
              ? 'Try a different search term'
              : 'Start saving your favorite recipes to see them here'}
          </p>
          {!searchQuery && (
            <Link
              href="/home"
              className="mt-6 px-6 py-3 bg-brand-primary text-white rounded-full font-medium transition-all hover:bg-brand-primary-dark active:scale-[0.98]"
            >
              Browse Recipes
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
