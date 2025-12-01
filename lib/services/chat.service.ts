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

/**
 * Chat Service for message operations
 * Requirements: 1.1 (message sending), 1.2 (AI response), 6.2 (message persistence)
 */
export class ChatService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
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
   * Placeholder for AI API integration
   * This will be replaced with actual AI provider integration
   * Requirements: 1.2 - AI response handling
   */
  async getAIResponse(
    _conversationId: string,
    userMessage: string,
    _userPreferences?: { allergies?: string[]; dietary?: string[] }
  ): Promise<{
    content: string
    quickReplies?: QuickReply[]
    recipeOptions?: RecipeOption[]
  }> {
    // TODO: Replace with actual AI API integration
    // This is a placeholder that returns mock responses
    
    const lowerMessage = userMessage.toLowerCase()
    
    // Simple keyword-based responses for demo
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
        content: "Great! Here are some delicious chicken recipes I found for you:",
        recipeOptions: [
          { id: 'recipe-1', name: 'Grilled Lemon Herb Chicken' },
          { id: 'recipe-2', name: 'Creamy Tuscan Chicken' },
          { id: 'recipe-3', name: 'Honey Garlic Chicken Stir-Fry' },
        ],
      }
    }

    if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
      return {
        content: "Here are some tasty vegetarian options:",
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
