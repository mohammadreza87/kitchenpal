'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { gsap } from '@/lib/gsap'

const onboardingSlides = [
  {
    title: 'Welcome to Kitchen Pal',
    description: "Hey there, Glad you're here!\nTime to spice up your cooking game with Kitchen Pal. Ready for some tasty adventures?",
  },
  {
    title: 'Ingredient Alchemy',
    description: "Got ingredients? Sweet!\nTell us what you've got, and we'll whip up a culinary vibe that matches your taste.",
  },
  {
    title: 'Your Culinary Profile',
    description: "Ready for a visual feast? Explore mouthwatering dishes made just for you. Excited? Time to share your vibes, preferences. Your Kitchen Pal is ready to roll with your style!",
  },
]

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const bgShapeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)

  // Initial animation on mount
  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(imageRef.current, 
      { opacity: 0, scale: 0.8, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' }
    )
    .fromTo(titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo(descRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    )
  }, [])

  const animateTransition = (direction: 'next' | 'back', newSlide: number) => {
    const xOut = direction === 'next' ? -80 : 80
    const xIn = direction === 'next' ? 80 : -80

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false)
      }
    })

    // Quick fade out of current content
    tl.to([imageRef.current, titleRef.current, descRef.current], {
      x: xOut,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      stagger: 0.02,
    })
    // Background shape pulses
    .to(bgShapeRef.current, {
      scale: 1.15,
      opacity: 0.35,
      duration: 0.2,
      ease: 'power2.out',
    }, '-=0.2')
    
    // Change slide immediately
    .call(() => setCurrentSlide(newSlide))
    
    // Animate in new content smoothly
    .fromTo([imageRef.current, titleRef.current, descRef.current], 
      { x: xIn, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration: 0.35, 
        ease: 'power2.out',
        stagger: 0.04,
      }
    )
    // Background shape returns
    .to(bgShapeRef.current, {
      scale: 1,
      opacity: 0.25,
      duration: 0.25,
      ease: 'power2.out',
    }, '-=0.3')
  }

  const handleNext = () => {
    if (isAnimating) return

    if (currentSlide < onboardingSlides.length - 1) {
      setIsAnimating(true)
      animateTransition('next', currentSlide + 1)
    } else {
      // Final slide - animate out before navigating to signup
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => router.push('/signup')
      })
    }
  }

  const handleSkip = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => router.push('/signup')
    })
  }

  const handleBack = () => {
    if (isAnimating || currentSlide === 0) return
    setIsAnimating(true)
    animateTransition('back', currentSlide - 1)
  }

  const slide = onboardingSlides[currentSlide]

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div ref={containerRef} className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          {currentSlide > 0 ? (
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}

          {currentSlide < onboardingSlides.length - 1 && (
            <button
              onClick={handleSkip}
              className="text-brand-primary hover:underline"
            >
              Skip
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-12 flex h-80 w-80 items-center justify-center">
              <div ref={imageRef} className="relative flex h-full w-full items-center justify-center">
                <div ref={bgShapeRef} className="absolute inset-0 flex items-center justify-center opacity-25">
                  <img
                    src="/assets/backgrounds/background-shape-3.svg"
                    alt=""
                    className="h-full w-full rotate-90 object-contain"
                  />
                </div>

                <div className="relative z-10 flex h-full w-full items-center justify-center">
                  {currentSlide === 0 && (
                    <img
                      src="/assets/illustrations/onboarding/Onboarding2.svg"
                      alt="Welcome to Kitchen Pal"
                      className="h-full w-full object-contain"
                    />
                  )}
                  {currentSlide === 1 && (
                    <img
                      src="/assets/illustrations/onboarding/Onboarding1.svg"
                      alt="Ingredient Alchemy"
                      className="h-full w-full object-contain"
                    />
                  )}
                  {currentSlide === 2 && (
                    <img
                      src="/assets/illustrations/onboarding/Onboarding3.svg"
                      alt="Your Culinary Profile"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>

          <div className="text-center">
            <h1 ref={titleRef} className="mb-4 text-3xl font-bold">{slide.title}</h1>
            <p ref={descRef} className="mx-auto max-w-md whitespace-pre-line text-muted-foreground">
              {slide.description}
            </p>
          </div>

          {/* Pagination Dots */}
          <div ref={dotsRef} className="mt-12 flex gap-2">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-brand-primary'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="w-full rounded-full bg-brand-primary py-4 text-lg font-medium text-white transition-transform hover:bg-brand-primary-dark active:scale-95 disabled:opacity-70"
          >
            {currentSlide === onboardingSlides.length - 1 ? "Let's Go!" : 'Next'}
          </button>

          {/* Sign In Link */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="font-medium text-brand-primary hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
