import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '@/app/signup/page'
import { routerMock, supabaseAuthMock } from './mocks'

describe('SignupPage', () => {
  it('shows inline validation errors', async () => {
    render(<SignupPage />)

    const nameInput = screen.getByPlaceholderText(/name/i)
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)

    await userEvent.click(nameInput)
    await userEvent.tab()
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.tab()
    await userEvent.type(passwordInput, '123')
    await userEvent.tab()

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Please enter a valid email address!')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
  })

  it('prevents submission when terms are not accepted', async () => {
    render(<SignupPage />)

    await userEvent.type(screen.getByPlaceholderText(/name/i), 'Kitchen Pal')
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'secret1')

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    expect(submitButton).toBeDisabled()
    expect(supabaseAuthMock.signUp).not.toHaveBeenCalled()
  })

  it('submits and navigates on successful signup', async () => {
    render(<SignupPage />)

    await userEvent.type(screen.getByPlaceholderText(/name/i), 'Kitchen Pal')
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'secret1')
    await userEvent.click(screen.getByRole('checkbox', { name: /terms/i }))

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(supabaseAuthMock.signUp).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret1',
      options: expect.objectContaining({
        emailRedirectTo: expect.stringContaining('/auth/callback'),
        data: { full_name: 'Kitchen Pal' },
      }),
    })
    expect(routerMock.push).toHaveBeenCalledWith('/preferences')
  })
})
