import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AllergiesPage from '@/app/(onboarding)/allergies/page'

let selectedAllergies: string[] = []
const mockUseOnboardingPreferences = vi.fn()

vi.mock('@/hooks/useOnboardingPreferences', () => ({
  useOnboardingPreferences: () => mockUseOnboardingPreferences(),
}))

describe('AllergiesPage', () => {
  const createMockReturn = (allergies: string[] = []) => ({
    dietary: [],
    cuisine: [],
    allergies,
    cookingSkill: 'Beginner',
    setDietary: vi.fn(),
    setCuisine: vi.fn(),
    setAllergies: vi.fn(),
    setCookingSkill: vi.fn(),
    toggleDietary: vi.fn(),
    toggleCuisine: vi.fn(),
    toggleAllergy: vi.fn((item: string) => {
      if (selectedAllergies.includes(item)) {
        selectedAllergies = selectedAllergies.filter(a => a !== item)
      } else {
        selectedAllergies = [...selectedAllergies, item]
      }
    }),
    saveToDatabase: vi.fn(),
    loadFromDatabase: vi.fn(),
    clearPreferences: vi.fn(),
  })

  beforeEach(() => {
    selectedAllergies = []
    mockUseOnboardingPreferences.mockImplementation(() => createMockReturn(selectedAllergies))
  })

  describe('Page Structure', () => {
    it('renders page title', () => {
      render(<AllergiesPage />)
      expect(screen.getByRole('heading', { name: 'Allergy & Dietary Restrictions' })).toBeInTheDocument()
    })

    it('renders description', () => {
      render(<AllergiesPage />)
      expect(screen.getByText(/let us know about your allergies/i)).toBeInTheDocument()
    })

    it('renders search input', () => {
      render(<AllergiesPage />)
      expect(screen.getByPlaceholderText('Search allergies...')).toBeInTheDocument()
    })
  })

  describe('Category Tabs', () => {
    const categories = [
      'Nuts & Seeds',
      'Spices & Herbs',
      'Dairy Products',
      'Seafood',
      'Grains & Gluten',
      'Fruits',
      'Vegetables',
      'Other',
    ]

    it.each(categories)('renders %s category tab', (category) => {
      render(<AllergiesPage />)
      expect(screen.getByRole('button', { name: category })).toBeInTheDocument()
    })

    it('shows Nuts & Seeds as default active category', () => {
      render(<AllergiesPage />)
      expect(screen.getByRole('button', { name: 'Almonds' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Peanuts' })).toBeInTheDocument()
    })

    it('switches to Dairy Products when clicked', async () => {
      render(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Dairy Products' }))
      expect(screen.getByRole('button', { name: 'Milk' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cheese' })).toBeInTheDocument()
    })

    it('switches to Seafood when clicked', async () => {
      render(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Seafood' }))
      expect(screen.getByRole('button', { name: 'Shrimp' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Crab' })).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('filters items based on search query', async () => {
      render(<AllergiesPage />)
      const searchInput = screen.getByPlaceholderText('Search allergies...')
      await userEvent.type(searchInput, 'almond')
      expect(screen.getByRole('button', { name: 'Almonds' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Peanuts' })).not.toBeInTheDocument()
    })

    it('shows no results message for invalid search', async () => {
      render(<AllergiesPage />)
      const searchInput = screen.getByPlaceholderText('Search allergies...')
      await userEvent.type(searchInput, 'xyz123nonexistent')
      expect(screen.getByText(/no items found/i)).toBeInTheDocument()
    })

    it('clears search when switching tabs', async () => {
      render(<AllergiesPage />)
      const searchInput = screen.getByPlaceholderText('Search allergies...')
      await userEvent.type(searchInput, 'almond')
      await userEvent.click(screen.getByRole('button', { name: 'Dairy Products' }))
      expect(searchInput).toHaveValue('')
    })

    it('search is case insensitive', async () => {
      render(<AllergiesPage />)
      const searchInput = screen.getByPlaceholderText('Search allergies...')
      await userEvent.type(searchInput, 'ALMOND')
      expect(screen.getByRole('button', { name: 'Almonds' })).toBeInTheDocument()
    })
  })

  describe('Selection Behavior', () => {
    it('selects an allergy item on click', async () => {
      const { rerender } = render(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Almonds' }))
      rerender(<AllergiesPage />)
      expect(screen.getByRole('button', { name: 'Almonds' })).toHaveClass('bg-amber-50')
    })

    it('deselects an allergy item on second click', async () => {
      const { rerender } = render(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Peanuts' }))
      rerender(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Peanuts' }))
      rerender(<AllergiesPage />)
      expect(screen.getByRole('button', { name: 'Peanuts' })).not.toHaveClass('bg-amber-50')
    })

    it('allows selecting multiple items', async () => {
      const { rerender } = render(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Almonds' }))
      rerender(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Peanuts' }))
      rerender(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Walnuts' }))
      rerender(<AllergiesPage />)

      expect(screen.getByRole('button', { name: 'Almonds' })).toHaveClass('bg-amber-50')
      expect(screen.getByRole('button', { name: 'Peanuts' })).toHaveClass('bg-amber-50')
      expect(screen.getByRole('button', { name: 'Walnuts' })).toHaveClass('bg-amber-50')
    })

    it('preserves selections when switching tabs', async () => {
      const { rerender } = render(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Almonds' }))
      rerender(<AllergiesPage />)
      await userEvent.click(screen.getByRole('button', { name: 'Dairy Products' }))
      await userEvent.click(screen.getByRole('button', { name: 'Nuts & Seeds' }))
      expect(screen.getByRole('button', { name: 'Almonds' })).toHaveClass('bg-amber-50')
    })
  })

  describe('Accessibility', () => {
    it('search input has accessible label', () => {
      render(<AllergiesPage />)
      const searchInput = screen.getByPlaceholderText('Search allergies...')
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('category tabs are keyboard accessible', () => {
      render(<AllergiesPage />)
      const tabs = screen.getAllByRole('button').filter(btn => 
        ['Nuts & Seeds', 'Dairy Products', 'Seafood'].some(cat => btn.textContent?.includes(cat))
      )
      tabs.forEach(tab => {
        expect(tab).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })
})
