'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Switch } from '@/components/ui/Switch'
import { gsap } from '@/lib/gsap'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'
import { NotificationsSkeleton } from '@/components/profile'

export default function NotificationPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    settings,
    loading,
    togglePushInspiration,
    togglePushUpdates,
    toggleEmailInspiration,
    toggleEmailUpdates,
    unsubscribeAll,
  } = useNotificationSettings()

  useEffect(() => {
    if (!containerRef.current || loading) return

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
  }, [loading])

  const handleUnsubscribeAll = async () => {
    try {
      await unsubscribeAll()
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
    }
  }

  if (loading) {
    return <NotificationsSkeleton />
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-md px-6 py-8">
      {/* Header */}
      <div data-animate className="mb-6 flex items-center">
        <Link href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted">
          <Image
            src="/assets/icons/Arrow-Left.svg"
            alt="Back"
            width={24}
            height={24}
          />
        </Link>
      </div>

      {/* Title */}
      <h1 data-animate className="mb-8 text-2xl font-bold" style={{ color: '#282828' }}>Notification</h1>

      {/* Push Notification Section */}
      <section data-animate className="mb-8">
        <h2 className="mb-6 text-lg font-semibold" style={{ color: '#332B10' }}>
          Push Notification
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-base" style={{ color: '#434343' }}>Inspiration and Offers</span>
            <Switch
              checked={settings?.push_inspiration ?? true}
              onCheckedChange={(checked) => togglePushInspiration(checked)}
            />
          </div>
          <div className="h-px w-full bg-gray-100" />
          <div className="flex items-center justify-between">
            <span className="text-base" style={{ color: '#434343' }}>Updates and News</span>
            <Switch
              checked={settings?.push_updates ?? false}
              onCheckedChange={(checked) => togglePushUpdates(checked)}
            />
          </div>
          <div className="h-px w-full bg-gray-100" />
        </div>
      </section>

      {/* Email Notification Section */}
      <section data-animate className="mb-12">
        <h2 className="mb-6 text-lg font-semibold" style={{ color: '#332B10' }}>
          Email Notification
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-base" style={{ color: '#434343' }}>Inspiration and Offers</span>
            <Switch
              checked={settings?.email_inspiration ?? false}
              onCheckedChange={(checked) => toggleEmailInspiration(checked)}
            />
          </div>
          <div className="h-px w-full bg-gray-100" />
          <div className="flex items-center justify-between">
            <span className="text-base" style={{ color: '#434343' }}>Updates and News</span>
            <Switch
              checked={settings?.email_updates ?? true}
              onCheckedChange={(checked) => toggleEmailUpdates(checked)}
            />
          </div>
          <div className="h-px w-full bg-gray-100" />
        </div>
      </section>

      {/* Unsubscribe Button */}
      <div data-animate>
        <button
          onClick={handleUnsubscribeAll}
          className="w-full rounded-full py-3.5 text-base font-medium text-brand-primary transition-all hover:bg-brand-primary/5 active:scale-[0.98]"
          style={{ border: '2px solid #797979' }}
        >
          Unsubscribe all
        </button>
      </div>
    </div>
  )
}
