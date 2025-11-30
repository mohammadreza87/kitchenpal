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

  it('skips to home', async () => {
    render(<OnboardingPage />)

    await userEvent.click(screen.getByText(/skip/i))

    expect(routerMock.push).toHaveBeenCalledWith('/home')
  })

  it('navigates to home after final slide', async () => {
    render(<OnboardingPage />)

    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /let's go/i }))

    expect(routerMock.push).toHaveBeenCalledWith('/home')
  })
})
