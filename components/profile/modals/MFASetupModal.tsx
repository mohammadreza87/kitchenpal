'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import type { MFAEnrollmentData } from '@/lib/services/security.service'

interface MFASetupModalProps {
  isOpen: boolean
  enrollment: MFAEnrollmentData | null
  onVerify: (code: string) => Promise<boolean>
  onCancel: () => void
}

export function MFASetupModal({ isOpen, enrollment, onVerify, onCancel }: MFASetupModalProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }
      )
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus()
    }
  }, [isOpen])

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = code.split('')
    newCode[index] = value
    const updatedCode = newCode.join('').slice(0, 6)
    setCode(updatedCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }


  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    setCode(pastedData)
    
    // Focus the appropriate input
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onVerify(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.')
      setCode('')
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !enrollment) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: '#282828' }}>
            Set Up Two-Factor Authentication
          </h2>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <Image src="/assets/icons/Close.svg" alt="Close" width={20} height={20} />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 space-y-4">
          <p className="text-sm" style={{ color: '#656565' }}>
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>

          {/* QR Code */}
          <div className="flex justify-center rounded-2xl bg-gray-50 p-6">
            <img
              src={enrollment.totp.qr_code}
              alt="QR Code for authenticator app"
              className="h-48 w-48"
            />
          </div>

          {/* Manual entry option */}
          <div className="rounded-xl bg-amber-50 p-4">
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="flex w-full items-center justify-between text-sm font-medium"
              style={{ color: '#332B10' }}
            >
              <span>Can&apos;t scan? Enter code manually</span>
              <Image
                src="/assets/icons/Chevron-Down.svg"
                alt=""
                width={16}
                height={16}
                className={`transition-transform ${showSecret ? 'rotate-180' : ''}`}
              />
            </button>
            {showSecret && (
              <div className="mt-3">
                <code className="block break-all rounded-lg bg-white p-3 text-xs font-mono" style={{ color: '#434343' }}>
                  {enrollment.totp.secret}
                </code>
              </div>
            )}
          </div>
        </div>


        {/* Verification Form */}
        <form onSubmit={handleSubmit}>
          <label className="mb-3 block text-sm font-medium" style={{ color: '#434343' }}>
            Enter the 6-digit code from your app
          </label>
          
          <div className="mb-4 flex justify-center gap-2" onPaste={handlePaste}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={code[index] || ''}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-12 rounded-xl border-2 text-center text-xl font-semibold transition-colors focus:border-amber-500 focus:outline-none"
                style={{ 
                  borderColor: error ? '#E53935' : '#e5e7eb',
                  color: '#282828',
                }}
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-full border border-gray-200 py-3 text-base font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#434343' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={code.length !== 6 || loading}
              className="flex-1 rounded-full py-3 text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: '#FF7043' }}
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
