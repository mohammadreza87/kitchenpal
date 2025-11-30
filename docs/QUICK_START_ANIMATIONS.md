# Quick Start: Animations

## 5-Minute Guide to GSAP in KitchenPal

### 1. Simple Fade In (Easiest)

```tsx
import { FadeIn } from '@/components/animations/FadeIn'

export default function MyPage() {
  return (
    <FadeIn direction="up">
      <h1>This fades in from bottom</h1>
    </FadeIn>
  )
}
```

**Directions:** `up`, `down`, `left`, `right`, `scale`

### 2. List with Stagger Effect

```tsx
import { StaggerChildren } from '@/components/animations/StaggerChildren'

export default function MyList() {
  return (
    <StaggerChildren stagger={0.1}>
      <div className="stagger-item">Item 1</div>
      <div className="stagger-item">Item 2</div>
      <div className="stagger-item">Item 3</div>
    </StaggerChildren>
  )
}
```

**Important:** Children must have `className="stagger-item"`

### 3. Reveal on Scroll

```tsx
import { ScrollReveal } from '@/components/animations/ScrollReveal'

export default function MyPage() {
  return (
    <ScrollReveal direction="up">
      <div>Reveals when scrolled into view</div>
    </ScrollReveal>
  )
}
```

### 4. Custom Animation

```tsx
'use client'

import { useGsap } from '@/hooks/useGsap'

export default function MyComponent() {
  const container = useGsap((ctx) => {
    ctx.from('.my-element', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power2.out'
    })
  })

  return (
    <div ref={container}>
      <div className="my-element">Animated content</div>
    </div>
  )
}
```

**Remember:** Add `'use client'` at the top!

### 5. Button Click Animation

```tsx
'use client'

import { gsap } from '@/lib/gsap'

export default function MyButton() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out'
    })
  }

  return (
    <button onClick={handleClick}>
      Click me for animation
    </button>
  )
}
```

### 6. Card Hover Effect

```tsx
'use client'

import { gsap } from '@/lib/gsap'

export default function Card() {
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: -10,
      scale: 1.02,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
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

### 7. Sequential Timeline

```tsx
'use client'

import { useGsapTimeline } from '@/hooks/useGsap'

export default function Hero() {
  const container = useGsapTimeline((tl) => {
    tl.from('.title', { opacity: 0, y: -30, duration: 0.6 })
      .from('.subtitle', { opacity: 0, x: -30, duration: 0.6 }, '-=0.3')
      .from('.cta', { opacity: 0, scale: 0, duration: 0.4 }, '-=0.2')
  })

  return (
    <div ref={container}>
      <h1 className="title">Welcome</h1>
      <p className="subtitle">To KitchenPal</p>
      <button className="cta">Get Started</button>
    </div>
  )
}
```

**Tip:** `-=0.3` means "start 0.3s before previous animation ends"

## Common Patterns

### Page Entrance

```tsx
'use client'

import { useGsap } from '@/hooks/useGsap'

export default function Page() {
  const container = useGsap((ctx) => {
    ctx.from('.page-content', {
      opacity: 0,
      y: 20,
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

### Modal Animation

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export default function Modal({ isOpen }: { isOpen: boolean }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!modalRef.current) return

    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
      )
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div ref={modalRef}>
      Modal content
    </div>
  )
}
```

## Animation Presets

```tsx
import { animations, easings, durations } from '@/lib/gsap'

// Use presets
gsap.fromTo('.element', animations.fadeInUp.from, animations.fadeInUp.to)

// Custom with presets
gsap.to('.element', {
  x: 100,
  ease: easings.bounce,
  duration: durations.slow
})
```

## Tips

1. **Always use `'use client'`** for components with animations
2. **Use hooks** (`useGsap`, `useGsapTimeline`) for automatic cleanup
3. **Scope selectors** with classes to avoid conflicts
4. **Animate transform & opacity** for best performance
5. **Test on mobile** - animations should feel smooth

## See More

- Full examples: Visit `/animations` in your browser
- Complete docs: `docs/ANIMATIONS.md`
- GSAP docs: https://greensock.com/docs/
