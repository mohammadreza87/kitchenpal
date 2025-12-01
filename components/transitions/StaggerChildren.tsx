'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'

interface StaggerChildrenProps {
  children: React.ReactNode
  staggerDelay?: number
  duration?: number
  y?: number
  className?: string
}

export function StaggerChildren({
  children,
  staggerDelay = 0.08,
  duration = 0.4,
  y = 20,
  className = ''
}: StaggerChildrenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return
    hasAnimated.current = true

    const elements = containerRef.current.children

    gsap.fromTo(
      elements,
      {
        y,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration,
        stagger: staggerDelay,
        ease: 'power2.out',
      }
    )
  }, [staggerDelay, duration, y])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
