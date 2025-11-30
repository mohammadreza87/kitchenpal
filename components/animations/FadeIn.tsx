'use client'

import { useGsap } from '@/hooks/useGsap'
import { animations } from '@/lib/gsap'
import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale'
  delay?: number
  duration?: number
  className?: string
}

/**
 * Wrapper component for fade-in animations
 * 
 * @example
 * ```tsx
 * <FadeIn direction="up" delay={0.2}>
 *   <div>Content that fades in</div>
 * </FadeIn>
 * ```
 */
export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration,
  className = '',
}: FadeInProps) {
  const animationMap = {
    up: animations.fadeInUp,
    down: animations.fadeInDown,
    left: animations.fadeInLeft,
    right: animations.fadeInRight,
    scale: animations.scaleIn,
  }

  const animation = animationMap[direction]

  const container = useGsap((ctx) => {
    ctx.fromTo(
      '.fade-in-content',
      animation.from,
      {
        ...animation.to,
        delay,
        ...(duration && { duration }),
      }
    )
  })

  return (
    <div ref={container} className={className}>
      <div className="fade-in-content">{children}</div>
    </div>
  )
}
