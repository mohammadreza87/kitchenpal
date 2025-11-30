'use client'

import { useRef, useEffect, createContext, useContext, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from '@/lib/gsap'

interface TransitionContextType {
  isTransitioning: boolean
  transitionDirection: 'left' | 'right' | 'up' | 'down' | null
}

const TransitionContext = createContext<TransitionContextType>({
  isTransitioning: false,
  transitionDirection: null,
})

export const useTransition = () => useContext(TransitionContext)

// Route order for determining transition direction
const routeOrder = ['/home', '/chat', '/saved', '/profile']

function getTransitionDirection(from: string, to: string): 'left' | 'right' {
  const fromIndex = routeOrder.indexOf(from)
  const toIndex = routeOrder.indexOf(to)

  if (fromIndex === -1 || toIndex === -1) return 'right'
  return toIndex > fromIndex ? 'left' : 'right'
}

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const previousPathRef = useRef(pathname)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null)
  const [displayChildren, setDisplayChildren] = useState(children)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false
      previousPathRef.current = pathname
      return
    }

    // Don't animate if path hasn't changed
    if (previousPathRef.current === pathname) {
      setDisplayChildren(children)
      return
    }

    const direction = getTransitionDirection(previousPathRef.current, pathname)
    setTransitionDirection(direction)
    setIsTransitioning(true)

    const exitX = direction === 'left' ? -30 : 30
    const enterX = direction === 'left' ? 30 : -30

    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false)
        setTransitionDirection(null)
        previousPathRef.current = pathname
      }
    })

    // Exit animation
    tl.to(contentRef.current, {
      x: exitX,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    })

    // Update content
    .call(() => {
      setDisplayChildren(children)
    })

    // Enter animation
    .fromTo(contentRef.current,
      { x: enterX, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      }
    )

  }, [pathname, children])

  // Initial entrance animation
  useEffect(() => {
    if (contentRef.current && isFirstRender.current) {
      gsap.fromTo(contentRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [])

  return (
    <TransitionContext.Provider value={{ isTransitioning, transitionDirection }}>
      <div ref={containerRef} className="relative h-full w-full overflow-hidden">
        <div ref={contentRef} className="h-full w-full">
          {displayChildren}
        </div>
      </div>
    </TransitionContext.Provider>
  )
}
