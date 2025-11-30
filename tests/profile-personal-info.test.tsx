import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PersonalInfoPage from '@/app/(main)/profile/personal-info/page'

describe('PersonalInfoPage', () => {
  it('shows the profile summary by default', () => {
    render(<PersonalInfoPage />)

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByText('Hannah Andrew')).toBeInTheDocument()
    expect(screen.getByText('hannah.1989@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('+31612222222')).toBeInTheDocument()
    expect(screen.getByText('Amsterdam, Netherlands')).toBeInTheDocument()
  })

  it('enters edit mode and exposes editable fields', async () => {
    render(<PersonalInfoPage />)

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await userEvent.click(editButtons[0])

    expect(screen.getByRole('heading', { name: 'Edit Personal Information' })).toBeInTheDocument()

    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('Hannah Andrew')
    expect(inputs[1]).toHaveValue('hannah.1989@gmail.com')
    expect(inputs[2]).toHaveValue('+31612222222')
    expect(inputs[3]).toHaveValue('Amsterdam, Netherlands')
  })
})
