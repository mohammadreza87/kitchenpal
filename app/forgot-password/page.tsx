'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { validateEmail } from '@/lib/validation'
import { gsap } from '@/lib/gsap'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const [showSuccessView, setShowSuccessView] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const formRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const handleEmailChange = (value: string) => {
    setError(null)
    setEmail(value)
    if (emailTouched) {
      setEmailError(validateEmail(value))
    }
  }

  const handleEmailBlur = () => {
    setEmailTouched(true)
    setEmailError(validateEmail(email))
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailTouched(true)

    const validationMessage = validateEmail(email)
    setEmailError(validationMessage)

    if (validationMessage) return
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Animate transition to success view
      if (formRef.current) {
        gsap.to(formRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            setSuccess(true)
            setShowSuccessView(true)
            setLoading(false)
          }
        })
      } else {
        setSuccess(true)
        setShowSuccessView(true)
        setLoading(false)
      }
    }
  }

  // Animate success view entrance
  useEffect(() => {
    if (showSuccessView && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
      )
    }
  }, [showSuccessView])

  // Check if form is valid
  const isFormValid = email.trim() !== '' && !validateEmail(email)
  const showEmailError = emailTouched && !!emailError

  if (success) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
        {/* Background Shape */}
        <div className="pointer-events-none fixed inset-x-0 z-0 flex items-end justify-center" style={{ bottom: '-50%' }}>
          <img
            src="/assets/backgrounds/background-shape-3.svg"
            alt=""
            className="h-auto w-full opacity-40 md:w-3/4 lg:w-1/2"
          />
        </div>

        <div ref={successRef} className="relative z-10 mx-auto w-full max-w-md px-6 py-8" style={{ opacity: 0 }}>
          <button
            onClick={() => router.back()}
            className="mb-8 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
          >
            <Image
              src="/assets/icons/Chevron-Left.svg"
              alt="Back"
              width={24}
              height={24}
            />
          </button>

          <div className="flex flex-col items-center justify-center py-12">
            {/* Illustration with background circle */}
            <div className="relative mb-8 flex h-64 w-64 items-center justify-center">
              {/* Background circle behind illustration */}
              <div className="absolute inset-0 rounded-full bg-brand-primary/10" />
              <img
                src="/assets/illustrations/auth/Mailbox.svg"
                alt="Check your email"
                className="relative z-10 h-full w-full object-contain p-4"
              />
            </div>
            <h1 className="mb-4 text-3xl font-bold">Check your Email</h1>
            <p className="mb-8 text-center text-muted-foreground">
              Check your inbox for a password reset email from us!
            </p>

            <button
              onClick={() => window.open('mailto:', '_blank')}
              className="mb-4 w-full rounded-full bg-brand-primary py-4 font-medium text-white hover:bg-brand-primary-dark"
            >
              Open Email App
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-brand-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Background Shape - positioned at bottom, pushed down */}
      <div className="pointer-events-none fixed inset-x-0 z-0 flex items-end justify-center" style={{ bottom: '-50%' }}>
        <img
          src="/assets/backgrounds/background-shape-3.svg"
          alt=""
          className="h-auto w-full opacity-40 md:w-3/4 lg:w-1/2"
        />
      </div>

      <div ref={formRef} className="relative z-10 mx-auto w-full max-w-md px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-8 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
        >
          <Image
            src="/assets/icons/Chevron-Left.svg"
            alt="Back"
            width={24}
            height={24}
          />
        </button>

        <FadeIn direction="up">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground">
              Let&apos;s get you back in! Share your email for a password reset.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-brand-error-container p-4 text-sm text-brand-error-on-container">
                {error}
              </div>
            )}

            {/* Email Input */}
            <FloatingInput
              type="email"
              label="Email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              icon="/assets/icons/Mail.svg"
              error={showEmailError ? emailError || undefined : undefined}
              required
            />

            {/* Reset Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full rounded-full py-4 font-medium transition-colors ${
                isFormValid && !loading
                  ? 'bg-brand-primary text-white hover:bg-brand-primary-dark'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-brand-primary hover:underline">
              Sign In
            </Link>
          </p>
        </FadeIn>
      </div>
    </div>
  )
}
