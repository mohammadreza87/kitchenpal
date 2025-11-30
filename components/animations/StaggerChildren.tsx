'use client'

import { useGsap } from '@/hooks/useGsap'
import { ReactNode } from 'react'

interface StaggerChildrenProps {
  children: ReactNode
  stagger?: number
  delay?: number
  className?: string
}

/**
 * Animates children with a stagger effect
 * Children should have the class "stagger-item"
 * 
 * @example
 * ```tsx
 * <StaggerChildren stagger={0.1}>
 *   <div className="stagger-item">Item 1</div>
 *   <div className="stagger-item">Item 2</div>
 *   <div className="stagger-item">Item 3</div>
 * </StaggerChildren>
 * ```
 */
export function StaggerChildren({
  children,
  stagger = 0.1,
  delay = 0,
  className = '',
}: StaggerChildrenProps) {
  const container = useGsap((ctx) => {
    ctx.from('.stagger-item', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger,
      delay,
      ease: 'power2.out',
    })
  })

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  )
}
