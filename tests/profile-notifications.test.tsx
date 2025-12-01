import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import NotificationPage from '@/app/(main)/profile/notifications/page'

// Mock notification settings
const mockSettings = {
  id: 'test-id',
  user_id: 'test-user-id',
  push_inspiration: true,
  push_updates: false,
  email_inspiration: false,
  email_updates: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockUseNotificationSettings = vi.fn()

vi.mock('@/hooks/useNotificationSettings', () => ({
  useNotificationSettings: () => mockUseNotificationSettings(),
}))

describe('NotificationPage', () => {
  const defaultMockReturn = {
    settings: mockSettings,
    loading: false,
    error: null,
    togglePushInspiration: vi.fn(),
    togglePushUpdates: vi.fn(),
    toggleEmailInspiration: vi.fn(),
    toggleEmailUpdates: vi.fn(),
    unsubscribeAll: vi.fn(),
    refetch: vi.fn(),
  }

  beforeEach(() => {
    mockUseNotificationSettings.mockReturnValue(defaultMockReturn)
  })

  it('renders notification page title', () => {
    render(<NotificationPage />)
    expect(screen.getByRole('heading', { name: 'Notification' })).toBeInTheDocument()
  })

  it('renders notification switches', () => {
    render(<NotificationPage />)
    const switches = screen.getAllByRole('checkbox')
    expect(switches.length).toBe(4)
  })

  it('shows correct initial switch states', () => {
    render(<NotificationPage />)
    const switches = screen.getAllByRole('checkbox')
    expect(switches[0]).toBeChecked() // Push Inspiration
    expect(switches[1]).not.toBeChecked() // Push Updates
    expect(switches[2]).not.toBeChecked() // Email Inspiration
    expect(switches[3]).toBeChecked() // Email Updates
  })

  it('calls toggle function when switch is clicked', async () => {
    const togglePushInspiration = vi.fn()
    mockUseNotificationSettings.mockReturnValue({
      ...defaultMockReturn,
      togglePushInspiration,
    })

    render(<NotificationPage />)
    const switches = screen.getAllByRole('checkbox')
    await userEvent.click(switches[0])

    expect(togglePushInspiration).toHaveBeenCalledWith(false)
  })

  it('shows loading skeleton when loading', () => {
    mockUseNotificationSettings.mockReturnValue({
      ...defaultMockReturn,
      settings: null,
      loading: true,
    })

    render(<NotificationPage />)
    expect(screen.queryByRole('heading', { name: 'Notification' })).not.toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
