import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetPasswordPage from '@/app/reset-password/page'
import { routerMock, supabaseAuthMock } from './mocks'

describe('ResetPasswordPage', () => {
  it('shows validation errors when passwords do not match', async () => {
    render(<ResetPasswordPage />)

    const newPasswordInput = screen.getByPlaceholderText(/new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i)

    await userEvent.type(newPasswordInput, 'secret1')
    await userEvent.type(confirmPasswordInput, 'secret2')
    await userEvent.tab()

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
  })

  it('submits and navigates on success', async () => {
    render(<ResetPasswordPage />)

    await userEvent.type(screen.getByPlaceholderText(/new password/i), 'secret1')
    await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'secret1')

    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(supabaseAuthMock.updateUser).toHaveBeenCalledWith({ password: 'secret1' })
    expect(routerMock.push).toHaveBeenCalledWith('/home')
  })
})
