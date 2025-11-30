import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordPage from '@/app/forgot-password/page'
import { supabaseAuthMock } from './mocks'

describe('ForgotPasswordPage', () => {
  it('shows inline email validation errors', async () => {
    render(<ForgotPasswordPage />)
    const emailInput = screen.getByPlaceholderText(/email/i)

    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.tab()

    expect(await screen.findByText('Please enter a valid email address!')).toBeInTheDocument()
  })

  it('submits and shows success state', async () => {
    render(<ForgotPasswordPage />)
    const emailInput = screen.getByPlaceholderText(/email/i)

    await userEvent.type(emailInput, 'user@example.com')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    expect(supabaseAuthMock.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: expect.stringContaining('/reset-password'),
    })
    expect(await screen.findByText('Check your Email')).toBeInTheDocument()
  })
})
