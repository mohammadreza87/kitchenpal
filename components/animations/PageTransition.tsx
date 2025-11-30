'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from '@/lib/gsap'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * Wraps page content with entrance animation
 * Content fades and slides in on mount
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    )
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
