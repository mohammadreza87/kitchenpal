import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedbackPage from '@/app/(main)/feedback/page'
import { routerMock } from './mocks'

describe('FeedbackPage', () => {
  it('renders feedback form with title and description', () => {
    render(<FeedbackPage />)

    expect(screen.getByText('Give Us Feedback')).toBeInTheDocument()
    expect(screen.getByText(/We'd love to hear your thoughts/i)).toBeInTheDocument()
  })

  it('renders rating section with all emoji options', () => {
    render(<FeedbackPage />)

    expect(screen.getByText(/How's your experience with Kitchen Pal/i)).toBeInTheDocument()
    expect(screen.getByText('😞')).toBeInTheDocument()
    expect(screen.getByText('😕')).toBeInTheDocument()
    expect(screen.getByText('😐')).toBeInTheDocument()
    expect(screen.getByText('🙂')).toBeInTheDocument()
    expect(screen.getByText('😍')).toBeInTheDocument()
  })

  it('shows rating label when emoji is selected', async () => {
    render(<FeedbackPage />)

    const loveItEmoji = screen.getByText('😍')
    await userEvent.click(loveItEmoji)

    expect(screen.getByText('Love it!')).toBeInTheDocument()
  })

  it('renders category section with all options', () => {
    render(<FeedbackPage />)

    expect(screen.getByText(/What's your feedback about/i)).toBeInTheDocument()
    expect(screen.getByText('🐛 Bug Report')).toBeInTheDocument()
    expect(screen.getByText('✨ Feature Request')).toBeInTheDocument()
    expect(screen.getByText('💡 Improvement')).toBeInTheDocument()
    expect(screen.getByText('💬 Other')).toBeInTheDocument()
  })

  it('allows selecting a category', async () => {
    render(<FeedbackPage />)

    const bugReportChip = screen.getByText('🐛 Bug Report')
    const chipButton = bugReportChip.closest('button')

    // Initially not selected (bg-white)
    expect(chipButton).toHaveClass('bg-white')

    await userEvent.click(bugReportChip)

    // After click, should be selected (bg-amber-50)
    expect(chipButton).toHaveClass('bg-amber-50')
  })

  it('allows deselecting a category', async () => {
    render(<FeedbackPage />)

    const bugReportChip = screen.getByText('🐛 Bug Report')
    const chipButton = bugReportChip.closest('button')

    // Select
    await userEvent.click(bugReportChip)
    expect(chipButton).toHaveClass('bg-amber-50')

    // Deselect
    await userEvent.click(bugReportChip)
    expect(chipButton).toHaveClass('bg-white')
  })

  it('renders feedback textarea with character counter', () => {
    render(<FeedbackPage />)

    expect(screen.getByText('Tell us more')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your feedback')).toBeInTheDocument()
    expect(screen.getByText('0/500')).toBeInTheDocument()
  })

  it('updates character counter as user types', async () => {
    render(<FeedbackPage />)

    const textarea = screen.getByPlaceholderText('Your feedback')
    await userEvent.type(textarea, 'Great app!')

    expect(screen.getByText('10/500')).toBeInTheDocument()
  })

  it('renders optional email field', () => {
    render(<FeedbackPage />)

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('(Optional)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
  })

  it('submit button is disabled when feedback is empty', () => {
    render(<FeedbackPage />)

    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    expect(submitButton).toBeDisabled()
  })

  it('submit button is enabled when feedback has content', async () => {
    render(<FeedbackPage />)

    const textarea = screen.getByPlaceholderText('Your feedback')
    await userEvent.type(textarea, 'This is my feedback')

    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('shows submitting state during form submission', async () => {
    render(<FeedbackPage />)

    const textarea = screen.getByPlaceholderText('Your feedback')
    await userEvent.type(textarea, 'Great feedback content')

    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    await userEvent.click(submitButton)

    expect(screen.getByText('Submitting...')).toBeInTheDocument()
  })

  it('shows success screen after successful submission', async () => {
    render(<FeedbackPage />)

    const textarea = screen.getByPlaceholderText('Your feedback')
    await userEvent.type(textarea, 'Great feedback content')

    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByText(/Your feedback has been submitted successfully/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back to profile/i })).toBeInTheDocument()
  })

  it('navigates to profile page from success screen', async () => {
    render(<FeedbackPage />)

    const textarea = screen.getByPlaceholderText('Your feedback')
    await userEvent.type(textarea, 'Great feedback content')

    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument()
    }, { timeout: 3000 })

    const backToProfileButton = screen.getByRole('button', { name: /back to profile/i })
    await userEvent.click(backToProfileButton)

    expect(routerMock.push).toHaveBeenCalledWith('/profile')
  })

  it('calls router.back when back button is clicked', async () => {
    render(<FeedbackPage />)

    const backButtons = screen.getAllByAltText('Back')
    await userEvent.click(backButtons[0].closest('button')!)

    expect(routerMock.back).toHaveBeenCalled()
  })

  it('enforces max character limit on feedback textarea', async () => {
    render(<FeedbackPage />)

    const textarea = screen.getByPlaceholderText('Your feedback')
    const longText = 'a'.repeat(600)

    await userEvent.type(textarea, longText)

    // Should be truncated to 500
    expect(screen.getByText('500/500')).toBeInTheDocument()
  })
})
