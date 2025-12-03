/**
 * ElevenLabs Voice Service for KitchenPal
 * Provides voice coaching for recipe steps using ElevenLabs Text-to-Speech
 * Requirements: Voice-driven recipe guidance, hands-free cooking assistance
 */

import { elevenlabsEnv, validateElevenlabsEnv } from '@/lib/env'

/**
 * Configuration for ElevenLabs service
 */
export interface ElevenLabsServiceConfig {
  apiKey: string
  voiceId: string
  modelId: string
}

/**
 * Voice settings for text-to-speech
 */
export interface VoiceSettings {
  stability: number // 0-1, higher = more stable/consistent
  similarityBoost: number // 0-1, higher = more similar to original voice
  style?: number // 0-1, style exaggeration (v2 models only)
  useSpeakerBoost?: boolean // enhance speaker voice
}

/**
 * Output format options
 */
export type OutputFormat =
  | 'mp3_44100_128' // Standard quality
  | 'mp3_44100_192' // High quality (Creator+ tier)
  | 'pcm_16000'     // PCM 16kHz
  | 'pcm_22050'     // PCM 22.05kHz
  | 'pcm_24000'     // PCM 24kHz

/**
 * Generated audio response
 */
export interface GeneratedAudio {
  audioData: Buffer | ArrayBuffer
  contentType: string
  characterCount: number
}

/**
 * Error types for ElevenLabs service
 */
export type ElevenLabsErrorType =
  | 'API_KEY_MISSING'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'INVALID_VOICE'
  | 'TEXT_TOO_LONG'
  | 'QUOTA_EXCEEDED'
  | 'SERVER_ERROR'

/**
 * Custom error class for ElevenLabs service errors
 */
export class ElevenLabsServiceError extends Error {
  constructor(
    public readonly type: ElevenLabsErrorType,
    public readonly userMessage: string,
    public readonly originalError?: Error,
    public readonly isRetryable: boolean = false
  ) {
    super(userMessage)
    this.name = 'ElevenLabsServiceError'
  }
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<ElevenLabsErrorType, string> = {
  API_KEY_MISSING: 'Voice service not configured. Please contact support.',
  API_ERROR: "I couldn't generate the voice. Please try again.",
  NETWORK_ERROR: 'Connection issue. Please check your internet and try again.',
  RATE_LIMITED: 'Please wait a moment before requesting more audio.',
  INVALID_VOICE: 'Selected voice is not available. Using default voice.',
  TEXT_TOO_LONG: 'Text is too long for voice synthesis. Please try shorter text.',
  QUOTA_EXCEEDED: 'Voice generation quota exceeded. Please try again later.',
  SERVER_ERROR: 'Voice service temporarily unavailable. Please try again later.',
}

/**
 * Classifies an error and returns the appropriate ElevenLabsErrorType
 */
export function classifyElevenLabsError(error: unknown): ElevenLabsErrorType {
  if (error instanceof ElevenLabsServiceError) {
    return error.type
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('401') || message.includes('unauthorized') || message.includes('invalid api key')) {
      return 'API_KEY_MISSING'
    }
    if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
      return 'RATE_LIMITED'
    }
    if (message.includes('quota') || message.includes('insufficient')) {
      return 'QUOTA_EXCEEDED'
    }
    if (message.includes('voice') && (message.includes('not found') || message.includes('invalid'))) {
      return 'INVALID_VOICE'
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('econnrefused')) {
      return 'NETWORK_ERROR'
    }
    if (message.includes('500') || message.includes('503') || message.includes('service unavailable')) {
      return 'SERVER_ERROR'
    }
  }

  return 'API_ERROR'
}

/**
 * Creates an ElevenLabsServiceError from any error
 */
export function createElevenLabsError(error: unknown): ElevenLabsServiceError {
  if (error instanceof ElevenLabsServiceError) {
    return error
  }

  const errorType = classifyElevenLabsError(error)
  const userMessage = ERROR_MESSAGES[errorType]
  const isRetryable = ['NETWORK_ERROR', 'RATE_LIMITED', 'SERVER_ERROR'].includes(errorType)
  const originalError = error instanceof Error ? error : new Error(String(error))

  return new ElevenLabsServiceError(errorType, userMessage, originalError, isRetryable)
}

/**
 * Default voice settings optimized for cooking coaching
 * - Higher stability for clear, consistent instructions
 * - Moderate similarity for natural sound
 * - Some style for engaging delivery
 */
const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.75,
  similarityBoost: 0.75,
  style: 0.3,
  useSpeakerBoost: true,
}

/**
 * ElevenLabs Service class for text-to-speech
 */
export class ElevenLabsService {
  private config: ElevenLabsServiceConfig
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(config?: Partial<ElevenLabsServiceConfig>) {
    validateElevenlabsEnv()

    this.config = {
      apiKey: config?.apiKey || elevenlabsEnv.ELEVENLABS_API_KEY,
      voiceId: config?.voiceId || elevenlabsEnv.ELEVENLABS_VOICE_ID,
      modelId: config?.modelId || elevenlabsEnv.ELEVENLABS_MODEL_ID,
    }
  }

  /**
   * Converts text to speech using ElevenLabs API
   */
  async textToSpeech(
    text: string,
    options?: {
      voiceId?: string
      voiceSettings?: Partial<VoiceSettings>
      outputFormat?: OutputFormat
    }
  ): Promise<GeneratedAudio> {
    const voiceId = options?.voiceId || this.config.voiceId
    const outputFormat = options?.outputFormat || 'mp3_44100_128'
    const voiceSettings = {
      ...DEFAULT_VOICE_SETTINGS,
      ...options?.voiceSettings,
    }

    const url = `${this.baseUrl}/text-to-speech/${voiceId}?output_format=${outputFormat}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.config.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: this.config.modelId,
        voice_settings: {
          stability: voiceSettings.stability,
          similarity_boost: voiceSettings.similarityBoost,
          style: voiceSettings.style,
          use_speaker_boost: voiceSettings.useSpeakerBoost,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`)
    }

    const audioData = await response.arrayBuffer()

    return {
      audioData,
      contentType: response.headers.get('content-type') || 'audio/mpeg',
      characterCount: text.length,
    }
  }

  /**
   * Generates coaching audio for a recipe step
   * Formats the step text with encouraging coaching language
   */
  async generateStepCoaching(
    stepNumber: number,
    stepText: string,
    totalSteps: number,
    options?: {
      encouragement?: boolean
      tips?: string
    }
  ): Promise<GeneratedAudio> {
    // Build coaching text with natural language
    let coachingText = ''

    // Step introduction
    if (stepNumber === 1) {
      coachingText = `Alright, let's get started! Step ${stepNumber} of ${totalSteps}. `
    } else if (stepNumber === totalSteps) {
      coachingText = `We're on the final step! Step ${stepNumber}. `
    } else {
      coachingText = `Step ${stepNumber} of ${totalSteps}. `
    }

    // Main instruction
    coachingText += stepText

    // Add encouragement if enabled
    if (options?.encouragement) {
      if (stepNumber === totalSteps) {
        coachingText += ' Great job! Your dish is ready.'
      } else if (stepNumber === Math.floor(totalSteps / 2)) {
        coachingText += " You're doing great, we're halfway there!"
      }
    }

    // Add tips if provided
    if (options?.tips) {
      coachingText += ` Quick tip: ${options.tips}`
    }

    return this.textToSpeech(coachingText)
  }

  /**
   * Generates an introduction for a recipe
   */
  async generateRecipeIntro(
    recipeName: string,
    prepTime?: string,
    cookTime?: string,
    difficulty?: string
  ): Promise<GeneratedAudio> {
    let introText = `Today we're making ${recipeName}. `

    if (prepTime || cookTime) {
      introText += 'This recipe takes '
      if (prepTime) introText += `${prepTime} to prepare`
      if (prepTime && cookTime) introText += ' and '
      if (cookTime) introText += `${cookTime} to cook`
      introText += '. '
    }

    if (difficulty) {
      introText += `It's a ${difficulty.toLowerCase()} level recipe. `
    }

    introText += "Let's gather our ingredients and get cooking!"

    return this.textToSpeech(introText)
  }

  /**
   * Generates coaching-style explanation for a cooking step
   * Like a friendly chef guiding you through the process
   */
  async generateStepExplanation(
    stepNumber: number,
    stepText: string,
    totalSteps: number,
    recipeName?: string
  ): Promise<GeneratedAudio> {
    // Build an encouraging, coaching-style explanation
    let coachingText = ''

    // Personalized intro based on step position
    if (stepNumber === 1) {
      coachingText = `Alright chef, let's get cooking! `
      if (recipeName) {
        coachingText += `We're making ${recipeName} and this is going to be delicious. `
      }
      coachingText += `For our first step: `
    } else if (stepNumber === totalSteps) {
      coachingText = `Amazing work! You're on the final step now. Almost there! `
    } else if (stepNumber === Math.ceil(totalSteps / 2)) {
      coachingText = `You're doing fantastic! We're about halfway through. Keep that energy up! `
    } else {
      const encouragements = [
        `Great job so far! Now, `,
        `Perfect! Moving on, `,
        `You've got this! Next up, `,
        `Excellent progress! Now let's `,
        `Looking good! For this step, `,
      ]
      coachingText = encouragements[stepNumber % encouragements.length]
    }

    // Add the instruction with coaching context
    coachingText += this.makeInstructionConversational(stepText)

    // Add tips and encouragement based on content
    if (stepText.toLowerCase().includes('careful') || stepText.toLowerCase().includes('hot')) {
      coachingText += ` And remember, safety first - take your time with this one.`
    } else if (stepText.toLowerCase().includes('stir') || stepText.toLowerCase().includes('mix')) {
      coachingText += ` Keep that motion nice and steady.`
    } else if (stepText.toLowerCase().includes('wait') || stepText.toLowerCase().includes('minutes')) {
      coachingText += ` This is a great time to prep for the next step or just enjoy the amazing aromas!`
    }

    // Closing encouragement for final step
    if (stepNumber === totalSteps) {
      coachingText += ` And that's it! You did it! Time to plate up and enjoy your creation. You should be proud of yourself, chef!`
    }

    return this.textToSpeech(coachingText, {
      voiceSettings: {
        stability: 0.65, // Slightly more expressive for coaching
        similarityBoost: 0.75,
        style: 0.4, // More personality
        useSpeakerBoost: true,
      },
    })
  }

  /**
   * Makes instruction text more conversational
   */
  private makeInstructionConversational(text: string): string {
    // Remove leading verbs that sound robotic and make more natural
    let result = text.trim()

    // Add "you'll want to" or "go ahead and" for more coaching feel
    const startsWithVerb = /^(add|pour|mix|stir|place|put|heat|cook|bake|chop|cut|slice|dice|combine|whisk|fold|season|sprinkle|drizzle)/i
    if (startsWithVerb.test(result)) {
      const prefixes = [
        "you'll want to ",
        "go ahead and ",
        "now ",
        "",
      ]
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
      result = prefix + result.charAt(0).toLowerCase() + result.slice(1)
    }

    return result
  }

  /**
   * Generates a summary of ingredients
   */
  async generateIngredientsSummary(
    ingredients: Array<{ name: string; quantity: number; unit: string }>
  ): Promise<GeneratedAudio> {
    let text = "Here's what you'll need: "

    const ingredientsList = ingredients.map((ing) => {
      const quantity = ing.quantity === 1 ? '' : `${ing.quantity} `
      const unit = ing.unit === 'piece' || ing.unit === 'whole' ? '' : `${ing.unit} of `
      return `${quantity}${unit}${ing.name}`
    })

    // Join with commas and "and" for the last item
    if (ingredientsList.length === 1) {
      text += ingredientsList[0]
    } else if (ingredientsList.length === 2) {
      text += ingredientsList.join(' and ')
    } else {
      const lastItem = ingredientsList.pop()
      text += ingredientsList.join(', ') + ', and ' + lastItem
    }

    text += ". Make sure you have everything ready before we start."

    return this.textToSpeech(text)
  }

  /**
   * Gets available voices from ElevenLabs
   */
  async getVoices(): Promise<Array<{ voiceId: string; name: string; category: string }>> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.config.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`)
    }

    const data = await response.json()

    return data.voices.map((voice: { voice_id: string; name: string; category: string }) => ({
      voiceId: voice.voice_id,
      name: voice.name,
      category: voice.category,
    }))
  }

  /**
   * Gets the current configuration (without exposing API key)
   */
  getConfig(): Omit<ElevenLabsServiceConfig, 'apiKey'> {
    return {
      voiceId: this.config.voiceId,
      modelId: this.config.modelId,
    }
  }
}

/**
 * Factory function for creating ElevenLabsService instance
 */
export function createElevenLabsService(config?: Partial<ElevenLabsServiceConfig>): ElevenLabsService {
  return new ElevenLabsService(config)
}
