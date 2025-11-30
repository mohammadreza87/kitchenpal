import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import { routerMock, supabaseAuthMock } from './mocks'

describe('LoginPage', () => {
  it('shows inline validation errors', async () => {
    render(<LoginPage />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)

    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.tab()
    await userEvent.type(passwordInput, '123')
    await userEvent.tab()

    expect(await screen.findByText('Please enter a valid email address!')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
  })

  it('submits and navigates on successful login', async () => {
    render(<LoginPage />)
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'secret1')

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(supabaseAuthMock.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret1',
    })
    expect(routerMock.push).toHaveBeenCalledWith('/home')
  })
})
