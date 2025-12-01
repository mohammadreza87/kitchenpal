'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { SelectableChip } from '@/components/ui/SelectableChip'
import { cn } from '@/lib/utils'
import { useFeedback } from '@/hooks/useFeedback'
import { useProfile } from '@/hooks/useProfile'

const feedbackCategories = [
  { id: 'bug', label: '🐛 Bug Report', description: 'Something isn\'t working' },
  { id: 'feature', label: '✨ Feature Request', description: 'Suggest a new feature' },
  { id: 'improvement', label: '💡 Improvement', description: 'Make something better' },
  { id: 'other', label: '💬 Other', description: 'General feedback' },
] as const

const ratingEmojis = [
  { value: 1, emoji: '😞', label: 'Very Disappointed' },
  { value: 2, emoji: '😕', label: 'Disappointed' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Satisfied' },
  { value: 5, emoji: '😍', label: 'Love it!' },
]

const feedbackTopics = [
  { id: 'recipes', label: '🍳 Recipes' },
  { id: 'search', label: '🔍 Search' },
  { id: 'ui', label: '🎨 Design/UI' },
  { id: 'performance', label: '⚡ Performance' },
  { id: 'account', label: '👤 Account' },
  { id: 'notifications', label: '🔔 Notifications' },
]

interface FloatingTextareaProps {
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
  rows?: number
  error?: string
}

function FloatingTextarea({ label, value, onChange, maxLength = 500, rows = 5, error }: FloatingTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value.length > 0
  const isFloating = isFocused || hasValue

  return (
    <div className="w-full">
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-4 z-10">
          <Image
            src="/assets/icons/Edit-2.svg"
            alt=""
            width={20}
            height={20}
            className="opacity-40"
          />
        </div>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          className={cn(
            'peer w-full rounded-xl border-2 bg-white pl-12 pr-4 py-4 text-base text-foreground transition-colors resize-none',
            'placeholder:text-transparent focus:outline-none',
            error
              ? 'border-brand-error focus:border-brand-error'
              : isFocused
                ? 'border-brand-primary'
                : 'border-gray-200'
          )}
          placeholder={label}
        />

        <label
          className={cn(
            'absolute px-2 transition-all duration-200 pointer-events-none z-10 left-10',
            isFloating
              ? '-top-3 text-sm font-medium bg-white'
              : 'top-4 text-base',
            error
              ? 'text-brand-error'
              : isFloating
                ? 'text-brand-primary'
                : 'text-gray-400'
          )}
        >
          {label}
        </label>

        <span className="absolute right-3 bottom-2 text-xs text-gray-400">
          {value.length}/{maxLength}
        </span>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-brand-error">{error}</p>
      )}
    </div>
  )
}

function FeedbackSkeleton() {
  return (
    <div className="w-full px-6 py-8 animate-pulse">
      <div className="mb-6 h-10 w-10 rounded-full bg-gray-200" />
      <div className="mb-2 h-8 w-48 rounded bg-gray-200" />
      <div className="mb-8 h-4 w-full rounded bg-gray-200" />
      <div className="mb-8 h-24 rounded-2xl bg-gray-200" />
      <div className="mb-8 flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="mb-6 h-32 rounded-xl bg-gray-200" />
      <div className="h-14 rounded-full bg-gray-200" />
    </div>
  )
}

export default function FeedbackPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { submitFeedback, submitting, isAuthenticated } = useFeedback()
  const { profile, loading: profileLoading } = useProfile()
  
  const [rating, setRating] = useState<number | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  // Pre-fill email from profile
  useEffect(() => {
    if (profile?.email && !email) {
      setEmail(profile.email)
    }
  }, [profile?.email, email])

  useEffect(() => {
    if (!containerRef.current || profileLoading) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      sections,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      }
    )
  }, [profileLoading])

  const handleBack = () => {
    router.back()
  }

  const toggleTopic = (topicId: string) => {
    setTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    )
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    // Validate
    if (feedback.trim().length < 10) {
      setFeedbackError('Please provide more details (at least 10 characters)')
      return
    }

    setFeedbackError(null)

    try {
      // Build message with topics
      const topicLabels = topics.map(t => feedbackTopics.find(ft => ft.id === t)?.label).filter(Boolean)
      const fullMessage = topicLabels.length > 0
        ? `[Topics: ${topicLabels.join(', ')}]\n\n${feedback}`
        : feedback

      await submitFeedback({
        rating,
        category: category as 'bug' | 'feature' | 'improvement' | 'other' | null,
        message: fullMessage,
        email: email || null,
      })

      setIsSubmitted(true)

      // Animate success state
      if (containerRef.current) {
        const successSection = containerRef.current.querySelector('[data-success]')
        if (successSection) {
          gsap.fromTo(
            successSection,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
          )
        }
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      setFeedbackError('Failed to submit feedback. Please try again.')
    }
  }

  const canSubmit = feedback.trim().length >= 10

  if (profileLoading) {
    return <FeedbackSkeleton />
  }

  if (isSubmitted) {
    return (
      <div className="relative min-h-screen bg-background">
        <div ref={containerRef} className="relative z-10 w-full px-6 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center">
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
          </div>

          {/* Success Message */}
          <div data-success className="flex flex-col items-center justify-center pt-20">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-12 w-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-center" style={{ color: '#282828' }}>
              Thank You!
            </h2>
            <p className="mb-2 text-center text-base" style={{ color: '#656565' }}>
              Your feedback has been submitted successfully.
            </p>
            {isAuthenticated && (
              <p className="mb-8 text-center text-sm" style={{ color: '#656565' }}>
                You can view your feedback history in your profile.
              </p>
            )}
            <button
              onClick={() => router.push('/profile')}
              className="w-full rounded-full bg-brand-primary py-4 font-medium text-white transition-all hover:bg-brand-primary/90 active:scale-[0.98]"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Shape */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 flex items-end justify-center">
        <img
          src="/assets/backgrounds/background-shape-3.svg"
          alt=""
          className="h-auto w-full translate-y-1/2 opacity-20 md:w-3/4 lg:w-1/2"
        />
      </div>

      <div ref={containerRef} className="relative z-10 w-full px-6 py-8 pb-32">
        {/* Header */}
        <div data-animate className="mb-6 flex items-center">
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
        </div>

        {/* Title */}
        <div data-animate className="mb-8">
          <h1 className="mb-2 text-2xl font-bold" style={{ color: '#282828' }}>
            Give Us Feedback
          </h1>
          <p className="text-sm" style={{ color: '#656565' }}>
            We&apos;d love to hear your thoughts! Your feedback helps us make Kitchen Pal better for everyone.
          </p>
          {isAuthenticated && profile?.full_name && (
            <p className="mt-2 text-sm" style={{ color: '#FF7043' }}>
              Submitting as {profile.full_name}
            </p>
          )}
        </div>

        {/* Rating Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-4 text-base font-semibold" style={{ color: '#332B10' }}>
            How&apos;s your experience with Kitchen Pal?
          </h2>
          <div className="flex justify-between rounded-2xl bg-gray-50 p-4">
            {ratingEmojis.map((item) => (
              <button
                key={item.value}
                onClick={() => setRating(item.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl p-2 transition-all',
                  rating === item.value
                    ? 'bg-white shadow-md scale-110'
                    : 'hover:bg-white/50'
                )}
              >
                <span className="text-3xl">{item.emoji}</span>
                {rating === item.value && (
                  <span className="text-xs font-medium text-brand-primary">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Category Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-4 text-base font-semibold" style={{ color: '#332B10' }}>
            What&apos;s your feedback about?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {feedbackCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(category === cat.id ? null : cat.id)}
                className={cn(
                  'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                  category === cat.id
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="text-base font-medium" style={{ color: '#282828' }}>
                  {cat.label}
                </span>
                <span className="text-xs" style={{ color: '#656565' }}>
                  {cat.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Topics Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-2 text-base font-semibold" style={{ color: '#332B10' }}>
            Related to <span className="font-normal" style={{ color: '#656565' }}>(Optional)</span>
          </h2>
          <p className="mb-4 text-xs" style={{ color: '#656565' }}>
            Select all that apply
          </p>
          <div className="flex flex-wrap gap-2">
            {feedbackTopics.map((topic) => (
              <SelectableChip
                key={topic.id}
                label={topic.label}
                selected={topics.includes(topic.id)}
                onToggle={() => toggleTopic(topic.id)}
              />
            ))}
          </div>
        </section>

        {/* Feedback Text */}
        <section data-animate className="mb-6">
          <h2 className="mb-4 text-base font-semibold" style={{ color: '#332B10' }}>
            Tell us more <span className="text-brand-error">*</span>
          </h2>
          <FloatingTextarea
            label="Your feedback"
            value={feedback}
            onChange={(value) => {
              setFeedback(value)
              if (feedbackError && value.length >= 10) {
                setFeedbackError(null)
              }
            }}
            maxLength={500}
            rows={5}
            error={feedbackError || undefined}
          />
        </section>

        {/* Email (Optional) */}
        <section data-animate className="mb-8">
          <h2 className="mb-2 text-base font-semibold" style={{ color: '#332B10' }}>
            Email <span className="font-normal" style={{ color: '#656565' }}>(Optional)</span>
          </h2>
          <p className="mb-3 text-xs" style={{ color: '#656565' }}>
            Leave your email if you&apos;d like us to follow up with you.
          </p>
          <FloatingInput
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon="/assets/icons/Mail.svg"
          />
        </section>

        {/* Submit Button */}
        <div data-animate className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-gradient-to-t from-background via-background to-transparent p-6 pt-8">
          <div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={cn(
                'w-full rounded-full py-4 font-medium transition-all',
                canSubmit && !submitting
                  ? 'bg-brand-primary text-white hover:bg-brand-primary/90 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
