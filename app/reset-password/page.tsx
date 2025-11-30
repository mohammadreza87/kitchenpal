'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FadeIn } from '@/components/animations/FadeIn'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { validatePassword, validatePasswordsMatch } from '@/lib/validation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ password: false, confirm: false })
  const router = useRouter()
  const supabase = createClient()

  const updatePassword = (value: string) => {
    setFormError(null)
    setPassword(value)
    if (touched.password) setPasswordError(validatePassword(value))
    if (touched.confirm) setConfirmError(validatePasswordsMatch(value, confirmPassword))
  }

  const updateConfirmPassword = (value: string) => {
    setFormError(null)
    setConfirmPassword(value)
    if (touched.confirm) setConfirmError(validatePasswordsMatch(password, value))
  }

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }))
    setPasswordError(validatePassword(password))
    if (confirmPassword) {
      setConfirmError(validatePasswordsMatch(password, confirmPassword))
    }
  }

  const handleConfirmBlur = () => {
    setTouched((prev) => ({ ...prev, confirm: true }))
    setConfirmError(validatePasswordsMatch(password, confirmPassword))
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const nextTouched = { password: true, confirm: true }
    setTouched(nextTouched)

    const passwordValidation = validatePassword(password)
    const confirmValidation = validatePasswordsMatch(password, confirmPassword)

    setPasswordError(passwordValidation)
    setConfirmError(confirmValidation)

    if (passwordValidation || confirmValidation) return

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setFormError(error.message)
      setLoading(false)
    } else {
      router.push('/home')
    }
  }

  const isFormValid =
    !validatePassword(password) &&
    !validatePasswordsMatch(password, confirmPassword)

  const showPasswordError = touched.password && !!passwordError
  const showConfirmError = touched.confirm && !!confirmError

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

      <div className="relative z-10 mx-auto w-full max-w-md px-6 py-8">
      <FadeIn direction="up">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Set New Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-brand-error-container p-4 text-sm text-brand-error-on-container">
              {formError}
            </div>
          )}

          {/* New Password Input */}
          <FloatingInput
            type="password"
            label="New Password"
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
            onBlur={handlePasswordBlur}
            icon="/assets/icons/Lock.svg"
            error={showPasswordError ? passwordError || undefined : undefined}
            required
            minLength={6}
          />

          {/* Confirm Password Input */}
          <FloatingInput
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => updateConfirmPassword(e.target.value)}
            onBlur={handleConfirmBlur}
            icon="/assets/icons/Lock.svg"
            error={showConfirmError ? confirmError || undefined : undefined}
            required
            minLength={6}
          />

          {/* Update Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full rounded-full py-4 font-medium transition-colors ${
              isFormValid && !loading
                ? 'bg-brand-primary text-white hover:bg-brand-primary-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </FadeIn>
      </div>
    </div>
  )
}
