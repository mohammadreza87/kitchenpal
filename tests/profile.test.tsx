import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePage from '@/app/(main)/profile/page'
import { routerMock, supabaseAuthMock } from './mocks'

describe('ProfilePage', () => {
  it('renders profile page with user info', () => {
    render(<ProfilePage />)

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Hannah Andrew')).toBeInTheDocument()
    expect(screen.getByText('I love to cook amazing food!')).toBeInTheDocument()
  })

  it('displays the find recipes banner', () => {
    render(<ProfilePage />)

    expect(screen.getByText(/Find recipes based on what you already have at home/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /find recipes/i })).toBeInTheDocument()
  })

  it('renders preference section with menu item', () => {
    render(<ProfilePage />)

    expect(screen.getByText('Preference')).toBeInTheDocument()
    expect(screen.getByText('My Food Preferences')).toBeInTheDocument()
  })

  it('renders setting section with all menu items', () => {
    render(<ProfilePage />)

    expect(screen.getByText('Setting')).toBeInTheDocument()
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Notification')).toBeInTheDocument()
    expect(screen.getByText('Security And Privacy')).toBeInTheDocument()
  })

  it('renders support section with all menu items', () => {
    render(<ProfilePage />)

    expect(screen.getByText('Support')).toBeInTheDocument()
    expect(screen.getByText('Get help')).toBeInTheDocument()
    expect(screen.getByText('About Kitchen Pal')).toBeInTheDocument()
    expect(screen.getByText('Give Us Feedback')).toBeInTheDocument()
  })

  it('has correct navigation links', () => {
    render(<ProfilePage />)

    const preferencesLink = screen.getByText('My Food Preferences').closest('a')
    expect(preferencesLink).toHaveAttribute('href', '/profile/preferences')

    const personalInfoLink = screen.getByText('Personal Information').closest('a')
    expect(personalInfoLink).toHaveAttribute('href', '/profile/personal-info')

    const notificationLink = screen.getByText('Notification').closest('a')
    expect(notificationLink).toHaveAttribute('href', '/profile/notifications')

    const securityLink = screen.getByText('Security And Privacy').closest('a')
    expect(securityLink).toHaveAttribute('href', '/profile/security')

    const aboutLink = screen.getByText('About Kitchen Pal').closest('a')
    expect(aboutLink).toHaveAttribute('href', '/about')

    const feedbackLink = screen.getByText('Give Us Feedback').closest('a')
    expect(feedbackLink).toHaveAttribute('href', '/feedback')
  })

  it('calls signOut and navigates to login on sign out button click', async () => {
    render(<ProfilePage />)

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await userEvent.click(signOutButton)

    await waitFor(() => {
      expect(supabaseAuthMock.signOut).toHaveBeenCalled()
    })
    expect(routerMock.push).toHaveBeenCalledWith('/login')
  })

  it('renders profile avatar', () => {
    render(<ProfilePage />)

    const avatar = screen.getByAltText('Profile')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', '/assets/illustrations/avatar-placeholder.svg')
  })
})
