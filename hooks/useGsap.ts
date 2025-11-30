import { useEffect, useRef, useLayoutEffect } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * Use useLayoutEffect on client, useEffect on server (for SSR compatibility)
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Hook for GSAP animations with automatic cleanup
 * 
 * @example
 * ```tsx
 * const container = useGsap((ctx) => {
 *   ctx.from('.box', { opacity: 0, y: 50 })
 * })
 * 
 * return <div ref={container}><div className="box">Content</div></div>
 * ```
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  callback: (context: gsap.Context) => void,
  dependencies: any[] = []
) {
  const ref = useRef<T>(null)

  useIsomorphicLayoutEffect(() => {
    let ctx: gsap.Context | null = null
    
    ctx = gsap.context(() => {
      if (ctx) {
        callback(ctx)
      }
    }, ref)

    return () => {
      if (ctx) {
        ctx.revert()
      }
    }
  }, dependencies)

  return ref
}

/**
 * Hook for GSAP timeline with automatic cleanup
 * 
 * @example
 * ```tsx
 * const container = useGsapTimeline((tl) => {
 *   tl.from('.box1', { opacity: 0 })
 *     .from('.box2', { opacity: 0 })
 * })
 * ```
 */
export function useGsapTimeline<T extends HTMLElement = HTMLDivElement>(
  callback: (timeline: gsap.core.Timeline) => void,
  dependencies: any[] = []
) {
  const ref = useRef<T>(null)

  useIsomorphicLayoutEffect(() => {
    let ctx: gsap.Context | null = null
    
    ctx = gsap.context(() => {
      const tl = gsap.timeline()
      callback(tl)
    }, ref)

    return () => {
      if (ctx) {
        ctx.revert()
      }
    }
  }, dependencies)

  return ref
}
