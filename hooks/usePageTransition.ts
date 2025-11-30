'use client'

import { useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/gsap'

type TransitionDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'

interface UsePageTransitionOptions {
  duration?: number
  ease?: string
}

/**
 * Hook for animated page navigation
 * 
 * @example
 * ```tsx
 * const { containerRef, navigateTo } = usePageTransition()
 * 
 * return (
 *   <div ref={containerRef}>
 *     <button onClick={() => navigateTo('/signup', 'up')}>
 *       Go to Signup
 *     </button>
 *   </div>
 * )
 * ```
 */
export function usePageTransition(options: UsePageTransitionOptions = {}) {
  const { duration = 0.3, ease = 'power2.in' } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const getAnimationProps = (direction: TransitionDirection) => {
    switch (direction) {
      case 'up':
        return { y: -30, opacity: 0 }
      case 'down':
        return { y: 30, opacity: 0 }
      case 'left':
        return { x: -50, opacity: 0 }
      case 'right':
        return { x: 50, opacity: 0 }
      case 'scale':
        return { scale: 0.95, opacity: 0 }
      case 'fade':
      default:
        return { opacity: 0 }
    }
  }

  const navigateTo = useCallback(
    (path: string, direction: TransitionDirection = 'fade') => {
      if (!containerRef.current) {
        router.push(path)
        return
      }

      const animProps = getAnimationProps(direction)

      gsap.to(containerRef.current, {
        ...animProps,
        duration,
        ease,
        onComplete: () => router.push(path),
      })
    },
    [router, duration, ease]
  )

  const navigateBack = useCallback(
    (direction: TransitionDirection = 'right') => {
      if (!containerRef.current) {
        router.back()
        return
      }

      const animProps = getAnimationProps(direction)

      gsap.to(containerRef.current, {
        ...animProps,
        duration,
        ease,
        onComplete: () => router.back(),
      })
    },
    [router, duration, ease]
  )

  return {
    containerRef,
    navigateTo,
    navigateBack,
  }
}
