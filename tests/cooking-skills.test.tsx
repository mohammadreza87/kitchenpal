import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CookingSkillsPage from '@/app/(onboarding)/cooking-skills/page'

describe('CookingSkillsPage', () => {
  it('renders the page title and description', () => {
    render(<CookingSkillsPage />)

    expect(screen.getByText('Cooking Skills')).toBeInTheDocument()
    expect(
      screen.getByText(/share your cooking expertise/i)
    ).toBeInTheDocument()
  })

  it('renders all skill level options', () => {
    render(<CookingSkillsPage />)

    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Enthusiast')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('allows selecting a skill level', async () => {
    render(<CookingSkillsPage />)

    const beginnerButton = screen.getByRole('button', { name: /beginner/i })
    expect(beginnerButton).not.toHaveClass('bg-amber-50')

    await userEvent.click(beginnerButton)

    expect(beginnerButton).toHaveClass('bg-amber-50')
  })

  it('allows changing skill level selection', async () => {
    render(<CookingSkillsPage />)

    const beginnerButton = screen.getByRole('button', { name: /beginner/i })
    const advancedButton = screen.getByRole('button', { name: /advanced/i })

    await userEvent.click(beginnerButton)
    expect(beginnerButton).toHaveClass('bg-amber-50')

    await userEvent.click(advancedButton)
    expect(advancedButton).toHaveClass('bg-amber-50')
    expect(beginnerButton).not.toHaveClass('bg-amber-50')
  })

  it('only allows one skill level to be selected at a time', async () => {
    render(<CookingSkillsPage />)

    const beginnerButton = screen.getByRole('button', { name: /beginner/i })
    const enthusiastButton = screen.getByRole('button', { name: /enthusiast/i })
    const advancedButton = screen.getByRole('button', { name: /advanced/i })

    await userEvent.click(beginnerButton)
    await userEvent.click(enthusiastButton)
    await userEvent.click(advancedButton)

    expect(advancedButton).toHaveClass('bg-amber-50')
    expect(beginnerButton).not.toHaveClass('bg-amber-50')
    expect(enthusiastButton).not.toHaveClass('bg-amber-50')
  })
})
