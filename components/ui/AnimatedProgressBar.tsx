'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface AnimatedProgressBarProps {
  progress: number
  className?: string
}

export function AnimatedProgressBar({ progress, className = '' }: AnimatedProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!progressRef.current) return

    // Animate only the fill part to the right
    gsap.to(progressRef.current, {
      width: `${progress}%`,
      duration: 0.6,
      ease: 'power2.out',
    })
  }, [progress])

  return (
    <div className={`h-1 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        ref={progressRef}
        className="h-full rounded-full bg-brand-primary"
        style={{ width: '0%' }}
      />
    </div>
  )
}
