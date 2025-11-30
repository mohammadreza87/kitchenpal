'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { gsap } from '@/lib/gsap'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const containerRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  useEffect(() => {
    if (loading || !containerRef.current) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      sections,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }
    )
  }, [loading])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-md px-6 py-8">
      <h1 data-animate className="mb-2 text-2xl font-bold">Welcome to KitchenPal</h1>
      <p data-animate className="text-muted-foreground">Your culinary journey starts here!</p>

      <div data-animate className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Signed in as:</p>
        <p className="font-medium">{user?.email}</p>
      </div>
    </div>
  )
}
