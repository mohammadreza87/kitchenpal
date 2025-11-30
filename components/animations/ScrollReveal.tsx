'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  className?: string
}

/**
 * Reveals content when scrolled into view
 * 
 * @example
 * ```tsx
 * <ScrollReveal direction="up">
 *   <div>Content revealed on scroll</div>
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const directionMap = {
      up: { y: 50 },
      down: { y: -50 },
      left: { x: 50 },
      right: { x: -50 },
    }

    const animation = gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        ...directionMap[direction],
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )

    return () => {
      animation.kill()
    }
  }, [direction, delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
