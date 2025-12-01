'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/gsap'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

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
        stagger: 0.05,
        ease: 'power2.out',
      }
    )
  }, [])

  const handleDelete = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setDeleting(true)

    try {
      // Sign out the user (account deletion would typically be handled server-side)
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error during account deletion:', error)
      setDeleting(false)
    }
  }

  return (
    <div ref={containerRef} className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background px-6 py-8">
      {/* Header */}
      <div data-animate className="mb-8 flex items-center gap-4">
        <Link href="/profile/personal-info" className="transition-opacity hover:opacity-70">
          <Image
            src="/assets/icons/Arrow-Left.svg"
            alt="Back"
            width={24}
            height={24}
          />
        </Link>
        <h1 className="text-2xl font-bold">Delete Account</h1>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pb-20">
        {/* Illustration */}
        <div data-animate className="mb-8 relative h-64 w-full max-w-[280px]">
          <Image
            src="/assets/illustrations/auth/DeleteAccountProperty 1=1.svg"
            alt="Sad illustration"
            fill
            className="object-contain"
          />
        </div>

        {/* Warning Text */}
        <div data-animate className="mb-12 text-center">
          <p className="text-base leading-relaxed text-gray-600">
            When you delete your account, all your information will be permanently removed.
            We&apos;re sad to see you go, but we respect your decision to move on.
          </p>
        </div>

        {/* Actions */}
        <div data-animate className="w-full space-y-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-full border border-red-500 py-3.5 text-base font-medium text-red-500 transition-all hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>

          <Link
            href="/profile/personal-info"
            className="flex w-full items-center justify-center rounded-full bg-brand-primary py-3.5 text-base font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Background Shape */}
      <div className="absolute bottom-0 left-0 right-0 -z-0">
        <Image
          src="/assets/backgrounds/background-shape-3.svg"
          alt=""
          width={400}
          height={200}
          className="w-full object-cover opacity-30"
        />
      </div>
    </div>
  )
}
