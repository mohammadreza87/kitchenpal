import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CuisinePreferencesPage from '@/app/(onboarding)/cuisine/page'

describe('CuisinePreferencesPage', () => {
  it('renders the page title and description', () => {
    render(<CuisinePreferencesPage />)

    expect(screen.getByText('Cuisine Preferences')).toBeInTheDocument()
    expect(
      screen.getByText(/share your favorite cuisines/i)
    ).toBeInTheDocument()
  })

  it('renders all cuisine options', () => {
    render(<CuisinePreferencesPage />)

    expect(screen.getByText('Chinese')).toBeInTheDocument()
    expect(screen.getByText('Thai')).toBeInTheDocument()
    expect(screen.getByText('Japanese')).toBeInTheDocument()
    expect(screen.getByText('Italian')).toBeInTheDocument()
    expect(screen.getByText('French')).toBeInTheDocument()
    expect(screen.getByText('Mexican')).toBeInTheDocument()
    expect(screen.getByText('Mediterranean')).toBeInTheDocument()
    expect(screen.getByText('Indian')).toBeInTheDocument()
    expect(screen.getByText('Middle Eastern')).toBeInTheDocument()
    expect(screen.getByText('Spanish Tapas')).toBeInTheDocument()
  })

  it('allows selecting a cuisine option', async () => {
    render(<CuisinePreferencesPage />)

    const italianButton = screen.getByRole('button', { name: /italian/i })
    expect(italianButton).not.toHaveClass('bg-amber-50')

    await userEvent.click(italianButton)

    expect(italianButton).toHaveClass('bg-amber-50')
  })

  it('allows deselecting a cuisine option', async () => {
    render(<CuisinePreferencesPage />)

    const japaneseButton = screen.getByRole('button', { name: /japanese/i })

    await userEvent.click(japaneseButton)
    expect(japaneseButton).toHaveClass('bg-amber-50')

    await userEvent.click(japaneseButton)
    expect(japaneseButton).not.toHaveClass('bg-amber-50')
  })

  it('allows selecting multiple cuisine options', async () => {
    render(<CuisinePreferencesPage />)

    const italianButton = screen.getByRole('button', { name: /italian/i })
    const thaiButton = screen.getByRole('button', { name: /thai/i })
    const mexicanButton = screen.getByRole('button', { name: /mexican/i })

    await userEvent.click(italianButton)
    await userEvent.click(thaiButton)
    await userEvent.click(mexicanButton)

    expect(italianButton).toHaveClass('bg-amber-50')
    expect(thaiButton).toHaveClass('bg-amber-50')
    expect(mexicanButton).toHaveClass('bg-amber-50')
  })
})
