const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return 'Email is required'
  if (!emailPattern.test(trimmed)) return 'Please enter a valid email address!'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return null
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name is required'
  return null
}

export function validatePasswordsMatch(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}
