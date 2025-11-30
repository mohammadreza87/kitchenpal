import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DietaryPreferencesPage from '@/app/(onboarding)/preferences/page'

describe('DietaryPreferencesPage', () => {
  it('renders the page title and description', () => {
    render(<DietaryPreferencesPage />)

    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument()
    expect(
      screen.getByText(/help us customize your recipes/i)
    ).toBeInTheDocument()
  })

  it('renders all dietary options', () => {
    render(<DietaryPreferencesPage />)

    expect(screen.getByText('Dairy-Free')).toBeInTheDocument()
    expect(screen.getByText('Keto')).toBeInTheDocument()
    expect(screen.getByText('Low-Fat')).toBeInTheDocument()
    expect(screen.getByText('Low-Carb')).toBeInTheDocument()
    expect(screen.getByText('Vegan')).toBeInTheDocument()
    expect(screen.getByText('Vegetarian')).toBeInTheDocument()
    expect(screen.getByText('Mediterranean')).toBeInTheDocument()
    expect(screen.getByText('Gluten-Free')).toBeInTheDocument()
  })

  it('allows selecting a dietary option', async () => {
    render(<DietaryPreferencesPage />)

    const ketoButton = screen.getByRole('button', { name: /keto/i })
    expect(ketoButton).not.toHaveClass('bg-amber-50')

    await userEvent.click(ketoButton)

    expect(ketoButton).toHaveClass('bg-amber-50')
  })

  it('allows deselecting a dietary option', async () => {
    render(<DietaryPreferencesPage />)

    const veganButton = screen.getByRole('button', { name: /vegan/i })

    await userEvent.click(veganButton)
    expect(veganButton).toHaveClass('bg-amber-50')

    await userEvent.click(veganButton)
    expect(veganButton).not.toHaveClass('bg-amber-50')
  })

  it('allows selecting multiple dietary options', async () => {
    render(<DietaryPreferencesPage />)

    const ketoButton = screen.getByRole('button', { name: /keto/i })
    const veganButton = screen.getByRole('button', { name: /vegan/i })
    const lowCarbButton = screen.getByRole('button', { name: /low-carb/i })

    await userEvent.click(ketoButton)
    await userEvent.click(veganButton)
    await userEvent.click(lowCarbButton)

    expect(ketoButton).toHaveClass('bg-amber-50')
    expect(veganButton).toHaveClass('bg-amber-50')
    expect(lowCarbButton).toHaveClass('bg-amber-50')
  })
})
