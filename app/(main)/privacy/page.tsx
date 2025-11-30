'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly, such as your name, email address, dietary preferences, and cooking habits. We also automatically collect usage data, device information, and cookies to improve your experience.`,
    items: [
      'Account information (name, email, profile photo)',
      'Dietary preferences and restrictions',
      'Saved recipes and cooking history',
      'Device and usage information',
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your information to provide and improve our services, personalize your experience, and communicate with you about updates and features.`,
    items: [
      'Provide personalized recipe recommendations',
      'Save your preferences and favorites',
      'Improve our AI cooking assistant',
      'Send service updates and notifications',
      'Analyze usage patterns to enhance the app',
    ],
  },
  {
    title: '3. Information Sharing',
    content: `We do not sell your personal information. We may share data with service providers who help us operate the app, or when required by law. Any third parties are bound by confidentiality agreements.`,
    items: [
      'Cloud hosting providers',
      'Analytics services',
      'Customer support tools',
      'Legal requirements when necessary',
    ],
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and regular security audits. However, no method of transmission is 100% secure.`,
  },
  {
    title: '5. Your Rights',
    content: `You have the right to access, correct, or delete your personal data. You can also opt out of marketing communications and request data portability. Contact us to exercise these rights.`,
    items: [
      'Access your personal data',
      'Correct inaccurate information',
      'Delete your account and data',
      'Export your data',
      'Opt out of marketing emails',
    ],
  },
  {
    title: '6. Cookies and Tracking',
    content: `We use cookies and similar technologies to remember your preferences, analyze usage, and improve our service. You can control cookies through your browser settings, though some features may not work properly without them.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `Kitchen Pal is not intended for children under 13. We do not knowingly collect information from children. If you believe a child has provided us with personal data, please contact us to have it removed.`,
  },
  {
    title: '8. International Transfers',
    content: `Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable laws.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via email. Your continued use after changes constitutes acceptance.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, please contact us at privacy@kitchenpal.app or through the app's feedback feature.`,
  },
]

export default function PrivacyPage() {
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
            Privacy Policy
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
            Your privacy is important to us. This Privacy Policy explains how Kitchen Pal
            collects, uses, and protects your personal information when you use our app.
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
              {section.items && (
                <ul className="mt-2 space-y-1 pl-4">
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: '#656565' }}
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
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
