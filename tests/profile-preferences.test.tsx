import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PreferencesSummaryPage from '@/app/(main)/profile/preferences/page'

const mockUsePreferences = vi.fn()
const mockRouterPush = vi.fn()
const mockRouterBack = vi.fn()

vi.mock('@/hooks/usePreferences', () => ({
  usePreferences: () => mockUsePreferences(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
  }),
}))

describe('PreferencesSummaryPage', () => {
  const mockPreferences = {
    id: 'pref-id',
    user_id: 'test-user-id',
    dietary: ['dairy-free', 'mediterranean'],
    cuisine: ['italian', 'chinese', 'japanese'],
    allergies: ['Peanuts', 'Sesame', 'Dairy'],
    cooking_skill: 'Enthusiast',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const defaultMockReturn = {
    preferences: mockPreferences,
    loading: false,
    error: null,
    updatePreferences: vi.fn(),
    refetch: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePreferences.mockReturnValue(defaultMockReturn)
  })

  describe('Page Structure', () => {
    it('renders page title', () => {
      render(<PreferencesSummaryPage />)
      expect(screen.getByRole('heading', { name: 'Preferences' })).toBeInTheDocument()
    })

    it('renders back button', () => {
      render(<PreferencesSummaryPage />)
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('renders edit button', () => {
      render(<PreferencesSummaryPage />)
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('renders all four preference sections', () => {
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('Dietary Preferences')).toBeInTheDocument()
      expect(screen.getByText('Cuisine Preferences')).toBeInTheDocument()
      expect(screen.getByText('Allergy & Dietary Restrictions')).toBeInTheDocument()
      expect(screen.getByText('Cooking Skills')).toBeInTheDocument()
    })
  })

  describe('Dietary Preferences Section', () => {
    it('displays dietary preferences with labels', () => {
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('Dairy-Free')).toBeInTheDocument()
      expect(screen.getByText('Mediterranean')).toBeInTheDocument()
    })

    it('shows empty state when no dietary preferences', () => {
      mockUsePreferences.mockReturnValue({
        ...defaultMockReturn,
        preferences: { ...mockPreferences, dietary: [] },
      })
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('No dietary preferences set')).toBeInTheDocument()
    })
  })

  describe('Cuisine Preferences Section', () => {
    it('displays cuisine preferences with labels', () => {
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('Italian')).toBeInTheDocument()
      expect(screen.getByText('Chinese')).toBeInTheDocument()
      expect(screen.getByText('Japanese')).toBeInTheDocument()
    })

    it('shows empty state when no cuisine preferences', () => {
      mockUsePreferences.mockReturnValue({
        ...defaultMockReturn,
        preferences: { ...mockPreferences, cuisine: [] },
      })
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('No cuisine preferences set')).toBeInTheDocument()
    })
  })

  describe('Allergies Section', () => {
    it('displays allergies', () => {
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('Peanuts')).toBeInTheDocument()
      expect(screen.getByText('Sesame')).toBeInTheDocument()
      expect(screen.getByText('Dairy')).toBeInTheDocument()
    })

    it('shows empty state when no allergies', () => {
      mockUsePreferences.mockReturnValue({
        ...defaultMockReturn,
        preferences: { ...mockPreferences, allergies: [] },
      })
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('No allergies set')).toBeInTheDocument()
    })
  })

  describe('Cooking Skills Section', () => {
    it('displays cooking skill level', () => {
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('Enthusiast')).toBeInTheDocument()
    })

    it('displays default skill when not set', () => {
      mockUsePreferences.mockReturnValue({
        ...defaultMockReturn,
        preferences: { ...mockPreferences, cooking_skill: null },
      })
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('Beginner')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows skeleton when loading', () => {
      mockUsePreferences.mockReturnValue({
        ...defaultMockReturn,
        preferences: null,
        loading: true,
      })
      render(<PreferencesSummaryPage />)
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(screen.queryByText('Preferences')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates back when back button clicked', async () => {
      render(<PreferencesSummaryPage />)
      await userEvent.click(screen.getByRole('button', { name: /back/i }))
      expect(mockRouterBack).toHaveBeenCalled()
    })

    it('navigates to edit page when edit button clicked', async () => {
      render(<PreferencesSummaryPage />)
      await userEvent.click(screen.getByRole('button', { name: /edit/i }))
      expect(mockRouterPush).toHaveBeenCalledWith('/profile/preferences/edit')
    })
  })

  describe('Edge Cases', () => {
    it('handles null preferences gracefully', () => {
      mockUsePreferences.mockReturnValue({
        ...defaultMockReturn,
        preferences: null,
        loading: false,
      })
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('No dietary preferences set')).toBeInTheDocument()
      expect(screen.getByText('No cuisine preferences set')).toBeInTheDocument()
      expect(screen.getByText('No allergies set')).toBeInTheDocument()
    })

    it('handles unknown dietary IDs by showing the ID', () => {
      mockUsePreferences.mockReturnValue({
        ...defaultMockReturn,
        preferences: { ...mockPreferences, dietary: ['unknown-diet'] },
      })
      render(<PreferencesSummaryPage />)
      expect(screen.getByText('unknown-diet')).toBeInTheDocument()
    })
  })
})
