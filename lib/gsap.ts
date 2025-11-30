/**
 * GSAP utilities and configuration for KitchenPal
 * Centralized GSAP setup for consistent animations
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugins (only on client side)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Common animation presets
 */
export const animations = {
  // Fade in from bottom
  fadeInUp: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
  },
  
  // Fade in from top
  fadeInDown: {
    from: { opacity: 0, y: -30 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
  },
  
  // Fade in from left
  fadeInLeft: {
    from: { opacity: 0, x: -30 },
    to: { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
  },
  
  // Fade in from right
  fadeInRight: {
    from: { opacity: 0, x: 30 },
    to: { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
  },
  
  // Scale in
  scaleIn: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
  },
  
  // Slide in from bottom (for modals)
  slideInUp: {
    from: { y: '100%', opacity: 0 },
    to: { y: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' },
  },
  
  // Stagger children animation
  staggerChildren: {
    stagger: 0.1,
    duration: 0.5,
    ease: 'power2.out',
  },
}

/**
 * Common easing presets
 */
export const easings = {
  smooth: 'power2.out',
  bounce: 'back.out(1.7)',
  elastic: 'elastic.out(1, 0.5)',
  quick: 'power3.out',
  slow: 'power1.inOut',
}

/**
 * Duration presets (in seconds)
 */
export const durations = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  verySlow: 1.2,
}

export { gsap, ScrollTrigger }
