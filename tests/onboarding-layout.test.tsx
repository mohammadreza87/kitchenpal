import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OnboardingLayout from '@/app/(onboarding)/layout'
import { routerMock, setPathname, resetPathnameMock } from './mocks'
import { beforeEach } from 'vitest'

describe('OnboardingLayout', () => {
  beforeEach(() => {
    resetPathnameMock()
  })

  describe('on preferences page (first step)', () => {
    beforeEach(() => {
      setPathname('/preferences')
    })

    it('renders the layout with children', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('shows progress bar at 25%', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      const progressBar = document.querySelector('[style*="width: 25%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('shows Next button', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    })

    it('shows Skip button', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument()
    })

    it('does not show back button on first step', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      expect(screen.queryByAltText('Back')).not.toBeInTheDocument()
    })

    it('navigates to cuisine page on Next click', async () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Next' }))

      expect(routerMock.push).toHaveBeenCalledWith('/cuisine')
    })

    it('navigates to cuisine page on Skip click', async () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Skip' }))

      expect(routerMock.push).toHaveBeenCalledWith('/cuisine')
    })
  })

  describe('on cuisine page (second step)', () => {
    beforeEach(() => {
      setPathname('/cuisine')
    })

    it('shows progress bar at 50%', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      const progressBar = document.querySelector('[style*="width: 50%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('shows back button', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      expect(screen.getByAltText('Back')).toBeInTheDocument()
    })

    it('navigates back on back button click', async () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      await userEvent.click(screen.getByAltText('Back'))

      expect(routerMock.back).toHaveBeenCalled()
    })

    it('navigates to allergies page on Next click', async () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Next' }))

      expect(routerMock.push).toHaveBeenCalledWith('/allergies')
    })
  })

  describe('on allergies page (third step)', () => {
    beforeEach(() => {
      setPathname('/allergies')
    })

    it('shows progress bar at 75%', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      const progressBar = document.querySelector('[style*="width: 75%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('navigates to cooking-skills page on Next click', async () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Next' }))

      expect(routerMock.push).toHaveBeenCalledWith('/cooking-skills')
    })
  })

  describe('on cooking-skills page (final step)', () => {
    beforeEach(() => {
      setPathname('/cooking-skills')
    })

    it('shows progress bar at 100%', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      const progressBar = document.querySelector('[style*="width: 100%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('shows Done button', () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
    })

    it('navigates to home page on Done click', async () => {
      render(
        <OnboardingLayout>
          <div>Test Content</div>
        </OnboardingLayout>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Done' }))

      expect(routerMock.push).toHaveBeenCalledWith('/home')
    })
  })
})
