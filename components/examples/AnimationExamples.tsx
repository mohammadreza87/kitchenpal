'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { StaggerChildren } from '@/components/animations/StaggerChildren'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { useGsap, useGsapTimeline } from '@/hooks/useGsap'
import { gsap } from '@/lib/gsap'
import { useState } from 'react'

export function AnimationExamples() {
  const [count, setCount] = useState(0)

  // Example: Simple animation
  const simpleBox = useGsap((ctx) => {
    ctx.from('.simple-box', {
      opacity: 0,
      scale: 0.5,
      duration: 1,
      ease: 'back.out(1.7)',
    })
  })

  // Example: Timeline animation
  const timelineBox = useGsapTimeline((tl) => {
    tl.from('.timeline-box', { opacity: 0, y: -50 })
      .from('.timeline-text', { opacity: 0, x: -30 }, '-=0.3')
      .from('.timeline-button', { opacity: 0, scale: 0 }, '-=0.2')
  })

  // Example: Click animation
  const handleClick = () => {
    gsap.to('.click-box', {
      rotation: '+=360',
      scale: 1.2,
      duration: 0.5,
      ease: 'back.out(1.7)',
      onComplete: () => {
        gsap.to('.click-box', { scale: 1, duration: 0.3 })
        setCount((c) => c + 1)
      },
    })
  }

  return (
    <div className="space-y-16 p-8">
      <div>
        <h1 className="mb-8 text-4xl font-bold">GSAP Animation Examples</h1>
        <p className="text-muted-foreground">
          Examples of different animation patterns using GSAP in KitchenPal
        </p>
      </div>

      {/* Simple Animation */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Simple Animation</h2>
        <div ref={simpleBox}>
          <div className="simple-box inline-block rounded-xl bg-brand-primary p-8 text-white">
            <p className="text-lg font-medium">Animated on mount</p>
          </div>
        </div>
      </section>

      {/* Timeline Animation */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Timeline Animation</h2>
        <div ref={timelineBox} className="rounded-xl border bg-card p-8">
          <h3 className="timeline-box mb-4 text-xl font-semibold">Timeline Title</h3>
          <p className="timeline-text mb-4 text-muted-foreground">
            This content animates in sequence using a GSAP timeline
          </p>
          <button className="timeline-button rounded-lg bg-primary px-6 py-2 text-primary-foreground">
            Timeline Button
          </button>
        </div>
      </section>

      {/* Click Animation */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Interactive Animation</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleClick}
            className="click-box rounded-xl bg-brand-secondary p-8 text-brand-secondary-on-container transition-shadow hover:shadow-lg"
          >
            <p className="text-lg font-medium">Click me!</p>
            <p className="text-sm">Clicked: {count} times</p>
          </button>
        </div>
      </section>

      {/* FadeIn Component */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">FadeIn Component</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FadeIn direction="up" delay={0}>
            <div className="rounded-lg bg-brand-primary-container p-6">
              <p className="font-medium text-brand-primary-on-container">Fade Up</p>
            </div>
          </FadeIn>
          <FadeIn direction="down" delay={0.1}>
            <div className="rounded-lg bg-brand-secondary-container p-6">
              <p className="font-medium text-brand-secondary-on-container">Fade Down</p>
            </div>
          </FadeIn>
          <FadeIn direction="left" delay={0.2}>
            <div className="rounded-lg bg-brand-tertiary-container p-6">
              <p className="font-medium text-brand-tertiary-on-container">Fade Left</p>
            </div>
          </FadeIn>
          <FadeIn direction="scale" delay={0.3}>
            <div className="rounded-lg bg-brand-error-container p-6">
              <p className="font-medium text-brand-error-on-container">Scale In</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stagger Children */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Stagger Children</h2>
        <StaggerChildren stagger={0.1}>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="stagger-item rounded-lg border bg-card p-6 shadow-sm"
              >
                <h3 className="mb-2 font-semibold">Item {i}</h3>
                <p className="text-sm text-muted-foreground">
                  Animates with stagger effect
                </p>
              </div>
            ))}
          </div>
        </StaggerChildren>
      </section>

      {/* Scroll Reveal */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Scroll Reveal</h2>
        <p className="mb-8 text-muted-foreground">Scroll down to see these animate</p>
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <ScrollReveal key={i} direction="up" delay={0}>
              <div className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-tertiary p-8 text-white">
                <h3 className="mb-2 text-xl font-semibold">Scroll Item {i}</h3>
                <p>This reveals when you scroll it into view</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Spacer for scroll */}
      <div className="h-96" />
    </div>
  )
}
