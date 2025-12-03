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
 * Gemini AI configuration
 * Server-side only - these should not be exposed to the client
 */
export const geminiEnv = {
  get GEMINI_API_KEY(): string {
    return process.env.GEMINI_API_KEY ?? ''
  },
  get GEMINI_TEXT_MODEL(): string {
    return process.env.GEMINI_TEXT_MODEL ?? 'gemini-1.5-flash'
  },
  get GEMINI_MAX_TOKENS(): number {
    return parseInt(process.env.GEMINI_MAX_TOKENS ?? '2048', 10)
  },
  get GEMINI_TEMPERATURE(): number {
    return parseFloat(process.env.GEMINI_TEMPERATURE ?? '0.7')
  },
} as const

/**
 * ElevenLabs configuration for voice coaching
 */
export const elevenlabsEnv = {
  get ELEVENLABS_API_KEY(): string {
    return process.env.ELEVENLABS_API_KEY ?? ''
  },
  get ELEVENLABS_VOICE_ID(): string {
    // Default to "Rachel" voice - a warm, friendly female voice good for coaching
    return process.env.ELEVENLABS_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL'
  },
  get ELEVENLABS_MODEL_ID(): string {
    // eleven_multilingual_v2 for highest quality
    return process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2'
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

/**
 * Validate Gemini API environment variables
 * Call this server-side only before using Gemini services
 * Throws a descriptive error if GEMINI_API_KEY is missing
 */
export function validateGeminiEnv(): void {
  const requiredVars = ['GEMINI_API_KEY']

  const missing = requiredVars.filter((name) => !process.env[name])

  if (missing.length > 0) {
    throw new Error(
      `Missing required Gemini environment variables:\n${missing.map(n => `  - ${n}`).join('\n')}\n` +
      `Please add them to your .env.local file.`
    )
  }
}

/**
 * Validate ElevenLabs environment variables
 */
export function validateElevenlabsEnv(): void {
  const requiredVars = ['ELEVENLABS_API_KEY']

  const missing = requiredVars.filter((name) => !process.env[name])

  if (missing.length > 0) {
    throw new Error(
      `Missing required ElevenLabs environment variables:\n${missing.map(n => `  - ${n}`).join('\n')}\n` +
      `Please add them to your .env.local file.`
    )
  }
}
