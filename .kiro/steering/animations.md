---
title: KitchenPal Animation Standards
inclusion: always
---

# Animation Standards

## Always Use GSAP for Animations

KitchenPal uses GSAP for all animations. Never use CSS animations or other animation libraries.

## Quick Reference

### Pre-built Components (Easiest)

```tsx
import { FadeIn } from '@/components/animations/FadeIn'
import { StaggerChildren } from '@/components/animations/StaggerChildren'
import { ScrollReveal } from '@/components/animations/ScrollReveal'

// Fade in
<FadeIn direction="up" delay={0.2}>
  <div>Content</div>
</FadeIn>

// Stagger children
<StaggerChildren stagger={0.1}>
  <div className="stagger-item">Item 1</div>
  <div className="stagger-item">Item 2</div>
</StaggerChildren>

// Scroll reveal
<ScrollReveal direction="up">
  <div>Reveals on scroll</div>
</ScrollReveal>
```

### Custom Animations

```tsx
'use client'

import { useGsap } from '@/hooks/useGsap'

function MyComponent() {
  const container = useGsap((ctx) => {
    ctx.from('.element', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power2.out'
    })
  })

  return (
    <div ref={container}>
      <div className="element">Content</div>
    </div>
  )
}
```

### Timeline Animations

```tsx
'use client'

import { useGsapTimeline } from '@/hooks/useGsap'

function MyComponent() {
  const container = useGsapTimeline((tl) => {
    tl.from('.title', { opacity: 0, y: -30 })
      .from('.subtitle', { opacity: 0, x: -30 }, '-=0.3')
      .from('.button', { opacity: 0, scale: 0 }, '-=0.2')
  })

  return <div ref={container}>...</div>
}
```

## Animation Presets

Use presets from `@/lib/gsap`:

```tsx
import { animations, easings, durations } from '@/lib/gsap'

// Available animations
animations.fadeInUp
animations.fadeInDown
animations.fadeInLeft
animations.fadeInRight
animations.scaleIn
animations.slideInUp

// Available easings
easings.smooth // power2.out
easings.bounce // back.out(1.7)
easings.elastic
easings.quick
easings.slow

// Available durations
durations.fast // 0.3s
durations.normal // 0.5s
durations.slow // 0.8s
durations.verySlow // 1.2s
```

## Rules

1. ✅ Always use `'use client'` directive for animated components
2. ✅ Use `useGsap` or `useGsapTimeline` hooks for automatic cleanup
3. ✅ Animate `transform` and `opacity` for best performance
4. ✅ Use animation presets for consistency
5. ❌ Don't use CSS animations or transitions for complex animations
6. ❌ Don't forget to scope selectors to avoid conflicts

## Full Documentation

- Complete guide: `docs/ANIMATIONS.md`
- Visual examples: `/animations` page
- GSAP docs: https://greensock.com/docs/
