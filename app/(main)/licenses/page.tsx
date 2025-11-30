'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'

const licenses = [
  {
    name: 'Next.js',
    version: '14.x',
    license: 'MIT',
    description: 'The React Framework for the Web',
    url: 'https://nextjs.org',
  },
  {
    name: 'React',
    version: '18.x',
    license: 'MIT',
    description: 'A JavaScript library for building user interfaces',
    url: 'https://react.dev',
  },
  {
    name: 'Tailwind CSS',
    version: '3.x',
    license: 'MIT',
    description: 'A utility-first CSS framework',
    url: 'https://tailwindcss.com',
  },
  {
    name: 'GSAP',
    version: '3.x',
    license: 'Standard License',
    description: 'Professional-grade animation library',
    url: 'https://greensock.com/gsap',
  },
  {
    name: 'Supabase',
    version: '2.x',
    license: 'Apache 2.0',
    description: 'Open source Firebase alternative',
    url: 'https://supabase.com',
  },
  {
    name: 'Radix UI',
    version: '1.x',
    license: 'MIT',
    description: 'Unstyled, accessible UI components',
    url: 'https://www.radix-ui.com',
  },
  {
    name: 'Lucide Icons',
    version: '0.x',
    license: 'ISC',
    description: 'Beautiful & consistent icon toolkit',
    url: 'https://lucide.dev',
  },
  {
    name: 'date-fns',
    version: '3.x',
    license: 'MIT',
    description: 'Modern JavaScript date utility library',
    url: 'https://date-fns.org',
  },
  {
    name: 'Zod',
    version: '3.x',
    license: 'MIT',
    description: 'TypeScript-first schema validation',
    url: 'https://zod.dev',
  },
  {
    name: 'TypeScript',
    version: '5.x',
    license: 'Apache 2.0',
    description: 'JavaScript with syntax for types',
    url: 'https://www.typescriptlang.org',
  },
]

function LicenseItem({
  name,
  version,
  license,
  description,
  url
}: {
  name: string
  version: string
  license: string
  description: string
  url: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="rounded-xl bg-white transition-all"
      style={{ border: '1px solid #f0f0f0' }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: '#282828' }}>
              {name}
            </h3>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs" style={{ color: '#656565' }}>
              {version}
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: '#656565' }}>
            {description}
          </p>
        </div>
        <Image
          src="/assets/icons/Arrow-Down.svg"
          alt=""
          width={20}
          height={20}
          className={cn(
            'opacity-40 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t px-4 py-3" style={{ borderColor: '#f0f0f0' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: '#332B10' }}>License</p>
              <p className="text-sm" style={{ color: '#656565' }}>{license}</p>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-200"
              style={{ color: '#656565' }}
            >
              <Image
                src="/assets/icons/Link.svg"
                alt=""
                width={14}
                height={14}
                className="opacity-60"
              />
              Website
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LicensesPage() {
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
            Open Source Licenses
          </h1>
        </div>

        {/* Introduction */}
        <div data-animate className="mb-8 rounded-xl bg-amber-50 p-4">
          <p className="text-sm leading-relaxed" style={{ color: '#656565' }}>
            Kitchen Pal is built with the help of amazing open source software.
            We're grateful to the developers and communities behind these projects.
          </p>
        </div>

        {/* License Count */}
        <div data-animate className="mb-4">
          <p className="text-sm" style={{ color: '#656565' }}>
            {licenses.length} packages
          </p>
        </div>

        {/* Licenses List */}
        <div className="space-y-3">
          {licenses.map((lib, index) => (
            <div key={lib.name} data-animate>
              <LicenseItem {...lib} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div data-animate className="mt-10 border-t pt-6" style={{ borderColor: '#e5e7eb' }}>
          <p className="text-center text-xs" style={{ color: '#9ca3af' }}>
            Thank you to all the open source contributors!
          </p>
        </div>
      </div>
    </div>
  )
}
