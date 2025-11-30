import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AllergiesPage from '@/app/(onboarding)/allergies/page'

describe('AllergiesPage', () => {
  it('renders the page title and description', () => {
    render(<AllergiesPage />)

    expect(screen.getByText('Allergy & Dietary Restrictions')).toBeInTheDocument()
    expect(
      screen.getByText(/let us know about your allergies/i)
    ).toBeInTheDocument()
  })

  it('renders the search input', () => {
    render(<AllergiesPage />)

    expect(screen.getByPlaceholderText('Search allergies...')).toBeInTheDocument()
  })

  it('renders all category tabs', () => {
    render(<AllergiesPage />)

    expect(screen.getByRole('button', { name: 'Nuts & Seeds' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spices & Herbs' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dairy Products' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Seafood' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Grains & Gluten' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fruits' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vegetables' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Other' })).toBeInTheDocument()
  })

  it('shows nuts & seeds items by default', () => {
    render(<AllergiesPage />)

    expect(screen.getByRole('button', { name: 'Almonds' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Peanuts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Walnuts' })).toBeInTheDocument()
  })

  it('switches to different category when tab is clicked', async () => {
    render(<AllergiesPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Dairy Products' }))

    expect(screen.getByRole('button', { name: 'Milk' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cheese' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Butter' })).toBeInTheDocument()
  })

  it('filters items based on search query', async () => {
    render(<AllergiesPage />)

    const searchInput = screen.getByPlaceholderText('Search allergies...')
    await userEvent.type(searchInput, 'almond')

    expect(screen.getByRole('button', { name: 'Almonds' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Peanuts' })).not.toBeInTheDocument()
  })

  it('shows no results message when search has no matches', async () => {
    render(<AllergiesPage />)

    const searchInput = screen.getByPlaceholderText('Search allergies...')
    await userEvent.type(searchInput, 'xyz123')

    expect(screen.getByText(/no items found/i)).toBeInTheDocument()
  })

  it('clears search when switching tabs', async () => {
    render(<AllergiesPage />)

    const searchInput = screen.getByPlaceholderText('Search allergies...')
    await userEvent.type(searchInput, 'almond')

    await userEvent.click(screen.getByRole('button', { name: 'Dairy Products' }))

    expect(searchInput).toHaveValue('')
  })

  it('allows selecting an allergy item', async () => {
    render(<AllergiesPage />)

    const almondsButton = screen.getByRole('button', { name: 'Almonds' })
    expect(almondsButton).not.toHaveClass('bg-amber-50')

    await userEvent.click(almondsButton)

    expect(almondsButton).toHaveClass('bg-amber-50')
  })

  it('allows deselecting an allergy item', async () => {
    render(<AllergiesPage />)

    const peanutsButton = screen.getByRole('button', { name: 'Peanuts' })

    await userEvent.click(peanutsButton)
    expect(peanutsButton).toHaveClass('bg-amber-50')

    await userEvent.click(peanutsButton)
    expect(peanutsButton).not.toHaveClass('bg-amber-50')
  })

  it('allows selecting multiple allergy items', async () => {
    render(<AllergiesPage />)

    const almondsButton = screen.getByRole('button', { name: 'Almonds' })
    const peanutsButton = screen.getByRole('button', { name: 'Peanuts' })
    const walnutsButton = screen.getByRole('button', { name: 'Walnuts' })

    await userEvent.click(almondsButton)
    await userEvent.click(peanutsButton)
    await userEvent.click(walnutsButton)

    expect(almondsButton).toHaveClass('bg-amber-50')
    expect(peanutsButton).toHaveClass('bg-amber-50')
    expect(walnutsButton).toHaveClass('bg-amber-50')
  })

  it('preserves selections when switching tabs', async () => {
    render(<AllergiesPage />)

    const almondsButton = screen.getByRole('button', { name: 'Almonds' })
    await userEvent.click(almondsButton)

    await userEvent.click(screen.getByRole('button', { name: 'Dairy Products' }))
    await userEvent.click(screen.getByRole('button', { name: 'Nuts & Seeds' }))

    expect(screen.getByRole('button', { name: 'Almonds' })).toHaveClass('bg-amber-50')
  })
})
