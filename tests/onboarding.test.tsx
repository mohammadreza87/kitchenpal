import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OnboardingPage from '@/app/onboarding/page'
import { routerMock } from './mocks'

describe('OnboardingPage', () => {
  it('shows the first slide by default', () => {
    render(<OnboardingPage />)
    expect(screen.getByText('Welcome to Kitchen Pal')).toBeInTheDocument()
  })

  it('advances to the next slide', async () => {
    render(<OnboardingPage />)

    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(await screen.findByText('Ingredient Alchemy')).toBeInTheDocument()
  })

  it('skips to signup', async () => {
    render(<OnboardingPage />)

    await userEvent.click(screen.getByText(/skip/i))

    expect(routerMock.push).toHaveBeenCalledWith('/signup')
  })

  it('navigates to signup after final slide', async () => {
    render(<OnboardingPage />)

    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /let's go/i }))

    expect(routerMock.push).toHaveBeenCalledWith('/signup')
  })

  it('shows sign in link', () => {
    render(<OnboardingPage />)

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('navigates to login when sign in is clicked', async () => {
    render(<OnboardingPage />)

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(routerMock.push).toHaveBeenCalledWith('/login')
  })
})
