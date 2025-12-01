'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Switch } from '@/components/ui/Switch'
import { gsap } from '@/lib/gsap'
import { useSecuritySettings } from '@/hooks/useSecuritySettings'
import { DeviceCard, SecuritySkeleton, MFASetupModal } from '@/components/profile'

export default function SecurityAndPrivacyPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showDisableMFAConfirm, setShowDisableMFAConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const {
    settings,
    sessions,
    mfaEnrollment,
    loading,
    startMFAEnrollment,
    verifyMFAEnrollment,
    cancelMFAEnrollment,
    disableMFA,
    toggleLoginAlerts,
    toggleBiometricLock,
    toggleDataPersonalization,
    toggleUsageAnalytics,
    togglePrivateMode,
    signOutSession,
    signOutAllOtherSessions,
    requestDataExport,
    requestDataDeletion,
  } = useSecuritySettings()

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


  const handleToggle2FA = async (enabled: boolean) => {
    if (enabled) {
      setActionLoading('2fa')
      try {
        await startMFAEnrollment()
      } catch (error) {
        console.error('Failed to start MFA enrollment:', error)
        alert('Failed to start 2FA setup. Please try again.')
      } finally {
        setActionLoading(null)
      }
    } else {
      setShowDisableMFAConfirm(true)
    }
  }

  const handleConfirmDisableMFA = async () => {
    setActionLoading('2fa')
    try {
      await disableMFA()
      setShowDisableMFAConfirm(false)
    } catch (error) {
      console.error('Failed to disable MFA:', error)
      alert('Failed to disable 2FA. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerifyMFA = async (code: string) => {
    await verifyMFAEnrollment(code)
    return true
  }

  const handleSignOutDevice = async (id: string) => {
    setActionLoading(`session-${id}`)
    try {
      await signOutSession(id)
    } catch (error) {
      console.error('Failed to sign out device:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSignOutAllOther = async () => {
    const currentSession = sessions.find(s => s.is_current)
    if (currentSession) {
      setActionLoading('signout-all')
      try {
        await signOutAllOtherSessions(currentSession.id)
      } catch (error) {
        console.error('Failed to sign out other sessions:', error)
      } finally {
        setActionLoading(null)
      }
    }
  }

  const handleDataExport = async () => {
    setActionLoading('export')
    try {
      const message = await requestDataExport()
      alert(message)
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDataDeletion = async () => {
    if (confirm('Are you sure you want to request account deletion? This action cannot be undone.')) {
      setActionLoading('delete')
      try {
        const message = await requestDataDeletion()
        alert(message)
      } catch (error) {
        console.error('Failed to request data deletion:', error)
        alert('Failed to submit deletion request. Please try again.')
      } finally {
        setActionLoading(null)
      }
    }
  }

  if (loading) {
    return <SecuritySkeleton />
  }

  // Format sessions for display
  const displaySessions = sessions.length > 0 ? sessions : [
    {
      id: 'current',
      user_id: '',
      device_name: 'Current Device',
      device_type: null,
      location: 'Active now',
      ip_address: null,
      last_seen: new Date().toISOString(),
      is_current: true,
      created_at: new Date().toISOString(),
    }
  ]


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

        {/* Deletion Warning Banner */}
        {settings?.deletion_requested_at && (
          <div data-animate className="mb-6 rounded-2xl bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">
              Account deletion requested on {new Date(settings.deletion_requested_at).toLocaleDateString()}
            </p>
            <p className="mt-1 text-xs text-red-500">
              Your account will be deleted within 30 days. Contact support to cancel.
            </p>
          </div>
        )}

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
                  {settings?.two_factor_enabled
                    ? 'Enabled via authenticator app'
                    : 'Require a code on new devices'}
                </p>
              </div>
              <Switch
                checked={settings?.two_factor_enabled ?? false}
                onCheckedChange={handleToggle2FA}
                disabled={actionLoading === '2fa'}
              />
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
              <Switch
                checked={settings?.login_alerts ?? true}
                onCheckedChange={(checked) => toggleLoginAlerts(checked)}
              />
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
              <Switch
                checked={settings?.biometric_lock ?? false}
                onCheckedChange={(checked) => toggleBiometricLock(checked)}
              />
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
              <Switch
                checked={settings?.data_personalization ?? true}
                onCheckedChange={(checked) => toggleDataPersonalization(checked)}
              />
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
              <Switch
                checked={settings?.usage_analytics ?? true}
                onCheckedChange={(checked) => toggleUsageAnalytics(checked)}
              />
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
              <Switch
                checked={settings?.private_mode ?? false}
                onCheckedChange={(checked) => togglePrivateMode(checked)}
              />
            </div>
            <div className="h-px w-full bg-gray-100" />
          </div>
        </section>

        {/* Sessions & Devices Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#332B10' }}>
            Sessions & Devices
          </h2>
          {displaySessions.map((session) => (
            <DeviceCard
              key={session.id}
              id={session.id}
              name={session.device_name}
              location={session.location || 'Unknown location'}
              lastSeen={session.is_current ? 'Primary device' : `Last seen: ${new Date(session.last_seen).toLocaleDateString()}`}
              isCurrent={session.is_current}
              onSignOut={handleSignOutDevice}
              loading={actionLoading === `session-${session.id}`}
            />
          ))}
          <button
            onClick={handleSignOutAllOther}
            disabled={actionLoading === 'signout-all' || displaySessions.length <= 1}
            className="mt-2 w-full rounded-full bg-amber-100 py-3.5 text-base font-medium text-foreground transition-all hover:bg-amber-200 active:scale-[0.98] disabled:opacity-50"
          >
            {actionLoading === 'signout-all' ? 'Signing out...' : 'Sign out of all other sessions'}
          </button>
        </section>


        {/* Your Data Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#332B10' }}>
            Your Data
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleDataExport}
              disabled={actionLoading === 'export'}
              className="w-full rounded-2xl border bg-white px-4 py-4 text-left transition-all hover:border-gray-300 disabled:opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            >
              <p className="text-base font-medium" style={{ color: '#282828' }}>
                {actionLoading === 'export' ? 'Preparing download...' : 'Download my data'}
              </p>
              <p className="text-sm" style={{ color: '#656565' }}>
                Export your recipes, history, and preferences
              </p>
            </button>
            <button
              onClick={handleDataDeletion}
              disabled={actionLoading === 'delete' || !!settings?.deletion_requested_at}
              className="w-full rounded-2xl border bg-white px-4 py-4 text-left transition-all hover:border-red-300 disabled:opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            >
              <p className="text-base font-medium" style={{ color: '#E53935' }}>
                {settings?.deletion_requested_at
                  ? 'Deletion already requested'
                  : actionLoading === 'delete'
                    ? 'Submitting request...'
                    : 'Request data deletion'}
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

      {/* MFA Setup Modal */}
      <MFASetupModal
        isOpen={!!mfaEnrollment}
        enrollment={mfaEnrollment}
        onVerify={handleVerifyMFA}
        onCancel={cancelMFAEnrollment}
      />

      {/* Disable MFA Confirmation Modal */}
      {showDisableMFAConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold" style={{ color: '#282828' }}>
              Disable Two-Factor Authentication?
            </h3>
            <p className="mb-6 text-sm" style={{ color: '#656565' }}>
              This will make your account less secure. You can always re-enable it later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisableMFAConfirm(false)}
                className="flex-1 rounded-full border border-gray-200 py-3 text-base font-medium transition-colors hover:bg-gray-50"
                style={{ color: '#434343' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisableMFA}
                disabled={actionLoading === '2fa'}
                className="flex-1 rounded-full bg-red-500 py-3 text-base font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50"
              >
                {actionLoading === '2fa' ? 'Disabling...' : 'Disable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
