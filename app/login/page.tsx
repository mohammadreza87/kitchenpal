'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { validateEmail, validatePassword } from '@/lib/validation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ email: false, password: false })
  const router = useRouter()
  const supabase = createClient()

  const updateEmail = (value: string) => {
    setError(null)
    setEmail(value)
    if (touched.email) {
      setEmailError(validateEmail(value))
    }
  }

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }))
    setEmailError(validateEmail(email))
  }

  const updatePassword = (value: string) => {
    setError(null)
    setPassword(value)
    if (touched.password) {
      setPasswordError(validatePassword(value))
    }
  }

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }))
    setPasswordError(validatePassword(password))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const nextTouched = { email: true, password: true }
    setTouched(nextTouched)

    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)
    setEmailError(emailValidation)
    setPasswordError(passwordValidation)

    if (emailValidation || passwordValidation) return
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/home')
    }
  }

  // Check if form is valid
  const isFormValid = !validateEmail(email) && !validatePassword(password)
  const showEmailError = touched.email && !!emailError
  const showPasswordError = touched.password && !!passwordError

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="mx-auto w-full max-w-md px-6 py-8">
      {/* Background Shape - positioned at bottom, pushed down */}
      <div className="pointer-events-none fixed inset-x-0 z-0 flex items-end justify-center" style={{ bottom: '-50%' }}>
        <img
          src="/assets/backgrounds/background-shape-3.svg"
          alt=""
          className="h-auto w-full opacity-40 md:w-3/4 lg:w-1/2"
        />
      </div>

      <FadeIn direction="up">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Welcome Back Pal!</h1>
          <p className="text-muted-foreground">Login to your account.</p>
        </div>

        <div className="relative">
          {/* Hand Image - positioned to align bottom with top of email input */}
          <div className="absolute -top-24 right-0 z-10 h-24 w-24">
            <img
              src="/assets/icons/3D Hand.svg"
              alt="Welcome"
              className="h-full w-full object-contain"
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
            onChange={(e) => updateEmail(e.target.value)}
            onBlur={handleEmailBlur}
            icon="/assets/icons/Mail.svg"
            error={showEmailError ? emailError || undefined : undefined}
            required
          />

          {/* Password Input */}
          <FloatingInput
            type="password"
            label="Password"
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
            onBlur={handlePasswordBlur}
            icon="/assets/icons/Lock.svg"
            error={showPasswordError ? passwordError || undefined : undefined}
            required
            minLength={6}
          />

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Forgot Your password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full rounded-full py-4 font-medium transition-colors ${
              isFormValid && !loading
                ? 'bg-brand-primary text-white hover:bg-brand-primary-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          </form>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-muted-foreground">or Sign In with</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white py-4 font-medium transition-colors hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-gray-600">Gmail</span>
        </button>

        {/* Sign Up Link */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-brand-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </FadeIn>
      </div>
    </div>
  )
}
