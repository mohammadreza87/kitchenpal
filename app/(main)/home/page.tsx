'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from '@/lib/gsap'
import { RecipeCard } from '@/components/home'

// Mock data for recipes
const newRecipes = [
  {
    id: '1',
    title: 'Chocolate Tart',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    rating: 4,
  },
  {
    id: '2',
    title: 'Steamed Dumplings',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop',
    rating: 0,
  },
  {
    id: '3',
    title: 'Berry Bowl',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
    rating: 3,
  },
]

const favorites = [
  {
    id: '4',
    title: 'Gourmet Burger',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    rating: 0,
  },
  {
    id: '5',
    title: 'Acai Bowl',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
    rating: 0,
  },
  {
    id: '6',
    title: 'Avocado Toast',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
    rating: 0,
  },
]

const trending = [
  {
    id: '7',
    title: 'Pesto Pasta',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
    rating: 0,
  },
  {
    id: '8',
    title: 'Fresh Salad',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    rating: 0,
  },
  {
    id: '9',
    title: 'Grilled Salmon',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    rating: 0,
  },
]

const lowCarb = [
  {
    id: '10',
    title: 'Grilled Steak',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
    rating: 0,
  },
  {
    id: '11',
    title: 'Chicken Breast',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
    rating: 0,
  },
  {
    id: '12',
    title: 'Shrimp Salad',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&h=300&fit=crop',
    rating: 0,
  },
]

const frenchCuisine = [
  {
    id: '13',
    title: 'Croissant',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
    rating: 0,
  },
  {
    id: '14',
    title: 'Crème Brûlée',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop',
    rating: 0,
  },
  {
    id: '15',
    title: 'French Onion Soup',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    rating: 0,
  },
]

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
}

function RecipeSection({ title, recipes, href = '/recipes' }: RecipeSectionProps) {
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
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

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

  const handleFindRecipes = () => {
    router.push('/chat')
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#FFEEE8' }}>
        {/* Decorative blob */}
        <div
          className="absolute -right-16 top-8 h-48 w-48 rounded-full opacity-50"
          style={{ backgroundColor: '#FFD4C4' }}
        />

        <div className="relative z-10 px-6 pb-6 pt-8">
          {/* Greeting */}
          <div data-animate>
            <h1 className="text-xl font-bold" style={{ color: '#282828' }}>
              Hi There
              <span className="ml-1">🍦</span>
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#434343' }}>
              Find recipes based on what you already have at home!
            </p>
          </div>

          {/* Decorative arrow */}
          <div className="absolute right-6 top-8">
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
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <Image
              src="/assets/icons/Chef's Hat.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-70"
            />
            <span className="text-sm font-medium" style={{ color: '#282828' }}>
              Find Recipes
            </span>
          </button>
        </div>
      </div>

      {/* Recipe Sections */}
      <div className="mt-5">
        <div data-animate>
          <RecipeSection title="New Recipes" recipes={newRecipes} href="/recipes/new" />
        </div>

        <div data-animate>
          <RecipeSection title="Your Favorites" recipes={favorites} href="/saved" />
        </div>

        <div data-animate>
          <RecipeSection title="Trending" recipes={trending} href="/recipes/trending" />
        </div>

        <div data-animate>
          <RecipeSection title="Low-Carb" recipes={lowCarb} href="/recipes/low-carb" />
        </div>

        <div data-animate>
          <RecipeSection title="French Cuisine" recipes={frenchCuisine} href="/recipes/french" />
        </div>
      </div>
    </div>
  )
}
