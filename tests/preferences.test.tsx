import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import DietaryPreferencesPage from '@/app/(onboarding)/preferences/page'

// Mock useOnboardingPreferences hook
const mockUseOnboardingPreferences = vi.fn()

vi.mock('@/hooks/useOnboardingPreferences', () => ({
  useOnboardingPreferences: () => mockUseOnboardingPreferences(),
}))

describe('DietaryPreferencesPage', () => {
  const defaultMockReturn = {
    dietary: [],
    cuisine: [],
    allergies: [],
    cookingSkill: 'Beginner',
    setDietary: vi.fn(),
    setCuisine: vi.fn(),
    setAllergies: vi.fn(),
    setCookingSkill: vi.fn(),
    toggleDietary: vi.fn(),
    toggleCuisine: vi.fn(),
    toggleAllergy: vi.fn(),
    saveToDatabase: vi.fn(),
    loadFromDatabase: vi.fn(),
    clearPreferences: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseOnboardingPreferences.mockReturnValue(defaultMockReturn)
  })

  describe('Page Structure', () => {
    it('renders the page title', () => {
      render(<DietaryPreferencesPage />)
      expect(screen.getByRole('heading', { name: 'Dietary Preferences' })).toBeInTheDocument()
    })

    it('renders the description text', () => {
      render(<DietaryPreferencesPage />)
      expect(screen.getByText(/help us customize your recipes/i)).toBeInTheDocument()
    })

    it('renders exactly 8 dietary options', () => {
      render(<DietaryPreferencesPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(8)
    })
  })

  describe('Dietary Options Display', () => {
    const expectedOptions = [
      'Dairy-Free',
      'Keto',
      'Low-Fat',
      'Low-Carb',
      'Vegan',
      'Vegetarian',
      'Mediterranean',
      'Gluten-Free',
    ]

    it.each(expectedOptions)('renders %s option', (option) => {
      render(<DietaryPreferencesPage />)
      expect(screen.getByText(option)).toBeInTheDocument()
    })

    it('renders options with icons', () => {
      render(<DietaryPreferencesPage />)
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('Selection Behavior', () => {
    it('calls toggleDietary with correct ID when option is clicked', async () => {
      const toggleDietary = vi.fn()
      mockUseOnboardingPreferences.mockReturnValue({
        ...defaultMockReturn,
        toggleDietary,
      })

      render(<DietaryPreferencesPage />)
      await userEvent.click(screen.getByRole('button', { name: /keto/i }))

      expect(toggleDietary).toHaveBeenCalledTimes(1)
      expect(toggleDietary).toHaveBeenCalledWith('keto')
    })

    it('shows selected state with bg-amber-50 class', () => {
      mockUseOnboardingPreferences.mockReturnValue({
        ...defaultMockReturn,
        dietary: ['keto', 'vegan'],
      })

      render(<DietaryPreferencesPage />)

      expect(screen.getByRole('button', { name: /keto/i })).toHaveClass('bg-amber-50')
      expect(screen.getByRole('button', { name: /vegan/i })).toHaveClass('bg-amber-50')
    })

    it('shows unselected state without bg-amber-50 class', () => {
      mockUseOnboardingPreferences.mockReturnValue({
        ...defaultMockReturn,
        dietary: ['keto'],
      })

      render(<DietaryPreferencesPage />)

      expect(screen.getByRole('button', { name: /low-carb/i })).not.toHaveClass('bg-amber-50')
      expect(screen.getByRole('button', { name: /vegan/i })).not.toHaveClass('bg-amber-50')
    })

    it('allows selecting all options', () => {
      const allOptions = ['dairy-free', 'keto', 'low-fat', 'low-carb', 'vegan', 'vegetarian', 'mediterranean', 'gluten-free']
      mockUseOnboardingPreferences.mockReturnValue({
        ...defaultMockReturn,
        dietary: allOptions,
      })

      render(<DietaryPreferencesPage />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('bg-amber-50')
      })
    })
  })

  describe('Accessibility', () => {
    it('all options are keyboard accessible', () => {
      render(<DietaryPreferencesPage />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
    })

    it('options have accessible names', () => {
      render(<DietaryPreferencesPage />)
      expect(screen.getByRole('button', { name: /dairy-free/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /keto/i })).toBeInTheDocument()
    })
  })
})
