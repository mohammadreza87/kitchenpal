import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SecurityAndPrivacyPage from '@/app/(main)/profile/security/page'

// Mock security settings
const mockSettings = {
  id: 'test-settings-id',
  user_id: 'test-user-id',
  two_factor_enabled: false,
  two_factor_method: null,
  login_alerts: true,
  biometric_lock: false,
  passkey_enabled: false,
  data_personalization: true,
  usage_analytics: true,
  private_mode: false,
  deletion_requested_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockSessions = [
  {
    id: 'session-1',
    user_id: 'test-user-id',
    device_name: 'MacBook Pro',
    device_type: 'desktop',
    location: 'San Francisco, CA',
    ip_address: '192.168.1.1',
    last_seen: '2024-01-01T00:00:00Z',
    is_current: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'session-2',
    user_id: 'test-user-id',
    device_name: 'iPhone 15',
    device_type: 'mobile',
    location: 'New York, NY',
    ip_address: '192.168.1.2',
    last_seen: '2024-01-02T00:00:00Z',
    is_current: false,
    created_at: '2024-01-02T00:00:00Z',
  },
]

const mockUseSecuritySettings = vi.fn()

vi.mock('@/hooks/useSecuritySettings', () => ({
  useSecuritySettings: () => mockUseSecuritySettings(),
}))

describe('SecurityAndPrivacyPage', () => {
  const defaultMockReturn = {
    settings: mockSettings,
    sessions: mockSessions,
    mfaFactors: [],
    mfaEnrollment: null,
    loading: false,
    error: null,
    startMFAEnrollment: vi.fn(),
    verifyMFAEnrollment: vi.fn(),
    cancelMFAEnrollment: vi.fn(),
    disableMFA: vi.fn(),
    toggleTwoFactor: vi.fn(),
    toggleLoginAlerts: vi.fn(),
    toggleBiometricLock: vi.fn(),
    toggleDataPersonalization: vi.fn(),
    toggleUsageAnalytics: vi.fn(),
    togglePrivateMode: vi.fn(),
    signOutSession: vi.fn(),
    signOutAllOtherSessions: vi.fn(),
    requestDataExport: vi.fn().mockResolvedValue('Data exported'),
    requestDataDeletion: vi.fn().mockResolvedValue('Deletion requested'),
    changePassword: vi.fn(),
    refetch: vi.fn(),
  }

  beforeEach(() => {
    mockUseSecuritySettings.mockReturnValue(defaultMockReturn)
  })

  describe('Loading State', () => {
    it('renders skeleton when loading', () => {
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        settings: null,
        sessions: [],
        loading: true,
      })

      render(<SecurityAndPrivacyPage />)
      expect(screen.queryByRole('heading', { name: /Security & Privacy/i })).not.toBeInTheDocument()
    })
  })

  describe('Page Structure', () => {
    it('renders page title', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByRole('heading', { name: /Security & Privacy/i })).toBeInTheDocument()
    })

    it('renders all section headings', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByRole('heading', { name: /Account Protection/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Privacy Controls/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Sessions & Devices/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Your Data/i })).toBeInTheDocument()
    })

    it('renders back button link', () => {
      render(<SecurityAndPrivacyPage />)
      const backLink = screen.getByAltText('Back').closest('a')
      expect(backLink).toHaveAttribute('href', '/profile')
    })
  })


  describe('Account Protection Section', () => {
    it('renders two-factor authentication toggle', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Two-factor authentication')).toBeInTheDocument()
    })

    it('renders login alerts toggle', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Login alerts')).toBeInTheDocument()
    })

    it('renders biometric lock toggle', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Biometric lock')).toBeInTheDocument()
    })

    it('shows correct toggle states based on settings', () => {
      render(<SecurityAndPrivacyPage />)
      const toggles = screen.getAllByRole('checkbox')
      
      // Two-factor should be off (index 0)
      expect(toggles[0]).not.toBeChecked()
      // Login alerts should be on (index 1)
      expect(toggles[1]).toBeChecked()
      // Biometric should be off (index 2)
      expect(toggles[2]).not.toBeChecked()
    })

    it('shows enabled status when 2FA is on', () => {
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        settings: { ...mockSettings, two_factor_enabled: true },
      })

      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Enabled via authenticator app')).toBeInTheDocument()
    })
  })

  describe('Privacy Controls Section', () => {
    it('renders personalized recommendations toggle', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Personalized recommendations')).toBeInTheDocument()
    })

    it('renders privacy-safe analytics toggle', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Privacy-safe analytics')).toBeInTheDocument()
    })

    it('renders private mode toggle', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Private mode')).toBeInTheDocument()
    })

    it('shows correct toggle states for privacy controls', () => {
      render(<SecurityAndPrivacyPage />)
      const toggles = screen.getAllByRole('checkbox')
      
      // Data personalization should be on (index 3)
      expect(toggles[3]).toBeChecked()
      // Usage analytics should be on (index 4)
      expect(toggles[4]).toBeChecked()
      // Private mode should be off (index 5)
      expect(toggles[5]).not.toBeChecked()
    })
  })

  describe('Sessions & Devices Section', () => {
    it('renders session devices', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
      expect(screen.getByText('iPhone 15')).toBeInTheDocument()
    })

    it('shows current device indicator', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Primary device')).toBeInTheDocument()
    })

    it('renders sign out button for non-current sessions', () => {
      render(<SecurityAndPrivacyPage />)
      const signOutButtons = screen.getAllByRole('button', { name: /^sign out$/i })
      expect(signOutButtons.length).toBe(1) // Only for non-current session
    })

    it('renders sign out all other sessions button', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByRole('button', { name: /sign out of all other sessions/i })).toBeInTheDocument()
    })

    it('calls signOutSession when clicking sign out on a device', async () => {
      const signOutSession = vi.fn()
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        signOutSession,
      })

      render(<SecurityAndPrivacyPage />)
      const signOutButton = screen.getByRole('button', { name: /^sign out$/i })
      await userEvent.click(signOutButton)

      await waitFor(() => {
        expect(signOutSession).toHaveBeenCalledWith('session-2')
      })
    })

    it('calls signOutAllOtherSessions when clicking sign out all', async () => {
      const signOutAllOtherSessions = vi.fn()
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        signOutAllOtherSessions,
      })

      render(<SecurityAndPrivacyPage />)
      const signOutAllButton = screen.getByRole('button', { name: /sign out of all other sessions/i })
      await userEvent.click(signOutAllButton)

      await waitFor(() => {
        expect(signOutAllOtherSessions).toHaveBeenCalledWith('session-1')
      })
    })
  })


  describe('Your Data Section', () => {
    it('renders download data button', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Download my data')).toBeInTheDocument()
    })

    it('renders request deletion button', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Request data deletion')).toBeInTheDocument()
    })

    it('calls requestDataExport when clicking download', async () => {
      const requestDataExport = vi.fn().mockResolvedValue('Data exported')
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        requestDataExport,
      })

      // Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<SecurityAndPrivacyPage />)
      const downloadButton = screen.getByText('Download my data').closest('button')!
      await userEvent.click(downloadButton)

      await waitFor(() => {
        expect(requestDataExport).toHaveBeenCalled()
      })

      alertMock.mockRestore()
    })

    it('shows deletion already requested when deletion_requested_at is set', () => {
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        settings: { ...mockSettings, deletion_requested_at: '2024-01-01T00:00:00Z' },
      })

      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Deletion already requested')).toBeInTheDocument()
    })

    it('shows deletion warning banner when deletion is requested', () => {
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        settings: { ...mockSettings, deletion_requested_at: '2024-01-01T00:00:00Z' },
      })

      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText(/Account deletion requested/i)).toBeInTheDocument()
    })
  })

  describe('Support Section', () => {
    it('renders support card', () => {
      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Need to report a concern?')).toBeInTheDocument()
    })

    it('renders contact support link', () => {
      render(<SecurityAndPrivacyPage />)
      const contactLink = screen.getByRole('link', { name: /contact security support/i })
      expect(contactLink).toHaveAttribute('href', 'mailto:support@kitchenpal.app')
    })
  })

  describe('Toggle Interactions', () => {
    it('calls toggleLoginAlerts when toggling login alerts', async () => {
      const toggleLoginAlerts = vi.fn()
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        toggleLoginAlerts,
      })

      render(<SecurityAndPrivacyPage />)
      const toggles = screen.getAllByRole('checkbox')
      await userEvent.click(toggles[1]) // Login alerts toggle

      expect(toggleLoginAlerts).toHaveBeenCalledWith(false)
    })

    it('calls togglePrivateMode when toggling private mode', async () => {
      const togglePrivateMode = vi.fn()
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        togglePrivateMode,
      })

      render(<SecurityAndPrivacyPage />)
      const toggles = screen.getAllByRole('checkbox')
      await userEvent.click(toggles[5]) // Private mode toggle

      expect(togglePrivateMode).toHaveBeenCalledWith(true)
    })
  })

  describe('MFA Enrollment', () => {
    it('shows MFA setup modal when enrollment is in progress', () => {
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        mfaEnrollment: {
          id: 'factor-id',
          type: 'totp',
          totp: {
            qr_code: 'data:image/png;base64,test',
            secret: 'TESTSECRET',
            uri: 'otpauth://totp/test',
          },
        },
      })

      render(<SecurityAndPrivacyPage />)
      expect(screen.getByText('Set Up Two-Factor Authentication')).toBeInTheDocument()
    })

    it('calls startMFAEnrollment when enabling 2FA', async () => {
      const startMFAEnrollment = vi.fn()
      mockUseSecuritySettings.mockReturnValue({
        ...defaultMockReturn,
        startMFAEnrollment,
      })

      render(<SecurityAndPrivacyPage />)
      const toggles = screen.getAllByRole('checkbox')
      await userEvent.click(toggles[0]) // 2FA toggle

      await waitFor(() => {
        expect(startMFAEnrollment).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('all toggles are accessible', () => {
      render(<SecurityAndPrivacyPage />)
      const toggles = screen.getAllByRole('checkbox')
      expect(toggles.length).toBe(6)
    })

    it('all buttons are accessible', () => {
      render(<SecurityAndPrivacyPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
