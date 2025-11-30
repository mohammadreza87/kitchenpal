import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PreferencesSummaryPage from '@/app/(main)/profile/preferences/page'
import { routerMock } from './mocks'

describe('PreferencesSummaryPage (Profile)', () => {
  it('renders saved preferences across sections', () => {
    render(<PreferencesSummaryPage />)

    expect(screen.getByRole('heading', { name: 'Preferences' })).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Dietary Preferences' })).toBeInTheDocument()
    expect(screen.getByText('Dairy-Free')).toBeInTheDocument()
    expect(screen.getByText('Mediterranean')).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Cuisine Preferences' })).toBeInTheDocument()
    expect(screen.getByText('Italian')).toBeInTheDocument()
    expect(screen.getByText('Chinese')).toBeInTheDocument()
    expect(screen.getByText('Japanese')).toBeInTheDocument()
    expect(screen.getByText('Spanish Tapas')).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Allergy & Dietary Restrictions' })).toBeInTheDocument()
    expect(screen.getByText('Peanuts')).toBeInTheDocument()
    expect(screen.getByText('Sesame')).toBeInTheDocument()
    expect(screen.getByText('Dairy')).toBeInTheDocument()
    expect(screen.getByText('Nuts')).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Cooking Skills' })).toBeInTheDocument()
    expect(screen.getByText('Enthusiast')).toBeInTheDocument()
  })

  it('navigates back and to edit flow', async () => {
    render(<PreferencesSummaryPage />)

    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(routerMock.back).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(routerMock.push).toHaveBeenCalledWith('/preferences')
  })
})
