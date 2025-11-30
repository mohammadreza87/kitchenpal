import { describe, expect, it } from 'vitest'
import { validateEmail, validateName, validatePassword, validatePasswordsMatch } from '../lib/validation'

describe('validateEmail', () => {
  it('rejects empty email', () => {
    expect(validateEmail('')).toBe('Email is required')
  })

  it('rejects malformed email', () => {
    expect(validateEmail('not-an-email')).toBe('Please enter a valid email address!')
  })

  it('accepts valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull()
  })
})

describe('validatePassword', () => {
  it('rejects empty password', () => {
    expect(validatePassword('')).toBe('Password is required')
  })

  it('rejects short password', () => {
    expect(validatePassword('123')).toBe('Password must be at least 6 characters')
  })

  it('accepts strong enough password', () => {
    expect(validatePassword('secret1')).toBeNull()
  })
})

describe('validateName', () => {
  it('rejects empty name', () => {
    expect(validateName('  ')).toBe('Name is required')
  })

  it('accepts non-empty name', () => {
    expect(validateName('Kitchen Pal')).toBeNull()
  })
})

describe('validatePasswordsMatch', () => {
  it('requires confirm password', () => {
    expect(validatePasswordsMatch('secret1', '')).toBe('Please confirm your password')
  })

  it('rejects mismatch', () => {
    expect(validatePasswordsMatch('secret1', 'secret2')).toBe('Passwords do not match')
  })

  it('accepts matching passwords', () => {
    expect(validatePasswordsMatch('secret1', 'secret1')).toBeNull()
  })
})
