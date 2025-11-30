import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AboutPage from '@/app/(main)/about/page'
import { routerMock } from './mocks'

describe('AboutPage', () => {
  it('renders core brand information and mission', () => {
    render(<AboutPage />)

    expect(screen.getByRole('heading', { name: 'Kitchen Pal' })).toBeInTheDocument()
    expect(screen.getByText('Your AI-powered cooking companion')).toBeInTheDocument()
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument()
    expect(screen.getByText('Our Mission')).toBeInTheDocument()
    expect(screen.getByText(/joyful, not stressful/i)).toBeInTheDocument()
  })

  it('lists feature highlights and social links', () => {
    render(<AboutPage />)

    expect(screen.getByText('Smart Recipe Discovery')).toBeInTheDocument()
    expect(screen.getByText('Personalized Preferences')).toBeInTheDocument()
    expect(screen.getByText('AI Cooking Assistant')).toBeInTheDocument()
    expect(screen.getByText('Save Favorites')).toBeInTheDocument()

    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('YouTube')).toBeInTheDocument()
    expect(screen.getByLabelText('TikTok')).toBeInTheDocument()
  })

  it('includes legal links with correct destinations', () => {
    render(<AboutPage />)

    expect(screen.getByText('Terms of Service').closest('a')).toHaveAttribute('href', '/terms')
    expect(screen.getByText('Privacy Policy').closest('a')).toHaveAttribute('href', '/privacy')
    expect(screen.getByText('Open Source Licenses').closest('a')).toHaveAttribute('href', '/licenses')
  })

  it('navigates back when tapping the back button', async () => {
    render(<AboutPage />)

    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(routerMock.back).toHaveBeenCalled()
  })
})
