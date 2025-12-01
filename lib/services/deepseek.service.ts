import { deepseekEnv, validateDeepseekEnv } from '@/lib/env'
import { formatConversationHistory, buildSystemPrompt, type UserPreferences } from './prompt-builder'
import type { ChatMessage, QuickReply, RecipeOption } from '@/types/chat'
import { transformToAIResponse, parseRecipesFromResponse } from './gemini.service'

export interface DeepseekServiceConfig {
  apiKey: string
  model: string
  baseUrl: string
  maxTokens: number
  temperature: number
}

interface DeepseekChatChoice {
  message?: { content?: string }
}

interface DeepseekChatResponse {
  choices?: DeepseekChatChoice[]
}

export class DeepseekService {
  private config: DeepseekServiceConfig

  constructor(config?: Partial<DeepseekServiceConfig>) {
    validateDeepseekEnv()

    this.config = {
      apiKey: config?.apiKey || deepseekEnv.DEEPSEEK_API_KEY,
      model: config?.model || deepseekEnv.DEEPSEEK_MODEL,
      baseUrl: config?.baseUrl || deepseekEnv.DEEPSEEK_BASE_URL,
      maxTokens: config?.maxTokens ?? deepseekEnv.DEEPSEEK_MAX_TOKENS ?? 2048,
      temperature: config?.temperature ?? deepseekEnv.DEEPSEEK_TEMPERATURE ?? 0.7,
    }
  }

  async generateResponse(
    message: string,
    conversationHistory: ChatMessage[] = [],
    userPreferences?: UserPreferences
  ): Promise<{ content: string; quickReplies?: QuickReply[]; recipeOptions?: RecipeOption[] }> {
    const systemPrompt = buildSystemPrompt(userPreferences)
    const historyContext = formatConversationHistory(conversationHistory, {
      maxTokens: Math.floor(this.config.maxTokens / 2),
    })

    const userContent =
      (historyContext ? `Previous conversation:\n${historyContext}\n\n` : '') +
      `User: ${message}\n\nAssistant:`

    const body = {
      model: this.config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      stream: false,
    }

    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`DeepSeek API error: ${response.status} ${text}`)
    }

    const data = (await response.json()) as DeepseekChatResponse
    const content = data.choices?.[0]?.message?.content ?? "I'm having trouble responding right now."

    // Parse recipes from the response content
    const recipes = parseRecipesFromResponse(content)

    return transformToAIResponse(content, recipes)
  }
}

export function createDeepseekService(config?: Partial<DeepseekServiceConfig>): DeepseekService {
  return new DeepseekService(config)
}
