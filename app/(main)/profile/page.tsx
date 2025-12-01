'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useEffect } from 'react'
import { ProfileMenuItem, ProfileSkeleton } from '@/components/profile'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'
import { gsap } from '@/lib/gsap'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, loading } = useProfile()
  const supabase = createClient()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || loading) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      sections,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }
    )
  }, [loading])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  const displayName = profile?.full_name || 'Kitchen Pal User'
  const displayBio = profile?.bio || 'I love to cook amazing food!'
  const avatarUrl = profile?.avatar_url || '/assets/illustrations/avatar-placeholder.svg'

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-md px-6 py-8">
      {/* Header */}
      <h1 data-animate className="mb-6 text-2xl font-bold" style={{ color: '#282828' }}>Profile</h1>

      {/* Profile Info */}
      <div data-animate className="mb-6 flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-200">
          <Image
            src={avatarUrl}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#282828' }}>{displayName}</h2>
          <p className="text-sm" style={{ color: '#656565' }}>{displayBio}</p>
        </div>
      </div>

      {/* Find Recipes Banner */}
      <div data-animate className="mb-8 rounded-2xl bg-brand-primary p-5">
        <p className="mb-4 text-white">
          Find recipes based on what you already have at home!
        </p>
        <button
          onClick={() => router.push('/chat')}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-3 font-medium text-foreground transition-all hover:bg-secondary/90 active:scale-[0.98]"
        >
          <Image
            src="/assets/icons/Search.svg"
            alt=""
            width={20}
            height={20}
            className="opacity-70"
          />
          Find Recipes
        </button>
      </div>

      {/* Preference Section */}
      <section data-animate className="mb-6">
        <h3 className="mb-2 text-lg font-semibold" style={{ color: '#332B10' }}>Preference</h3>
        <ProfileMenuItem
          icon="/assets/icons/Reserve.svg"
          label="My Food Preferences"
          href="/profile/preferences"
        />
      </section>

      {/* Setting Section */}
      <section data-animate className="mb-6">
        <h3 className="mb-2 text-lg font-semibold" style={{ color: '#332B10' }}>Setting</h3>
        <ProfileMenuItem
          icon="/assets/icons/Profile-Circle.svg"
          label="Personal Information"
          href="/profile/personal-info"
        />
        <ProfileMenuItem
          icon="/assets/icons/Notification.svg"
          label="Notification"
          href="/profile/notifications"
        />
        <ProfileMenuItem
          icon="/assets/icons/Security.svg"
          label="Security And Privacy"
          href="/profile/security"
        />
      </section>

      {/* Support Section */}
      <section data-animate className="mb-8">
        <h3 className="mb-2 text-lg font-semibold" style={{ color: '#332B10' }}>Support</h3>
        <ProfileMenuItem
          icon="/assets/icons/Message Question.svg"
          label="Get help"
          href="mailto:reza@joyixir.com"
        />
        <ProfileMenuItem
          icon="/assets/icons/Chef's Hat.svg"
          label="About Kitchen Pal"
          href="/about"
        />
        <ProfileMenuItem
          icon="/assets/icons/Edit.svg"
          label="Give Us Feedback"
          href="/feedback"
        />
      </section>

      {/* Sign Out Button */}
      <div data-animate>
        <button
          onClick={handleSignOut}
          className="w-full rounded-full border-2 py-3 font-medium text-brand-primary transition-all hover:bg-brand-primary/5 active:scale-[0.98]"
          style={{ borderColor: '#797979' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
