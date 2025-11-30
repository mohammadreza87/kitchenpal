'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Kitchen Pal, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. We reserve the right to modify these terms at any time, and your continued use of the app constitutes acceptance of any changes.`,
  },
  {
    title: '2. Description of Service',
    content: `Kitchen Pal is an AI-powered cooking companion that helps you discover recipes, plan meals, and improve your cooking skills. Our service includes recipe recommendations, ingredient-based search, personalized dietary preferences, and an AI cooking assistant.`,
  },
  {
    title: '3. User Accounts',
    content: `To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information and update it as necessary. We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '4. User Content',
    content: `You may submit content such as recipes, reviews, and feedback. You retain ownership of your content but grant us a license to use, display, and distribute it within the app. You are responsible for ensuring your content does not violate any laws or third-party rights.`,
  },
  {
    title: '5. Acceptable Use',
    content: `You agree not to misuse our service. This includes not attempting to access unauthorized areas, not interfering with other users, not uploading malicious content, and not using the service for any illegal purposes. We may suspend access for violations.`,
  },
  {
    title: '6. Intellectual Property',
    content: `Kitchen Pal and its content, features, and functionality are owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission.`,
  },
  {
    title: '7. Disclaimers',
    content: `Kitchen Pal is provided "as is" without warranties of any kind. We do not guarantee the accuracy of recipes or nutritional information. Always use your judgment when cooking, especially regarding food allergies and safety. We are not responsible for any adverse reactions or outcomes.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the past twelve months.`,
  },
  {
    title: '9. Changes to Service',
    content: `We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will provide notice of significant changes when possible but are not obligated to do so.`,
  },
  {
    title: '10. Contact Information',
    content: `If you have questions about these Terms of Service, please contact us at support@kitchenpal.app or through the feedback feature in the app.`,
  },
]

export default function TermsPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const elements = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      elements,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
      }
    )
  }, [])

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div ref={containerRef} className="relative z-10 mx-auto w-full max-w-md px-6 py-8">
        {/* Header */}
        <div data-animate className="mb-6 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <Image
              src="/assets/icons/Arrow-Left.svg"
              alt="Back"
              width={24}
              height={24}
            />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: '#282828' }}>
            Terms of Service
          </h1>
        </div>

        {/* Last Updated */}
        <div data-animate className="mb-8">
          <p className="text-sm" style={{ color: '#656565' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <div data-animate className="mb-8 rounded-xl bg-amber-50 p-4">
          <p className="text-sm leading-relaxed" style={{ color: '#656565' }}>
            Welcome to Kitchen Pal! These Terms of Service govern your use of our application
            and services. Please read them carefully before using our app.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <section key={index} data-animate>
              <h2 className="mb-2 text-base font-semibold" style={{ color: '#332B10' }}>
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#656565' }}>
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div data-animate className="mt-10 border-t pt-6" style={{ borderColor: '#e5e7eb' }}>
          <p className="text-center text-xs" style={{ color: '#9ca3af' }}>
            &copy; {new Date().getFullYear()} Kitchen Pal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
