import React from 'react'
import { vi } from 'vitest'

export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
}

export const pathnameMock = {
  value: '/preferences',
}

export const setPathname = (path: string) => {
  pathnameMock.value = path
}

export const resetPathnameMock = () => {
  pathnameMock.value = '/preferences'
}

export const supabaseAuthMock = {
  signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
  signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
  updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
  signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}

export const resetSupabaseAuthMock = () => {
  supabaseAuthMock.signInWithPassword.mockClear()
  supabaseAuthMock.signInWithPassword.mockResolvedValue({ data: {}, error: null })
  supabaseAuthMock.signUp.mockClear()
  supabaseAuthMock.signUp.mockResolvedValue({ data: {}, error: null })
  supabaseAuthMock.resetPasswordForEmail.mockClear()
  supabaseAuthMock.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null })
  supabaseAuthMock.updateUser.mockClear()
  supabaseAuthMock.updateUser.mockResolvedValue({ data: {}, error: null })
  supabaseAuthMock.signInWithOAuth.mockClear()
  supabaseAuthMock.signInWithOAuth.mockResolvedValue({ data: {}, error: null })
  supabaseAuthMock.signOut.mockClear()
  supabaseAuthMock.signOut.mockResolvedValue({ error: null })
}

export const resetRouterMock = () => {
  Object.values(routerMock).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      (fn as { mockClear: () => void }).mockClear()
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = ReturnType<typeof vi.fn<any[], any>>

interface TimelineApi {
  fromTo: MockFn
  to: MockFn
  call: MockFn
}

export const gsapMock = {
  timeline: vi.fn((options?: { onComplete?: () => void }) => {
    const api: TimelineApi = {
      fromTo: vi.fn().mockReturnThis(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to: vi.fn().mockImplementation((...args: any[]) => {
        const lastArg = args[args.length - 1]
        if (lastArg && typeof lastArg === 'object' && typeof lastArg.onComplete === 'function') {
          lastArg.onComplete()
        }
        return api
      }),
      call: vi.fn((fn?: () => void) => {
        fn?.()
        options?.onComplete?.()
        return api
      }),
    }
    return api
  }),
  to: vi.fn((_, config?: { onComplete?: () => void }) => {
    config?.onComplete?.()
    return {}
  }),
  fromTo: vi.fn((_, __, config?: { onComplete?: () => void }) => {
    config?.onComplete?.()
    return {}
  }),
  set: vi.fn(),
}
