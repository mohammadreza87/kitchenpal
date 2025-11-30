/**
 * Environment variable access
 * Provides type-safe access to environment variables
 * Validation only runs in development/build, not during client hydration
 */

/**
 * Environment variables
 * Uses getters to defer access until runtime (required for Next.js client components)
 */
export const env = {
  get SUPABASE_URL(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  },
  get SUPABASE_ANON_KEY(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  },
} as const

/**
 * Validate all environment variables
 * Call this server-side only (e.g., in API routes or server components)
 * to fail fast if config is missing
 */
export function validateEnv(): void {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = requiredVars.filter((name) => !process.env[name])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(n => `  - ${n}`).join('\n')}\n` +
      `Please add them to your .env.local file.`
    )
  }
}
