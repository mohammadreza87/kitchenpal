import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import FeedbackPage from '@/app/(main)/feedback/page'

const mockUseFeedback = vi.fn()
const mockUseProfile = vi.fn()
const mockRouterPush = vi.fn()
const mockRouterBack = vi.fn()

vi.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => mockUseFeedback(),
}))

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => mockUseProfile(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
  }),
}))

describe('FeedbackPage', () => {
  const defaultFeedbackMock = {
    loading: false,
    submitting: false,
    submitted: false,
    error: null,
    submitFeedback: vi.fn().mockResolvedValue(true),
    isAuthenticated: false,
    userEmail: null,
  }

  const defaultProfileMock = {
    profile: { email: 'test@example.com', full_name: 'Test User' },
    loading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFeedback.mockReturnValue(defaultFeedbackMock)
    mockUseProfile.mockReturnValue(defaultProfileMock)
  })

  describe('Page Structure', () => {
    it('renders feedback page title', () => {
      render(<FeedbackPage />)
      expect(screen.getByText('Give Us Feedback')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<FeedbackPage />)
      expect(screen.getByText(/we'd love to hear your thoughts/i)).toBeInTheDocument()
    })

    it('renders back button', () => {
      render(<FeedbackPage />)
      expect(screen.getByRole('img', { name: /back/i })).toBeInTheDocument()
    })

    it('renders rating section', () => {
      render(<FeedbackPage />)
      expect(screen.getByText(/how's your experience/i)).toBeInTheDocument()
    })

    it('renders all rating emojis', () => {
      render(<FeedbackPage />)
      expect(screen.getByText('😞')).toBeInTheDocument()
      expect(screen.getByText('😕')).toBeInTheDocument()
      expect(screen.getByText('😐')).toBeInTheDocument()
      expect(screen.getByText('🙂')).toBeInTheDocument()
      expect(screen.getByText('😍')).toBeInTheDocument()
    })

    it('renders feedback categories', () => {
      render(<FeedbackPage />)
      expect(screen.getByText('🐛 Bug Report')).toBeInTheDocument()
      expect(screen.getByText('✨ Feature Request')).toBeInTheDocument()
      expect(screen.getByText('💡 Improvement')).toBeInTheDocument()
      expect(screen.getByText('💬 Other')).toBeInTheDocument()
    })

    it('renders feedback topics', () => {
      render(<FeedbackPage />)
      expect(screen.getByText('🍳 Recipes')).toBeInTheDocument()
      expect(screen.getByText('🔍 Search')).toBeInTheDocument()
      expect(screen.getByText('🎨 Design/UI')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows loading skeleton when profile is loading', () => {
      mockUseProfile.mockReturnValue({ profile: null, loading: true })
      render(<FeedbackPage />)
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(screen.queryByText('Give Us Feedback')).not.toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('allows selecting a rating', async () => {
      render(<FeedbackPage />)
      const loveItButton = screen.getByText('😍').closest('button')!
      await userEvent.click(loveItButton)
      expect(screen.getByText('Love it!')).toBeInTheDocument()
    })

    it('allows selecting a category', async () => {
      render(<FeedbackPage />)
      const bugButton = screen.getByText('🐛 Bug Report').closest('button')!
      await userEvent.click(bugButton)
      expect(bugButton).toHaveClass('border-brand-primary')
    })

    it('allows deselecting a category', async () => {
      render(<FeedbackPage />)
      const bugButton = screen.getByText('🐛 Bug Report').closest('button')!
      await userEvent.click(bugButton)
      await userEvent.click(bugButton)
      expect(bugButton).not.toHaveClass('border-brand-primary')
    })

    it('allows typing feedback', async () => {
      render(<FeedbackPage />)
      const textarea = screen.getByPlaceholderText('Your feedback')
      await userEvent.type(textarea, 'This is my feedback')
      expect(textarea).toHaveValue('This is my feedback')
    })

    it('shows character count', async () => {
      render(<FeedbackPage />)
      const textarea = screen.getByPlaceholderText('Your feedback')
      await userEvent.type(textarea, 'Test')
      expect(screen.getByText('4/500')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('submit button is disabled when feedback is too short', () => {
      render(<FeedbackPage />)
      const submitButton = screen.getByRole('button', { name: /submit feedback/i })
      expect(submitButton).toBeDisabled()
    })

    it('submit button is enabled when feedback is long enough', async () => {
      render(<FeedbackPage />)
      const textarea = screen.getByPlaceholderText('Your feedback')
      await userEvent.type(textarea, 'This is a long enough feedback message')
      const submitButton = screen.getByRole('button', { name: /submit feedback/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('calls submitFeedback on valid submission', async () => {
      const submitFeedback = vi.fn().mockResolvedValue(true)
      mockUseFeedback.mockReturnValue({ ...defaultFeedbackMock, submitFeedback })

      render(<FeedbackPage />)
      const textarea = screen.getByPlaceholderText('Your feedback')
      await userEvent.type(textarea, 'This is my detailed feedback message')
      await userEvent.click(screen.getByRole('button', { name: /submit feedback/i }))

      expect(submitFeedback).toHaveBeenCalled()
    })

    it('shows submitting state', async () => {
      mockUseFeedback.mockReturnValue({ ...defaultFeedbackMock, submitting: true })
      render(<FeedbackPage />)
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('calls router.back when back button is clicked', async () => {
      render(<FeedbackPage />)
      const backImg = screen.getByRole('img', { name: /back/i })
      await userEvent.click(backImg.closest('button')!)
      expect(mockRouterBack).toHaveBeenCalled()
    })
  })

  describe('Authenticated User', () => {
    it('shows user name when authenticated', () => {
      mockUseFeedback.mockReturnValue({ ...defaultFeedbackMock, isAuthenticated: true })
      mockUseProfile.mockReturnValue({
        profile: { email: 'test@example.com', full_name: 'John Doe' },
        loading: false,
      })
      render(<FeedbackPage />)
      expect(screen.getByText(/submitting as john doe/i)).toBeInTheDocument()
    })

    it('pre-fills email from profile', () => {
      mockUseProfile.mockReturnValue({
        profile: { email: 'prefilled@example.com' },
        loading: false,
      })
      render(<FeedbackPage />)
      const emailInput = screen.getByPlaceholderText('Email address')
      expect(emailInput).toHaveValue('prefilled@example.com')
    })
  })
})
