import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationPage from '@/app/(main)/profile/notifications/page'

describe('NotificationPage', () => {
  it('renders notification settings with initial switch states', () => {
    render(<NotificationPage />)

    expect(screen.getByRole('heading', { name: 'Notification' })).toBeInTheDocument()
    const switches = screen.getAllByRole('checkbox')

    expect(switches[0]).toBeChecked() // Push Inspiration and Offers
    expect(switches[1]).not.toBeChecked() // Push Updates and News
    expect(switches[2]).not.toBeChecked() // Email Inspiration and Offers
    expect(switches[3]).toBeChecked() // Email Updates and News
  })

  it('unsubscribes from all channels', async () => {
    render(<NotificationPage />)

    await userEvent.click(screen.getByRole('button', { name: /unsubscribe all/i }))

    screen.getAllByRole('checkbox').forEach((checkbox) => {
      expect(checkbox).not.toBeChecked()
    })
  })
})
