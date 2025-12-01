import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CuisinePreferencesPage from '@/app/(onboarding)/cuisine/page'

let selectedCuisines: string[] = []
const mockUseOnboardingPreferences = vi.fn()

vi.mock('@/hooks/useOnboardingPreferences', () => ({
  useOnboardingPreferences: () => mockUseOnboardingPreferences(),
}))

describe('CuisinePreferencesPage', () => {
  const createMockReturn = (cuisine: string[] = []) => ({
    dietary: [],
    cuisine,
    allergies: [],
    cookingSkill: 'Beginner',
    setDietary: vi.fn(),
    setCuisine: vi.fn(),
    setAllergies: vi.fn(),
    setCookingSkill: vi.fn(),
    toggleDietary: vi.fn(),
    toggleCuisine: vi.fn((id: string) => {
      if (selectedCuisines.includes(id)) {
        selectedCuisines = selectedCuisines.filter(c => c !== id)
      } else {
        selectedCuisines = [...selectedCuisines, id]
      }
    }),
    toggleAllergy: vi.fn(),
    saveToDatabase: vi.fn(),
    loadFromDatabase: vi.fn(),
    clearPreferences: vi.fn(),
  })

  beforeEach(() => {
    selectedCuisines = []
    mockUseOnboardingPreferences.mockImplementation(() => createMockReturn(selectedCuisines))
  })

  describe('Page Structure', () => {
    it('renders page title', () => {
      render(<CuisinePreferencesPage />)
      expect(screen.getByRole('heading', { name: 'Cuisine Preferences' })).toBeInTheDocument()
    })

    it('renders description', () => {
      render(<CuisinePreferencesPage />)
      expect(screen.getByText(/share your favorite cuisines/i)).toBeInTheDocument()
    })
  })

  describe('Cuisine Options Display', () => {
    const expectedCuisines = [
      'Chinese',
      'Thai',
      'Japanese',
      'Italian',
      'French',
      'Mexican',
      'Mediterranean',
      'Indian',
      'Middle Eastern',
      'Spanish Tapas',
    ]

    it.each(expectedCuisines)('renders %s cuisine option', (cuisine) => {
      render(<CuisinePreferencesPage />)
      expect(screen.getByText(cuisine)).toBeInTheDocument()
    })

    it('renders exactly 10 cuisine options', () => {
      render(<CuisinePreferencesPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(10)
    })

    it('renders cuisine icons', () => {
      render(<CuisinePreferencesPage />)
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(10)
    })
  })

  describe('Selection Behavior', () => {
    it('selects a cuisine on click', async () => {
      const { rerender } = render(<CuisinePreferencesPage />)
      const italianButton = screen.getByRole('button', { name: /italian/i })
      expect(italianButton).not.toHaveClass('bg-amber-50')

      await userEvent.click(italianButton)
      rerender(<CuisinePreferencesPage />)

      expect(screen.getByRole('button', { name: /italian/i })).toHaveClass('bg-amber-50')
    })

    it('deselects a cuisine on second click', async () => {
      const { rerender } = render(<CuisinePreferencesPage />)

      await userEvent.click(screen.getByRole('button', { name: /japanese/i }))
      rerender(<CuisinePreferencesPage />)
      expect(screen.getByRole('button', { name: /japanese/i })).toHaveClass('bg-amber-50')

      await userEvent.click(screen.getByRole('button', { name: /japanese/i }))
      rerender(<CuisinePreferencesPage />)
      expect(screen.getByRole('button', { name: /japanese/i })).not.toHaveClass('bg-amber-50')
    })

    it('allows selecting multiple cuisines', async () => {
      const { rerender } = render(<CuisinePreferencesPage />)

      await userEvent.click(screen.getByRole('button', { name: /italian/i }))
      rerender(<CuisinePreferencesPage />)
      await userEvent.click(screen.getByRole('button', { name: /thai/i }))
      rerender(<CuisinePreferencesPage />)
      await userEvent.click(screen.getByRole('button', { name: /mexican/i }))
      rerender(<CuisinePreferencesPage />)

      expect(screen.getByRole('button', { name: /italian/i })).toHaveClass('bg-amber-50')
      expect(screen.getByRole('button', { name: /thai/i })).toHaveClass('bg-amber-50')
      expect(screen.getByRole('button', { name: /mexican/i })).toHaveClass('bg-amber-50')
    })

    it('calls toggleCuisine with correct ID', async () => {
      const toggleCuisine = vi.fn()
      mockUseOnboardingPreferences.mockReturnValue({
        ...createMockReturn(),
        toggleCuisine,
      })

      render(<CuisinePreferencesPage />)
      await userEvent.click(screen.getByRole('button', { name: /italian/i }))

      expect(toggleCuisine).toHaveBeenCalledWith('italian')
    })
  })

  describe('Pre-selected State', () => {
    it('shows pre-selected cuisines', () => {
      selectedCuisines = ['italian', 'chinese']
      mockUseOnboardingPreferences.mockImplementation(() => createMockReturn(selectedCuisines))

      render(<CuisinePreferencesPage />)

      expect(screen.getByRole('button', { name: /italian/i })).toHaveClass('bg-amber-50')
      expect(screen.getByRole('button', { name: /chinese/i })).toHaveClass('bg-amber-50')
      expect(screen.getByRole('button', { name: /thai/i })).not.toHaveClass('bg-amber-50')
    })

    it('allows selecting all cuisines', () => {
      const allCuisines = ['chinese', 'thai', 'japanese', 'italian', 'french', 'mexican', 'mediterranean', 'indian', 'middle-eastern', 'spanish']
      selectedCuisines = allCuisines
      mockUseOnboardingPreferences.mockImplementation(() => createMockReturn(selectedCuisines))

      render(<CuisinePreferencesPage />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('bg-amber-50')
      })
    })
  })

  describe('Accessibility', () => {
    it('all cuisine buttons are keyboard accessible', () => {
      render(<CuisinePreferencesPage />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
    })

    it('cuisine buttons have accessible names', () => {
      render(<CuisinePreferencesPage />)
      expect(screen.getByRole('button', { name: /italian/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /chinese/i })).toBeInTheDocument()
    })
  })
})
