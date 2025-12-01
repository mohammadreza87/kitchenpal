import React from 'react'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { routerMock, supabaseAuthMock, resetSupabaseAuthMock, resetRouterMock, gsapMock, pathnameMock, resetPathnameMock } from './mocks'

// Mock scrollIntoView which is not implemented in jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => pathnameMock.value,
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('next/link', () => ({
  default: (props: any) => React.createElement('a', props, props.children),
}))

vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', { ...props, src: props.src }),
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
  resetPathnameMock()
  vi.clearAllMocks()
})
