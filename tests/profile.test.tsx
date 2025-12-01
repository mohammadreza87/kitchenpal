import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ProfilePage from '@/app/(main)/profile/page'
import { routerMock, supabaseAuthMock } from './mocks'

// Mock useProfile hook
const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Hannah Andrew',
  avatar_url: '/assets/illustrations/avatar-placeholder.svg',
  bio: 'I love to cook amazing food!',
  phone: null,
  location: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockUseProfile = vi.fn()

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => mockUseProfile(),
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    // Default mock implementation - loaded state with profile
    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      socialLinks: null,
      loading: false,
      error: null,
      updateProfile: vi.fn(),
      updateSocialLinks: vi.fn(),
      uploadAvatar: vi.fn(),
      refetch: vi.fn(),
    })
  })

  describe('Loading State', () => {
    it('renders skeleton loader when loading', () => {
      mockUseProfile.mockReturnValue({
        profile: null,
        socialLinks: null,
        loading: true,
        error: null,
        updateProfile: vi.fn(),
        updateSocialLinks: vi.fn(),
        uploadAvatar: vi.fn(),
        refetch: vi.fn(),
      })

      render(<ProfilePage />)
      
      // ProfileSkeleton should be rendered
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    })
  })

  describe('Profile Header', () => {
    it('renders profile page title', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('displays user name from profile', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Hannah Andrew')).toBeInTheDocument()
    })

    it('displays user bio from profile', () => {
      render(<ProfilePage />)
      expect(screen.getByText('I love to cook amazing food!')).toBeInTheDocument()
    })

    it('displays default name when profile has no name', () => {
      mockUseProfile.mockReturnValue({
        profile: { ...mockProfile, full_name: null },
        socialLinks: null,
        loading: false,
        error: null,
        updateProfile: vi.fn(),
        updateSocialLinks: vi.fn(),
        uploadAvatar: vi.fn(),
        refetch: vi.fn(),
      })

      render(<ProfilePage />)
      expect(screen.getByText('Kitchen Pal User')).toBeInTheDocument()
    })

    it('displays default bio when profile has no bio', () => {
      mockUseProfile.mockReturnValue({
        profile: { ...mockProfile, bio: null },
        socialLinks: null,
        loading: false,
        error: null,
        updateProfile: vi.fn(),
        updateSocialLinks: vi.fn(),
        uploadAvatar: vi.fn(),
        refetch: vi.fn(),
      })

      render(<ProfilePage />)
      expect(screen.getByText('I love to cook amazing food!')).toBeInTheDocument()
    })

    it('renders profile avatar', () => {
      render(<ProfilePage />)
      const avatar = screen.getByAltText('Profile')
      expect(avatar).toBeInTheDocument()
    })

    it('uses custom avatar URL when provided', () => {
      mockUseProfile.mockReturnValue({
        profile: { ...mockProfile, avatar_url: 'https://example.com/avatar.jpg' },
        socialLinks: null,
        loading: false,
        error: null,
        updateProfile: vi.fn(),
        updateSocialLinks: vi.fn(),
        uploadAvatar: vi.fn(),
        refetch: vi.fn(),
      })

      render(<ProfilePage />)
      const avatar = screen.getByAltText('Profile')
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })
  })


  describe('Find Recipes Banner', () => {
    it('displays the find recipes banner', () => {
      render(<ProfilePage />)
      expect(screen.getByText(/Find recipes based on what you already have at home/i)).toBeInTheDocument()
    })

    it('has a find recipes button', () => {
      render(<ProfilePage />)
      expect(screen.getByRole('button', { name: /find recipes/i })).toBeInTheDocument()
    })
  })

  describe('Preference Section', () => {
    it('renders preference section heading', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Preference')).toBeInTheDocument()
    })

    it('renders food preferences menu item', () => {
      render(<ProfilePage />)
      expect(screen.getByText('My Food Preferences')).toBeInTheDocument()
    })

    it('has correct link for food preferences', () => {
      render(<ProfilePage />)
      const preferencesLink = screen.getByText('My Food Preferences').closest('a')
      expect(preferencesLink).toHaveAttribute('href', '/profile/preferences')
    })
  })

  describe('Setting Section', () => {
    it('renders setting section heading', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Setting')).toBeInTheDocument()
    })

    it('renders all setting menu items', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Notification')).toBeInTheDocument()
      expect(screen.getByText('Security And Privacy')).toBeInTheDocument()
    })

    it('has correct navigation links for settings', () => {
      render(<ProfilePage />)

      const personalInfoLink = screen.getByText('Personal Information').closest('a')
      expect(personalInfoLink).toHaveAttribute('href', '/profile/personal-info')

      const notificationLink = screen.getByText('Notification').closest('a')
      expect(notificationLink).toHaveAttribute('href', '/profile/notifications')

      const securityLink = screen.getByText('Security And Privacy').closest('a')
      expect(securityLink).toHaveAttribute('href', '/profile/security')
    })
  })

  describe('Support Section', () => {
    it('renders support section heading', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Support')).toBeInTheDocument()
    })

    it('renders all support menu items', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Get help')).toBeInTheDocument()
      expect(screen.getByText('About Kitchen Pal')).toBeInTheDocument()
      expect(screen.getByText('Give Us Feedback')).toBeInTheDocument()
    })

    it('has correct navigation links for support', () => {
      render(<ProfilePage />)

      const helpLink = screen.getByText('Get help').closest('a')
      expect(helpLink).toHaveAttribute('href', 'mailto:reza@joyixir.com')

      const aboutLink = screen.getByText('About Kitchen Pal').closest('a')
      expect(aboutLink).toHaveAttribute('href', '/about')

      const feedbackLink = screen.getByText('Give Us Feedback').closest('a')
      expect(feedbackLink).toHaveAttribute('href', '/feedback')
    })
  })

  describe('Sign Out', () => {
    it('renders sign out button', () => {
      render(<ProfilePage />)
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
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
  })

  describe('No Profile State', () => {
    it('displays default values when profile is null', () => {
      mockUseProfile.mockReturnValue({
        profile: null,
        socialLinks: null,
        loading: false,
        error: null,
        updateProfile: vi.fn(),
        updateSocialLinks: vi.fn(),
        uploadAvatar: vi.fn(),
        refetch: vi.fn(),
      })

      render(<ProfilePage />)
      
      expect(screen.getByText('Kitchen Pal User')).toBeInTheDocument()
      expect(screen.getByText('I love to cook amazing food!')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible button for sign out', () => {
      render(<ProfilePage />)
      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      expect(signOutButton).toBeEnabled()
    })

    it('has accessible button for find recipes', () => {
      render(<ProfilePage />)
      const findRecipesButton = screen.getByRole('button', { name: /find recipes/i })
      expect(findRecipesButton).toBeEnabled()
    })

    it('all menu items are accessible links', () => {
      render(<ProfilePage />)
      
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })
})
