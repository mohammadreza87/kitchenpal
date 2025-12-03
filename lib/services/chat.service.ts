import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type {
  ChatMessage,
  Conversation,
  ChatMessageMetadata,
  QuickReply,
  RecipeOption,
  MessageRole,
  ConversationRow,
  ChatMessageRow,
} from '@/types/chat'
import { chatMessageFromRow, conversationFromRow } from '@/types/chat'
import {
  GeminiServiceError,
  GeminiService,
  createGeminiService,
  type AIResponse,
} from './gemini.service'
import type { UserPreferences } from './prompt-builder'

/**
 * Chat Service for message operations
 * Requirements: 1.1 (message sending), 1.2 (AI response), 6.2 (message persistence)
 * Uses Google Gemini for all AI responses
 */
export class ChatService {
  private supabase: SupabaseClient<Database>
  private geminiService: GeminiService | null = null

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
    // Initialize Gemini service on the server; client will use API route
    if (typeof window === 'undefined') {
      try {
        this.geminiService = createGeminiService()
      } catch {
        // Service will be null if API key is missing
        console.warn('Gemini service not initialized - using fallback responses')
      }
    }
  }

  /**
   * Validates that a message is not empty or whitespace-only
   * Requirements: 1.3 - Empty message rejection
   */
  validateMessage(content: string): boolean {
    return content.trim().length > 0
  }

  /**
   * Creates a new conversation for a user
   * Requirements: 6.2 - Message persistence
   */
  async createConversation(userId: string, title?: string): Promise<Conversation | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('conversations')
      .insert({
        user_id: userId,
        title: title || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      throw new Error(error.message)
    }

    return data ? conversationFromRow(data as ConversationRow) : null
  }

  /**
   * Gets a conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      console.error('Error fetching conversation:', error)
      throw new Error(error.message)
    }

    return data ? conversationFromRow(data as ConversationRow) : null
  }

  /**
   * Gets all conversations for a user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      throw new Error(error.message)
    }

    return (data || []).map((row: ConversationRow) => conversationFromRow(row))
  }

  /**
   * Gets all messages in a conversation
   * Requirements: 6.2 - Restore previous messages
   */
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      throw new Error(error.message)
    }

    return (data || []).map((row: ChatMessageRow) => chatMessageFromRow(row))
  }

  /**
   * Sends a user message and stores it in the database
   * Requirements: 1.1 - Send message to AI backend
   */
  async sendMessage(
    conversationId: string,
    content: string,
    metadata?: ChatMessageMetadata
  ): Promise<ChatMessage | null> {
    // Validate message is not empty
    if (!this.validateMessage(content)) {
      throw new Error('Message cannot be empty')
    }

    const messageInsert = {
      conversation_id: conversationId,
      role: 'user' as MessageRole,
      content: content.trim(),
      metadata: metadata || {},
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('chat_messages')
      .insert(messageInsert)
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      throw new Error(error.message)
    }

    // Update conversation's updated_at timestamp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.supabase as any)
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data ? chatMessageFromRow(data as ChatMessageRow) : null
  }

  /**
   * Stores an AI response message
   * Requirements: 1.2 - Display AI response
   */
  async storeAIResponse(
    conversationId: string,
    content: string,
    quickReplies?: QuickReply[],
    recipeOptions?: RecipeOption[]
  ): Promise<ChatMessage | null> {
    const metadata: ChatMessageMetadata = {}
    if (quickReplies && quickReplies.length > 0) {
      metadata.quickReplies = quickReplies
    }
    if (recipeOptions && recipeOptions.length > 0) {
      metadata.recipeOptions = recipeOptions
    }

    const messageInsert = {
      conversation_id: conversationId,
      role: 'assistant' as MessageRole,
      content,
      metadata,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('chat_messages')
      .insert(messageInsert)
      .select()
      .single()

    if (error) {
      console.error('Error storing AI response:', error)
      throw new Error(error.message)
    }

    return data ? chatMessageFromRow(data as ChatMessageRow) : null
  }


  /**
   * Gets AI response using Gemini (server) or API route fallback
   * Requirements: 1.1 - Send message to AI backend
   * Requirements: 1.2 - Include user preferences in prompt
   * Requirements: 1.4 - Return structured recipe data
   */
  async getAIResponse(
    conversationId: string,
    userMessage: string,
    userPreferences?: { allergies?: string[]; dietary?: string[] }
  ): Promise<{
    content: string
    quickReplies?: QuickReply[]
    recipeOptions?: RecipeOption[]
  }> {
    // Always load history for context and for API fallback
    const conversationHistory = await this.getConversationMessages(conversationId)

    // If Gemini service is not available on the client, try the server API route before falling back
    if (!this.geminiService) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            conversationId,
            conversationHistory,
            userPreferences,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return {
            content: data.content,
            quickReplies: data.quickReplies,
            recipeOptions: data.recipeOptions,
          }
        }

        console.error('Chat API error:', response.status, await response.text())
      } catch (apiError) {
        console.error('Chat API fetch failed:', apiError)
      }

      // Fallback if API route is unavailable
      return this.getFallbackResponse(userMessage)
    }

    try {
      // Transform user preferences to the format expected by prompt builder
      const preferences: UserPreferences | undefined = userPreferences
        ? {
            allergies: userPreferences.allergies,
            dietary: userPreferences.dietary,
          }
        : undefined

      // Call Gemini API with conversation history and preferences
      const aiResponse: AIResponse = await this.geminiService.generateResponse(
        userMessage,
        conversationHistory,
        preferences
      )

      // Transform the response to the expected format
      return this.transformAIResponse(aiResponse)
    } catch (error) {
      // Handle service errors gracefully
      if (error instanceof GeminiServiceError) {
        console.error('Gemini API error:', error.type, error.userMessage)
        // Return user-friendly error message
        return {
          content: error.userMessage,
          quickReplies: [
            { id: '1', label: 'Try again', value: userMessage },
            { id: '2', label: 'Show popular recipes', value: 'show popular recipes' },
          ],
        }
      }

      // For unexpected errors, log and return fallback
      console.error('Unexpected error in getAIResponse:', error)
      return this.getFallbackResponse(userMessage)
    }
  }

  /**
   * Transforms AIResponse to the chat service response format
   * Requirements: 1.4 - Return structured recipe data
   */
  private transformAIResponse(aiResponse: AIResponse): {
    content: string
    quickReplies?: QuickReply[]
    recipeOptions?: RecipeOption[]
  } {
    const result: {
      content: string
      quickReplies?: QuickReply[]
      recipeOptions?: RecipeOption[]
    } = {
      content: aiResponse.content,
    }

    // Include quick replies if present
    if (aiResponse.quickReplies && aiResponse.quickReplies.length > 0) {
      result.quickReplies = aiResponse.quickReplies
    }

    // Include recipe options if present
    if (aiResponse.recipeOptions && aiResponse.recipeOptions.length > 0) {
      result.recipeOptions = aiResponse.recipeOptions
    }

    // Generate quick replies based on content if none provided
    if (!result.quickReplies && !result.recipeOptions) {
      result.quickReplies = this.generateContextualQuickReplies(aiResponse.content)
    }

    return result
  }

  /**
   * Generates contextual quick replies based on AI response content
   */
  private generateContextualQuickReplies(content: string): QuickReply[] {
    const lowerContent = content.toLowerCase()

    // If response mentions recipes or cooking
    if (lowerContent.includes('recipe') || lowerContent.includes('cook')) {
      return [
        { id: '1', label: 'More recipes', value: 'show me more recipe options' },
        { id: '2', label: 'Different cuisine', value: 'suggest a different cuisine' },
        { id: '3', label: 'Quick meals', value: 'show quick meals under 30 minutes' },
      ]
    }

    // If response mentions ingredients
    if (lowerContent.includes('ingredient')) {
      return [
        { id: '1', label: 'I have chicken', value: 'I have chicken' },
        { id: '2', label: 'I have vegetables', value: 'I have vegetables' },
        { id: '3', label: 'Vegetarian options', value: 'show vegetarian recipes' },
      ]
    }

    // Default quick replies
    return [
      { id: '1', label: 'Show popular recipes', value: 'show popular recipes' },
      { id: '2', label: 'Quick meals', value: 'show quick meals under 30 minutes' },
      { id: '3', label: 'Healthy options', value: 'show healthy recipes' },
    ]
  }

  /**
   * Fallback responses when Gemini service is unavailable
   * Used when API key is missing or service initialization fails
   */
  private getFallbackResponse(userMessage: string): {
    content: string
    quickReplies?: QuickReply[]
    recipeOptions?: RecipeOption[]
  } {
    const lowerMessage = userMessage.toLowerCase()

    // Simple keyword-based responses for fallback
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        content: "Hello! I'm your KitchenPal assistant. What ingredients do you have today? I can help you find delicious recipes!",
        quickReplies: [
          { id: '1', label: 'Show popular recipes', value: 'show popular recipes' },
          { id: '2', label: 'I have chicken', value: 'I have chicken' },
          { id: '3', label: 'Vegetarian options', value: 'show vegetarian recipes' },
        ],
      }
    }

    if (lowerMessage.includes('chicken')) {
      return {
        content: 'Great! Here are some delicious chicken recipes I found for you:',
        recipeOptions: [
          { id: 'recipe-1', name: 'Grilled Lemon Herb Chicken' },
          { id: 'recipe-2', name: 'Creamy Tuscan Chicken' },
          { id: 'recipe-3', name: 'Honey Garlic Chicken Stir-Fry' },
        ],
      }
    }

    if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
      return {
        content: 'Here are some tasty vegetarian options:',
        recipeOptions: [
          { id: 'recipe-4', name: 'Mediterranean Quinoa Bowl' },
          { id: 'recipe-5', name: 'Creamy Mushroom Risotto' },
          { id: 'recipe-6', name: 'Thai Vegetable Curry' },
        ],
      }
    }

    // Default response
    return {
      content: "I'd be happy to help you find recipes! Tell me what ingredients you have, or what type of cuisine you're in the mood for.",
      quickReplies: [
        { id: '1', label: 'Quick meals', value: 'show quick meals under 30 minutes' },
        { id: '2', label: 'Healthy options', value: 'show healthy recipes' },
        { id: '3', label: 'Comfort food', value: 'show comfort food recipes' },
      ],
    }
  }

  /**
   * Deletes a conversation and all its messages
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase as any)
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      console.error('Error deleting conversation:', error)
      throw new Error(error.message)
    }

    return true
  }

  /**
   * Updates conversation title
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<Conversation | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('conversations')
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating conversation title:', error)
      throw new Error(error.message)
    }

    return data ? conversationFromRow(data as ConversationRow) : null
  }
}

// Factory function for creating service instance
export function createChatService(supabase: SupabaseClient<Database>) {
  return new ChatService(supabase)
}
