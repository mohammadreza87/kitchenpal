import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PersonalInfoPage from '@/app/(main)/profile/personal-info/page'

// Mock profile data
const mockProfile = {
  id: 'test-user-id',
  email: 'hannah.1989@gmail.com',
  full_name: 'Hannah Andrew',
  avatar_url: '/assets/illustrations/avatar-placeholder.svg',
  phone: '+31612222222',
  location: 'Amsterdam, Netherlands',
  bio: 'I love cooking!',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockSocialLinks = {
  id: 'social-id',
  user_id: 'test-user-id',
  website: 'https://example.com',
  instagram: '@hannah',
  youtube: null,
  tiktok: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockUseProfile = vi.fn()

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => mockUseProfile(),
}))

describe('PersonalInfoPage', () => {
  const defaultMockReturn = {
    profile: mockProfile,
    socialLinks: mockSocialLinks,
    loading: false,
    error: null,
    updateProfile: vi.fn().mockResolvedValue(mockProfile),
    updateSocialLinks: vi.fn().mockResolvedValue(mockSocialLinks),
    uploadAvatar: vi.fn(),
    refetch: vi.fn(),
  }

  beforeEach(() => {
    mockUseProfile.mockReturnValue(defaultMockReturn)
  })

  it('renders page title', () => {
    render(<PersonalInfoPage />)
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
  })

  it('displays user name', () => {
    render(<PersonalInfoPage />)
    expect(screen.getByText('Hannah Andrew')).toBeInTheDocument()
  })

  it('displays user email', () => {
    render(<PersonalInfoPage />)
    expect(screen.getByText('hannah.1989@gmail.com')).toBeInTheDocument()
  })

  it('displays user phone', () => {
    render(<PersonalInfoPage />)
    expect(screen.getByText('+31612222222')).toBeInTheDocument()
  })

  it('displays user location', () => {
    render(<PersonalInfoPage />)
    expect(screen.getByText('Amsterdam, Netherlands')).toBeInTheDocument()
  })

  it('renders profile avatar', () => {
    render(<PersonalInfoPage />)
    const avatar = screen.getByAltText('Profile')
    expect(avatar).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    mockUseProfile.mockReturnValue({
      ...defaultMockReturn,
      profile: null,
      loading: true,
    })

    render(<PersonalInfoPage />)
    expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
