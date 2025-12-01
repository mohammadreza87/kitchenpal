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
 * DeepSeek configuration
 */
export const deepseekEnv = {
  get DEEPSEEK_API_KEY(): string {
    return process.env.DEEPSEEK_API_KEY ?? ''
  },
  get DEEPSEEK_MODEL(): string {
    return process.env.DEEPSEEK_MODEL ?? 'deepseek-chat'
  },
  get DEEPSEEK_BASE_URL(): string {
    return process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com'
  },
  get DEEPSEEK_MAX_TOKENS(): number {
    return parseInt(process.env.DEEPSEEK_MAX_TOKENS ?? '2048', 10)
  },
  get DEEPSEEK_TEMPERATURE(): number {
    return parseFloat(process.env.DEEPSEEK_TEMPERATURE ?? '0.7')
  },
} as const

/**
 * Leonardo configuration
 */
export const leonardoEnv = {
  get LEONARDO_API_KEY(): string {
    return process.env.LEONARDO_API_KEY ?? ''
  },
  get LEONARDO_MODEL_ID(): string {
    return process.env.LEONARDO_MODEL_ID ?? ''
  },
  get LEONARDO_BASE_URL(): string {
    return process.env.LEONARDO_BASE_URL ?? 'https://cloud.leonardo.ai/api/rest/v1'
  },
  get LEONARDO_IMAGE_SIZE(): string {
    return process.env.LEONARDO_IMAGE_SIZE ?? '768x768'
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
 * Validate DeepSeek environment variables
 */
export function validateDeepseekEnv(): void {
  const requiredVars = ['DEEPSEEK_API_KEY']

  const missing = requiredVars.filter((name) => !process.env[name])

  if (missing.length > 0) {
    throw new Error(
      `Missing required DeepSeek environment variables:\n${missing.map(n => `  - ${n}`).join('\n')}\n` +
      `Please add them to your .env.local file.`
    )
  }
}

/**
 * Validate Leonardo environment variables
 */
export function validateLeonardoEnv(): void {
  const requiredVars = ['LEONARDO_API_KEY']

  const missing = requiredVars.filter((name) => !process.env[name])

  if (missing.length > 0) {
    throw new Error(
      `Missing required Leonardo environment variables:\n${missing.map(n => `  - ${n}`).join('\n')}\n` +
      `Please add them to your .env.local file.`
    )
  }
}
