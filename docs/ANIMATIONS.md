# GSAP Animations in KitchenPal

## Overview

KitchenPal uses GSAP (GreenSock Animation Platform) for smooth, performant animations. All animation utilities are centralized for consistency.

## Quick Start

### 1. Using Pre-built Components

```tsx
import { FadeIn } from '@/components/animations/FadeIn'
import { StaggerChildren } from '@/components/animations/StaggerChildren'
import { ScrollReveal } from '@/components/animations/ScrollReveal'

// Fade in from bottom
<FadeIn direction="up" delay={0.2}>
  <div>Content</div>
</FadeIn>

// Stagger children
<StaggerChildren stagger={0.1}>
  <div className="stagger-item">Item 1</div>
  <div className="stagger-item">Item 2</div>
</StaggerChildren>

// Reveal on scroll
<ScrollReveal direction="up">
  <div>Reveals when scrolled into view</div>
</ScrollReveal>
```

### 2. Using the useGsap Hook

```tsx
'use client'

import { useGsap } from '@/hooks/useGsap'

function MyComponent() {
  const container = useGsap((ctx) => {
    ctx.from('.box', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power2.out'
    })
  })

  return (
    <div ref={container}>
      <div className="box">Animated content</div>
    </div>
  )
}
```

### 3. Using Timeline Animations

```tsx
'use client'

import { useGsapTimeline } from '@/hooks/useGsap'

function MyComponent() {
  const container = useGsapTimeline((tl) => {
    tl.from('.title', { opacity: 0, y: -30 })
      .from('.subtitle', { opacity: 0, x: -30 }, '-=0.3')
      .from('.button', { opacity: 0, scale: 0 }, '-=0.2')
  })

  return (
    <div ref={container}>
      <h1 className="title">Title</h1>
      <p className="subtitle">Subtitle</p>
      <button className="button">Click me</button>
    </div>
  )
}
```

### 4. Direct GSAP Usage

```tsx
'use client'

import { gsap } from '@/lib/gsap'

function MyComponent() {
  const handleClick = () => {
    gsap.to('.element', {
      rotation: 360,
      duration: 0.5,
      ease: 'back.out(1.7)'
    })
  }

  return <button onClick={handleClick}>Animate</button>
}
```

## Animation Presets

Import presets from `@/lib/gsap`:

```tsx
import { animations, easings, durations } from '@/lib/gsap'

// Use presets
gsap.fromTo('.element', animations.fadeInUp.from, animations.fadeInUp.to)

// Use easing presets
gsap.to('.element', { x: 100, ease: easings.bounce })

// Use duration presets
gsap.to('.element', { opacity: 1, duration: durations.slow })
```

### Available Presets

**Animations:**
- `fadeInUp` - Fade in from bottom
- `fadeInDown` - Fade in from top
- `fadeInLeft` - Fade in from left
- `fadeInRight` - Fade in from right
- `scaleIn` - Scale in with bounce
- `slideInUp` - Slide in from bottom (for modals)

**Easings:**
- `smooth` - power2.out
- `bounce` - back.out(1.7)
- `elastic` - elastic.out(1, 0.5)
- `quick` - power3.out
- `slow` - power1.inOut

**Durations:**
- `fast` - 0.3s
- `normal` - 0.5s
- `slow` - 0.8s
- `verySlow` - 1.2s

## Common Patterns

### Page Entrance Animation

```tsx
'use client'

import { useGsap } from '@/hooks/useGsap'

export default function Page() {
  const container = useGsap((ctx) => {
    ctx.from('.page-content', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: 'power2.out'
    })
  })

  return (
    <div ref={container}>
      <div className="page-content">
        {/* Your page content */}
      </div>
    </div>
  )
}
```

### Card Hover Animation

```tsx
'use client'

import { gsap } from '@/lib/gsap'

function Card() {
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="rounded-lg bg-card p-6"
    >
      Card content
    </div>
  )
}
```

### Modal Animation

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

function Modal({ isOpen }: { isOpen: boolean }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!modalRef.current) return

    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
      )
    } else {
      gsap.to(modalRef.current, {
        y: '100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in'
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div ref={modalRef} className="modal">
      Modal content
    </div>
  )
}
```

### List Item Stagger

```tsx
'use client'

import { useGsap } from '@/hooks/useGsap'

function List({ items }: { items: string[] }) {
  const container = useGsap((ctx) => {
    ctx.from('.list-item', {
      opacity: 0,
      x: -30,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    })
  })

  return (
    <ul ref={container}>
      {items.map((item, i) => (
        <li key={i} className="list-item">
          {item}
        </li>
      ))}
    </ul>
  )
}
```

## Best Practices

1. **Always use 'use client'** - GSAP requires client-side rendering
2. **Use hooks for cleanup** - `useGsap` and `useGsapTimeline` handle cleanup automatically
3. **Scope animations** - Use GSAP context to scope selectors to specific components
4. **Performance** - Animate transform and opacity for best performance
5. **Accessibility** - Respect `prefers-reduced-motion` for users who prefer less animation

### Respecting Reduced Motion

```tsx
'use client'

import { useEffect, useState } from 'react'
import { gsap } from '@/lib/gsap'

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// Usage
function MyComponent() {
  const prefersReducedMotion = useReducedMotion()

  const container = useGsap((ctx) => {
    ctx.from('.box', {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 50,
      duration: prefersReducedMotion ? 0 : 0.8
    })
  })

  return <div ref={container}>...</div>
}
```

## Visual Examples

Visit `/animations` to see all animation patterns in action with interactive examples.

## Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [GSAP Easing Visualizer](https://greensock.com/ease-visualizer/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
