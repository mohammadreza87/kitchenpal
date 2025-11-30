'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/home', icon: '/assets/icons/Home.svg', iconFilled: '/assets/icons/Home-Filled.svg', label: 'Home' },
  { href: '/chat', icon: '/assets/icons/Message.svg', iconFilled: '/assets/icons/Message-Filled.svg', label: 'Chat' },
  { href: '/saved', icon: '/assets/icons/Bookmark.svg', iconFilled: '/assets/icons/Bookmark-Filled.svg', label: 'Saved' },
  { href: '/profile', icon: '/assets/icons/Profile.svg', iconFilled: '/assets/icons/Profile-Filled.svg', label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()
  const navRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
  const [mounted, setMounted] = useState(false)

  // Get the base path for matching
  const basePath = '/' + (pathname.split('/')[1] || '')

  // Pages that should keep the profile tab active
  const profileRelatedPaths = ['/profile', '/feedback', '/about', '/terms', '/privacy', '/licenses']
  const effectiveBasePath = profileRelatedPaths.includes(basePath) ? '/profile' : basePath

  const activeIndex = navItems.findIndex(item => item.href === effectiveBasePath)

  // Set initial indicator position after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animate indicator on route change
  useEffect(() => {
    if (!mounted || !indicatorRef.current || !navRef.current) return

    const activeItem = itemRefs.current.get(navItems[activeIndex]?.href || '')
    if (!activeItem) return

    const navRect = navRef.current.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()
    const centerX = itemRect.left - navRect.left + itemRect.width / 2

    gsap.to(indicatorRef.current, {
      x: centerX,
      duration: 0.4,
      ease: 'back.out(1.5)',
    })
  }, [effectiveBasePath, activeIndex, mounted])

  // Initial position (no animation)
  useEffect(() => {
    if (!mounted || !indicatorRef.current || !navRef.current) return

    const activeItem = itemRefs.current.get(navItems[activeIndex]?.href || '')
    if (!activeItem) return

    const navRect = navRef.current.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()
    const centerX = itemRect.left - navRect.left + itemRect.width / 2

    gsap.set(indicatorRef.current, { x: centerX })
  }, [mounted])

  const handleItemClick = (href: string, index: number) => {
    const item = itemRefs.current.get(href)
    if (!item) return

    // Bounce animation on click
    gsap.to(item, {
      scale: 0.9,
      duration: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(item, {
          scale: 1,
          duration: 0.2,
          ease: 'back.out(2)',
        })
      }
    })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white pb-safe">
      {/* Top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gray-100" />

      <div
        ref={navRef}
        className="relative mx-auto flex h-16 max-w-md items-center justify-around px-6"
      >
        {/* Sliding Pill Indicator */}
        <div
          ref={indicatorRef}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-12 w-20 rounded-full bg-amber-100"
          style={{ left: 0 }}
        />

        {/* Nav Items */}
        {navItems.map((item, index) => {
          const isActive = item.href === effectiveBasePath

          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => {
                if (el) itemRefs.current.set(item.href, el)
              }}
              onClick={() => handleItemClick(item.href, index)}
              className="relative z-10 flex h-12 w-12 items-center justify-center"
            >
              <Image
                src={isActive ? item.iconFilled : item.icon}
                alt={item.label}
                width={24}
                height={24}
                className="transition-all duration-300"
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
