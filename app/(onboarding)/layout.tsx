'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'

const steps = [
  { path: '/preferences', progress: 25, nextPath: '/cuisine', buttonText: 'Next' },
  { path: '/cuisine', progress: 50, nextPath: '/allergies', buttonText: 'Next' },
  { path: '/allergies', progress: 75, nextPath: '/cooking-skills', buttonText: 'Next' },
  { path: '/cooking-skills', progress: 100, nextPath: '/home', buttonText: 'Done' },
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const progressRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const currentStepIndex = steps.findIndex((step) => step.path === pathname)
  const currentStep = steps[currentStepIndex] || steps[0]
  const isFirstStep = currentStepIndex === 0

  // Prefetch next page
  useEffect(() => {
    if (currentStep.nextPath && currentStep.nextPath !== '/home') {
      router.prefetch(currentStep.nextPath)
    }
  }, [currentStep.nextPath, router])

  // Animate progress bar when route changes
  useEffect(() => {
    if (!progressRef.current) return

    gsap.to(progressRef.current, {
      width: `${currentStep.progress}%`,
      duration: 0.5,
      ease: 'power2.out',
    })
  }, [currentStep.progress])

  // Animate content on route change
  useEffect(() => {
    if (!contentRef.current) return

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
    )
  }, [pathname])

  const handleBack = () => {
    if (isAnimating || isFirstStep) return
    setIsAnimating(true)

    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        x: 30,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          router.back()
          setIsAnimating(false)
        },
      })
    } else {
      router.back()
      setIsAnimating(false)
    }
  }

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)

    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          router.push(currentStep.nextPath)
          setIsAnimating(false)
        },
      })
    } else {
      router.push(currentStep.nextPath)
      setIsAnimating(false)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* Header - Back button and Progress bar */}
      <div className="mx-auto w-full max-w-md flex-shrink-0 px-6 pt-8">
        {/* Back Button or Spacer */}
        {isFirstStep ? (
          <div className="mb-4 h-10" />
        ) : (
          <button
            onClick={handleBack}
            disabled={isAnimating}
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Image
              src="/assets/icons/Arrow-Left.svg"
              alt="Back"
              width={24}
              height={24}
            />
          </button>
        )}

        {/* Progress Bar - Persistent */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-1 w-full flex-1 overflow-hidden rounded-full bg-gray-200">
            <div
              ref={progressRef}
              className="h-full rounded-full bg-brand-primary"
              style={{ width: `${currentStep.progress}%` }}
            />
          </div>
          <button
            onClick={handleSkip}
            disabled={isAnimating}
            className="text-sm font-medium text-brand-primary hover:underline disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-auto w-full max-w-md px-6 pb-24">
          <div ref={contentRef}>{children}</div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-background px-6 py-4">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="w-full rounded-full bg-brand-primary py-4 font-medium text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-50"
          >
            {currentStep.buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
