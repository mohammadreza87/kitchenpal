'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from '@/lib/gsap'

const features = [
  {
    icon: '/assets/icons/Chef\'s Hat.svg',
    title: 'Smart Recipe Discovery',
    description: 'Find recipes based on ingredients you already have at home.',
  },
  {
    icon: '/assets/icons/Reserve.svg',
    title: 'Personalized Preferences',
    description: 'Tailored recommendations based on your dietary needs and taste.',
  },
  {
    icon: '/assets/icons/Message.svg',
    title: 'AI Cooking Assistant',
    description: 'Get instant help with cooking tips, substitutions, and techniques.',
  },
  {
    icon: '/assets/icons/Heart.svg',
    title: 'Save Favorites',
    description: 'Build your personal cookbook with recipes you love.',
  },
]

const socialLinks = [
  { icon: '/assets/icons/Instagram.svg', label: 'Instagram', url: '#' },
  { icon: '/assets/icons/Youtube.svg', label: 'YouTube', url: '#' },
  { icon: '/assets/icons/TikTok.svg', label: 'TikTok', url: '#' },
]

export default function AboutPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      sections,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      }
    )
  }, [])

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div ref={containerRef} className="relative z-10 w-full px-6 py-8">
        {/* Header */}
        <div data-animate className="mb-8 flex items-center">
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
        </div>

        {/* App Logo & Info */}
        <div data-animate className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg">
            <Image
              src="/assets/icons/Chef's Hat.svg"
              alt="Kitchen Pal"
              width={48}
              height={48}
              style={{ filter: 'invert(52%) sepia(67%) saturate(1042%) hue-rotate(346deg) brightness(101%) contrast(97%)' }}
            />
          </div>
          <h1 className="mb-1 text-2xl font-bold" style={{ color: '#282828' }}>
            Kitchen Pal
          </h1>
          <p className="mb-2 text-sm" style={{ color: '#656565' }}>
            Your AI-powered cooking companion
          </p>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium" style={{ color: '#656565' }}>
            Version 1.0.0
          </span>
        </div>

        {/* Mission Statement */}
        <div data-animate className="mb-10 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6">
          <h2 className="mb-3 text-lg font-semibold" style={{ color: '#332B10' }}>
            Our Mission
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#656565' }}>
            We believe cooking should be joyful, not stressful. Kitchen Pal is designed to inspire
            your culinary creativity, reduce food waste, and make home cooking accessible to everyone.
            Whether you&apos;re a beginner or a seasoned chef, we&apos;re here to help you create delicious
            meals with what you have.
          </p>
        </div>

        {/* Features */}
        <section data-animate className="mb-10">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#332B10' }}>
            What We Offer
          </h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm"
                style={{ border: '1px solid #f0f0f0' }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={20}
                    height={20}
                    style={{ filter: 'invert(52%) sepia(67%) saturate(1042%) hue-rotate(346deg) brightness(101%) contrast(97%)' }}
                  />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold" style={{ color: '#282828' }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs" style={{ color: '#656565' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Connect With Us */}
        <section data-animate className="mb-10">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#332B10' }}>
            Connect With Us
          </h2>
          <div className="flex justify-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 hover:scale-105"
                aria-label={social.label}
              >
                <Image
                  src={social.icon}
                  alt={social.label}
                  width={24}
                  height={24}
                  className="opacity-70"
                />
              </a>
            ))}
          </div>
        </section>

        {/* Legal Links */}
        <section data-animate className="mb-8">
          <div className="space-y-1">
            <Link
              href="/terms"
              className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <span className="text-sm font-medium" style={{ color: '#363636' }}>Terms of Service</span>
              <Image
                src="/assets/icons/Arrow-Right.svg"
                alt=""
                width={20}
                height={20}
                className="opacity-40"
              />
            </Link>
            <Link
              href="/privacy"
              className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <span className="text-sm font-medium" style={{ color: '#363636' }}>Privacy Policy</span>
              <Image
                src="/assets/icons/Arrow-Right.svg"
                alt=""
                width={20}
                height={20}
                className="opacity-40"
              />
            </Link>
            <Link
              href="/licenses"
              className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <span className="text-sm font-medium" style={{ color: '#363636' }}>Open Source Licenses</span>
              <Image
                src="/assets/icons/Arrow-Right.svg"
                alt=""
                width={20}
                height={20}
                className="opacity-40"
              />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <div data-animate className="text-center">
          <p className="mb-2 text-xs" style={{ color: '#9ca3af' }}>
            Made with love for home cooks everywhere
          </p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            &copy; {new Date().getFullYear()} Kitchen Pal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
