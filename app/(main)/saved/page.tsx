'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from '@/lib/gsap'
import { SavedRecipeCard } from '@/components/saved'

// Mock data for saved recipes organized by category
const savedRecipes = {
  newRecipes: [
    { id: '1', title: 'Cream Cake', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop' },
    { id: '2', title: 'Sushi', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop' },
    { id: '3', title: 'Tart', imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=400&fit=crop' },
    { id: '4', title: 'Pasta', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop' },
  ],
  lowCarb: [
    { id: '5', title: 'Loin Steak', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=400&fit=crop' },
    { id: '6', title: 'Fried Chicken', imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=400&fit=crop' },
    { id: '7', title: 'Chili Shrimp', imageUrl: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&h=400&fit=crop' },
    { id: '8', title: 'Ribs', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop' },
  ],
  dairyFree: [
    { id: '9', title: 'Grilled Steak', imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop' },
    { id: '10', title: 'Crispy Wings', imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=400&fit=crop' },
    { id: '11', title: 'Shrimp Pasta', imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop' },
    { id: '12', title: 'Salmon', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop' },
  ],
}

interface RecipeSectionProps {
  title: string
  recipes: Array<{ id: string; title: string; imageUrl: string }>
  onRemove?: (id: string) => void
}

function RecipeSection({ title, recipes, onRemove }: RecipeSectionProps) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: '#282828' }}>
          {title}
        </h2>
        <Link
          href={`/saved/${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-sm font-medium transition-colors hover:opacity-70"
          style={{ color: '#656565' }}
        >
          View All
        </Link>
      </div>

      <div className="-mx-6 px-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {recipes.map((recipe) => (
            <SavedRecipeCard
              key={recipe.id}
              {...recipe}
              onRemove={onRemove}
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

  useEffect(() => {
    if (!containerRef.current) return

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

  const handleRemove = (id: string) => {
    console.log('Remove recipe:', id)
    // TODO: Implement remove from saved
  }

  const hasRecipes =
    savedRecipes.newRecipes.length > 0 ||
    savedRecipes.lowCarb.length > 0 ||
    savedRecipes.dairyFree.length > 0

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-24">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <h1 data-animate className="mb-6 text-2xl font-bold" style={{ color: '#282828' }}>
          Favorites
        </h1>

        {/* Search Bar */}
        <div data-animate className="mb-6">
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
            {/* New Recipes Section */}
            <div data-animate>
              <RecipeSection
                title="New Recipes"
                recipes={savedRecipes.newRecipes}
                onRemove={handleRemove}
              />
            </div>

            {/* Low-Carb Section */}
            <div data-animate>
              <RecipeSection
                title="Low-Carb"
                recipes={savedRecipes.lowCarb}
                onRemove={handleRemove}
              />
            </div>

            {/* Dairy-Free Section */}
            <div data-animate>
              <RecipeSection
                title="Dairy-Free"
                recipes={savedRecipes.dairyFree}
                onRemove={handleRemove}
              />
            </div>
          </>
        ) : (
          /* Empty State */
          <div data-animate className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
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
              No saved recipes yet
            </p>
            <p className="mt-2 text-center text-sm text-gray-400">
              Start saving your favorite recipes to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
