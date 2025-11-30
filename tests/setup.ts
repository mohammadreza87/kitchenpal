import React from 'react'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { routerMock, supabaseAuthMock, resetSupabaseAuthMock, resetRouterMock, gsapMock } from './mocks'

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
}))

vi.mock('next/link', () => ({
  default: (props: any) => React.createElement('a', props, props.children),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: supabaseAuthMock,
  }),
}))

vi.mock('@/components/animations/FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}))

vi.mock('@/components/legal/TermsAndConditions', () => ({
  TermsAndConditions: () => null,
}))

vi.mock('@/lib/gsap', () => ({
  gsap: gsapMock,
  ScrollTrigger: {},
}))

afterEach(() => {
  cleanup()
  resetRouterMock()
  resetSupabaseAuthMock()
  vi.clearAllMocks()
})
