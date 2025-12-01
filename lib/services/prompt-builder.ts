/**
 * Prompt Builder Service for Gemini AI Integration
 * Requirements: 1.2 (user preferences in prompts), 5.1 (conversation history), 5.2 (token limits)
 */

import type { ChatMessage } from '@/types/chat'

/**
 * User preferences for prompt customization
 */
export interface UserPreferences {
  allergies?: string[]
  dietary?: string[]
  cuisinePreferences?: string[]
  cookingSkill?: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * Configuration for prompt building
 */
export interface PromptBuilderConfig {
  maxTokens?: number
  charsPerToken?: number // Approximate characters per token for estimation
}

const DEFAULT_CONFIG: Required<PromptBuilderConfig> = {
  maxTokens: 2048,
  charsPerToken: 4, // Rough estimate: 1 token ≈ 4 characters
}

/**
 * System prompt template for KitchenPal cooking assistant
 */
const SYSTEM_PROMPT_TEMPLATE = `You are KitchenPal, a friendly and knowledgeable cooking assistant.
Your role is to help users discover recipes based on their available ingredients,
dietary preferences, and cooking skill level.

{{USER_PREFERENCES}}

Guidelines:
1. Always consider user allergies and dietary restrictions
2. Suggest recipes appropriate for the user's skill level
3. Provide clear, step-by-step instructions
4. Include prep time, cook time, and serving size
5. Be encouraging and supportive
6. When suggesting recipes, format them as structured JSON when requested`

/**
 * Builds the system prompt with user preferences included
 * Property 1: System prompt includes user preferences
 * Validates: Requirements 1.2
 */
export function buildSystemPrompt(preferences?: UserPreferences): string {
  let preferencesSection = 'User Preferences:\n'

  if (!preferences) {
    preferencesSection += '- No specific preferences provided'
    return SYSTEM_PROMPT_TEMPLATE.replace('{{USER_PREFERENCES}}', preferencesSection)
  }

  const parts: string[] = []

  if (preferences.allergies && preferences.allergies.length > 0) {
    parts.push(`- Allergies: ${preferences.allergies.join(', ')}`)
  }

  if (preferences.dietary && preferences.dietary.length > 0) {
    parts.push(`- Dietary Restrictions: ${preferences.dietary.join(', ')}`)
  }

  if (preferences.cuisinePreferences && preferences.cuisinePreferences.length > 0) {
    parts.push(`- Cuisine Preferences: ${preferences.cuisinePreferences.join(', ')}`)
  }

  if (preferences.cookingSkill) {
    parts.push(`- Cooking Skill: ${preferences.cookingSkill}`)
  }

  if (parts.length === 0) {
    preferencesSection += '- No specific preferences provided'
  } else {
    preferencesSection += parts.join('\n')
  }

  return SYSTEM_PROMPT_TEMPLATE.replace('{{USER_PREFERENCES}}', preferencesSection)
}

/**
 * Builds a prompt for ingredient-based recipe queries
 * Requirements: 1.3
 */
export function buildRecipePrompt(
  ingredients: string[],
  preferences?: UserPreferences
): string {
  const ingredientList = ingredients.join(', ')
  
  let prompt = `I have the following ingredients: ${ingredientList}\n\n`
  prompt += 'Please suggest recipes I can make with these ingredients.\n\n'
  
  if (preferences) {
    const restrictions: string[] = []
    
    if (preferences.allergies && preferences.allergies.length > 0) {
      restrictions.push(`Avoid recipes containing: ${preferences.allergies.join(', ')}`)
    }
    
    if (preferences.dietary && preferences.dietary.length > 0) {
      restrictions.push(`Dietary requirements: ${preferences.dietary.join(', ')}`)
    }
    
    if (preferences.cookingSkill) {
      restrictions.push(`Skill level: ${preferences.cookingSkill}`)
    }
    
    if (restrictions.length > 0) {
      prompt += 'Constraints:\n' + restrictions.map(r => `- ${r}`).join('\n') + '\n\n'
    }
  }
  
  prompt += `Please provide recipes in the following JSON format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "ingredients": [{"name": "ingredient", "quantity": 1, "unit": "cup"}],
      "instructions": ["Step 1", "Step 2"],
      "prepTime": "10 mins",
      "cookTime": "20 mins",
      "servings": 4,
      "difficulty": "Easy|Medium|Hard"
    }
  ]
}`

  return prompt
}

/**
 * Builds a prompt for food image generation
 * Requirements: 2.1, 2.2
 */
export function buildImagePrompt(
  recipeName: string,
  description?: string
): string {
  let prompt = `A professional food photography style image of ${recipeName}.`
  
  if (description) {
    prompt += ` ${description}.`
  }
  
  prompt += ' The dish is beautifully plated on a clean white plate, '
  prompt += 'with soft natural lighting, shallow depth of field, '
  prompt += 'appetizing and realistic appearance, high-quality restaurant presentation.'
  
  return prompt
}

/**
 * Formats conversation history for context inclusion
 * Property 9: Conversation history inclusion
 * Validates: Requirements 5.1
 */
export function formatConversationHistory(
  messages: ChatMessage[],
  config?: PromptBuilderConfig
): string {
  if (!messages || messages.length === 0) {
    return ''
  }

  const { maxTokens, charsPerToken } = { ...DEFAULT_CONFIG, ...config }
  const maxChars = maxTokens * charsPerToken

  // Sort messages by timestamp to ensure chronological order
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Format all messages
  const formattedMessages = sortedMessages.map((msg) => {
    const role = msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System'
    return `${role}: ${msg.content}`
  })

  // Join all messages
  let result = formattedMessages.join('\n\n')

  // Property 10: Token limit enforcement
  // Validates: Requirements 5.2
  // If result exceeds max chars, truncate from the beginning (keep recent messages)
  if (result.length > maxChars) {
    result = truncateConversationHistory(formattedMessages, maxChars)
  }

  return result
}

/**
 * Truncates conversation history to fit within token limits
 * Keeps the most recent messages and adds a summary indicator
 * Property 10: Token limit enforcement
 * Validates: Requirements 5.2
 */
function truncateConversationHistory(
  formattedMessages: string[],
  maxChars: number
): string {
  const summaryPrefix = '[Earlier conversation truncated]\n\n'
  const availableChars = maxChars - summaryPrefix.length

  // Start from the most recent messages and work backwards
  const includedMessages: string[] = []
  let currentLength = 0

  for (let i = formattedMessages.length - 1; i >= 0; i--) {
    const message = formattedMessages[i]
    const messageLength = message.length + 2 // +2 for '\n\n' separator

    if (currentLength + messageLength <= availableChars) {
      includedMessages.unshift(message)
      currentLength += messageLength
    } else {
      break
    }
  }

  // If we had to truncate, add the summary prefix
  if (includedMessages.length < formattedMessages.length) {
    return summaryPrefix + includedMessages.join('\n\n')
  }

  return includedMessages.join('\n\n')
}

/**
 * Estimates the token count for a given text
 * Uses a simple character-based estimation
 */
export function estimateTokenCount(
  text: string,
  charsPerToken: number = DEFAULT_CONFIG.charsPerToken
): number {
  return Math.ceil(text.length / charsPerToken)
}

/**
 * Checks if the formatted history is within token limits
 * Property 10: Token limit enforcement
 * Validates: Requirements 5.2
 */
export function isWithinTokenLimit(
  text: string,
  maxTokens: number = DEFAULT_CONFIG.maxTokens,
  charsPerToken: number = DEFAULT_CONFIG.charsPerToken
): boolean {
  const estimatedTokens = estimateTokenCount(text, charsPerToken)
  return estimatedTokens <= maxTokens
}
