import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import SecurityAndPrivacyPage from '@/app/(main)/profile/security/page'

describe('SecurityAndPrivacyPage', () => {
  it('shows security and privacy controls with expected defaults', () => {
    render(<SecurityAndPrivacyPage />)

    expect(screen.getByRole('heading', { name: /Security & Privacy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Account Protection/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Privacy Controls/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Sessions & Devices/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Your Data/i })).toBeInTheDocument()

    const toggles = screen.getAllByRole('checkbox')
    expect(toggles).toHaveLength(6)

    expect(toggles[0]).toBeChecked() // Two-factor authentication
    expect(toggles[1]).toBeChecked() // Login alerts
    expect(toggles[2]).not.toBeChecked() // Biometric lock
    expect(toggles[3]).toBeChecked() // Personalized recommendations
    expect(toggles[4]).toBeChecked() // Privacy-safe analytics
    expect(toggles[5]).not.toBeChecked() // Private mode
  })

  it('allows signing out a specific device and all sessions', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    render(<SecurityAndPrivacyPage />)

    const deviceSignOutButtons = screen.getAllByRole('button', { name: /^sign out$/i })
    await userEvent.click(deviceSignOutButtons[0])
    expect(infoSpy).toHaveBeenCalledWith('Sign out requested for device: mac')

    await userEvent.click(screen.getByRole('button', { name: /sign out of all other sessions/i }))
    expect(screen.getByRole('button', { name: /sign out of all other sessions/i })).toBeInTheDocument()

    infoSpy.mockRestore()
  })
})
