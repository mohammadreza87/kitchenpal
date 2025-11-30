'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Switch } from '@/components/ui/Switch'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'

type Device = {
  id: string
  name: string
  location: string
  lastSeen: string
  current?: boolean
}

const devices: Device[] = [
  {
    id: 'current',
    name: 'iPhone 15 Pro',
    location: 'Amsterdam · Active now',
    lastSeen: 'Primary device',
    current: true,
  },
  {
    id: 'mac',
    name: 'MacBook Air',
    location: 'Amsterdam · 2 hours ago',
    lastSeen: 'Trusted device',
  },
  {
    id: 'ipad',
    name: 'iPad Mini',
    location: 'Rotterdam · 3 days ago',
    lastSeen: 'Remembered device',
  },
]

interface DeviceCardProps {
  device: Device
  onSignOut: (id: string) => void
}

function DeviceCard({ device, onSignOut }: DeviceCardProps) {
  return (
    <div
      className={cn(
        'mb-3 rounded-2xl border bg-white px-4 py-3',
        device.current ? 'border-brand-primary' : 'border-gray-200'
      )}
      style={{ borderColor: device.current ? '#FF7043' : '#e5e7eb' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-2xl',
              device.current ? 'bg-amber-100' : 'bg-gray-100'
            )}
          >
            <Image
              src={device.current ? '/assets/icons/Lock-2.svg' : '/assets/icons/Global.svg'}
              alt=""
              width={22}
              height={22}
              style={device.current ? { filter: 'invert(52%) sepia(67%) saturate(1042%) hue-rotate(346deg) brightness(101%) contrast(97%)' } : {}}
            />
          </div>
          <div>
            <p className="text-base font-semibold" style={{ color: '#363636' }}>
              {device.name}
            </p>
            <p className="text-sm" style={{ color: '#656565' }}>
              {device.location}
            </p>
            <p className="mt-1 text-xs font-medium" style={{ color: '#332B10' }}>
              {device.lastSeen}
            </p>
          </div>
        </div>
        {!device.current && (
          <button
            onClick={() => onSignOut(device.id)}
            className="rounded-full border px-3 py-2 text-sm font-medium transition-all hover:bg-brand-primary/5 active:scale-[0.98]"
            style={{ borderColor: '#ffc5b4', color: '#FF7043' }}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  )
}

export default function SecurityAndPrivacyPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [biometricLock, setBiometricLock] = useState(false)
  const [dataPersonalization, setDataPersonalization] = useState(true)
  const [usageAnalytics, setUsageAnalytics] = useState(true)
  const [privateMode, setPrivateMode] = useState(false)

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

  const handleSignOutDevice = (id: string) => {
    console.info(`Sign out requested for device: ${id}`)
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div ref={containerRef} className="relative z-10 mx-auto w-full max-w-md px-6 py-8">
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
        <h1 data-animate className="mb-8 text-2xl font-bold" style={{ color: '#282828' }}>
          Security & Privacy
        </h1>

        {/* Account Protection Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-6 text-lg font-semibold" style={{ color: '#332B10' }}>
            Account Protection
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-base font-medium" style={{ color: '#434343' }}>
                  Two-factor authentication
                </p>
                <p className="text-sm" style={{ color: '#656565' }}>
                  Require a code on new devices
                </p>
              </div>
              <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
            </div>
            <div className="h-px w-full bg-gray-100" />
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-base font-medium" style={{ color: '#434343' }}>
                  Login alerts
                </p>
                <p className="text-sm" style={{ color: '#656565' }}>
                  Get notified of new sessions
                </p>
              </div>
              <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
            </div>
            <div className="h-px w-full bg-gray-100" />
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-base font-medium" style={{ color: '#434343' }}>
                  Biometric lock
                </p>
                <p className="text-sm" style={{ color: '#656565' }}>
                  Use Face ID or fingerprint
                </p>
              </div>
              <Switch checked={biometricLock} onCheckedChange={setBiometricLock} />
            </div>
            <div className="h-px w-full bg-gray-100" />
          </div>
        </section>

        {/* Privacy Controls Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-6 text-lg font-semibold" style={{ color: '#332B10' }}>
            Privacy Controls
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-base font-medium" style={{ color: '#434343' }}>
                  Personalized recommendations
                </p>
                <p className="text-sm" style={{ color: '#656565' }}>
                  Tailor recipes to your taste
                </p>
              </div>
              <Switch checked={dataPersonalization} onCheckedChange={setDataPersonalization} />
            </div>
            <div className="h-px w-full bg-gray-100" />
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-base font-medium" style={{ color: '#434343' }}>
                  Privacy-safe analytics
                </p>
                <p className="text-sm" style={{ color: '#656565' }}>
                  Help us improve the app
                </p>
              </div>
              <Switch checked={usageAnalytics} onCheckedChange={setUsageAnalytics} />
            </div>
            <div className="h-px w-full bg-gray-100" />
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-base font-medium" style={{ color: '#434343' }}>
                  Private mode
                </p>
                <p className="text-sm" style={{ color: '#656565' }}>
                  Hide history and previews
                </p>
              </div>
              <Switch checked={privateMode} onCheckedChange={setPrivateMode} />
            </div>
            <div className="h-px w-full bg-gray-100" />
          </div>
        </section>

        {/* Sessions & Devices Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#332B10' }}>
            Sessions & Devices
          </h2>
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} onSignOut={handleSignOutDevice} />
          ))}
          <button className="mt-2 w-full rounded-full bg-amber-100 py-3.5 text-base font-medium text-foreground transition-all hover:bg-amber-200 active:scale-[0.98]">
            Sign out of all other sessions
          </button>
        </section>

        {/* Your Data Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#332B10' }}>
            Your Data
          </h2>
          <div className="space-y-3">
            <button className="w-full rounded-2xl border bg-white px-4 py-4 text-left transition-all hover:border-gray-300" style={{ borderColor: '#e5e7eb' }}>
              <p className="text-base font-medium" style={{ color: '#282828' }}>
                Download my data
              </p>
              <p className="text-sm" style={{ color: '#656565' }}>
                Export your recipes, history, and preferences
              </p>
            </button>
            <button className="w-full rounded-2xl border bg-white px-4 py-4 text-left transition-all hover:border-red-300" style={{ borderColor: '#e5e7eb' }}>
              <p className="text-base font-medium" style={{ color: '#E53935' }}>
                Request data deletion
              </p>
              <p className="text-sm" style={{ color: '#656565' }}>
                Close your account and erase personal data
              </p>
            </button>
          </div>
        </section>

        {/* Support Section */}
        <section data-animate>
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#FFF3E0' }}>
            <p className="mb-2 text-base font-semibold" style={{ color: '#282828' }}>
              Need to report a concern?
            </p>
            <p className="mb-4 text-sm" style={{ color: '#656565' }}>
              We respond quickly to security and privacy issues.
            </p>
            <a
              href="mailto:support@kitchenpal.app"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#FF7043' }}
            >
              <Image
                src="/assets/icons/Mail.svg"
                alt=""
                width={18}
                height={18}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              Contact security support
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
