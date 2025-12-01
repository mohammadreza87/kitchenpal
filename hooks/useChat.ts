'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createChatService } from '@/lib/services/chat.service'
import { useUser } from './useUser'
import type { ChatMessage, Conversation, ChatState, RecipeOption, QuickReply } from '@/types/chat'

/**
 * Extended chat state to include image generation loading
 * Requirements: 2.1 - Image generation for recipes
 */
interface ExtendedChatState extends ChatState {
  isGeneratingImage: boolean
  recipeImages: Record<string, string> // Map of recipe id to image URL
}

/**
 * useChat Hook - Manages chat state and message operations
 * Requirements: 1.1 (message sending), 1.4 (loading state), 2.1 (image generation), 6.2 (message persistence)
 */
export function useChat(initialConversationId?: string) {
  const { user, loading: userLoading } = useUser()
  
  const [state, setState] = useState<ExtendedChatState>({
    messages: [],
    isLoading: false,
    error: null,
    conversationId: initialConversationId || null,
    lastFailedMessage: undefined,
    isGeneratingImage: false,
    recipeImages: {},
  })
  
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const supabase = useMemo(() => createClient(), [])
  const chatService = useMemo(() => createChatService(supabase), [supabase])

  /**
   * Load conversation and messages
   * Requirements: 6.2 - Restore previous messages
   */
  const loadConversation = useCallback(async (conversationId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const [conv, messages] = await Promise.all([
        chatService.getConversation(conversationId),
        chatService.getConversationMessages(conversationId),
      ])

      if (conv) {
        setConversation(conv)
        setState(prev => ({
          ...prev,
          messages,
          conversationId,
          isLoading: false,
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: 'Conversation not found',
          isLoading: false,
        }))
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load conversation',
        isLoading: false,
      }))
    }
  }, [chatService])


  /**
   * Create a new conversation
   */
  const createConversation = useCallback(async (title?: string): Promise<string | null> => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Not authenticated' }))
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const conv = await chatService.createConversation(user.id, title)
      if (conv) {
        setConversation(conv)
        setState(prev => ({
          ...prev,
          messages: [],
          conversationId: conv.id,
          isLoading: false,
        }))
        return conv.id
      }
      return null
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to create conversation',
        isLoading: false,
      }))
      return null
    }
  }, [user?.id, chatService])

  /**
   * Send a message and get AI response
   * Requirements: 1.1 - Send message, 1.4 - Show loading indicator, 7.1, 7.2 - Error handling
   */
  const sendMessage = useCallback(async (
    content: string,
    userPreferences?: { allergies?: string[]; dietary?: string[] }
  ): Promise<boolean> => {
    // Validate message is not empty
    if (!chatService.validateMessage(content)) {
      setState(prev => ({ ...prev, error: 'Message cannot be empty' }))
      return false
    }

    let currentConversationId = state.conversationId

    // Create conversation if none exists
    if (!currentConversationId) {
      if (!user?.id) {
        setState(prev => ({ ...prev, error: 'Not authenticated' }))
        return false
      }
      
      try {
        const conv = await chatService.createConversation(user.id)
        if (conv) {
          currentConversationId = conv.id
          setConversation(conv)
          setState(prev => ({ ...prev, conversationId: conv.id }))
        } else {
          setState(prev => ({ ...prev, error: 'Failed to create conversation' }))
          return false
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to create conversation',
        }))
        return false
      }
    }

    // Create a temporary message ID for optimistic update
    const tempMessageId = `temp-${Date.now()}`
    const tempUserMessage: ChatMessage = {
      id: tempMessageId,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sending',
    }

    // Add optimistic user message and clear any previous errors
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, tempUserMessage],
      isLoading: true,
      error: null,
      lastFailedMessage: undefined,
    }))

    try {
      // Send user message
      const userMessage = await chatService.sendMessage(currentConversationId, content)
      
      if (userMessage) {
        // Replace temp message with actual message
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === tempMessageId
              ? { ...userMessage, status: 'sent' as const }
              : msg
          ),
        }))
      }

      // Get AI response
      const aiResponse = await chatService.getAIResponse(
        currentConversationId,
        content,
        userPreferences
      )

      // Store and display AI response
      const assistantMessage = await chatService.storeAIResponse(
        currentConversationId,
        aiResponse.content,
        aiResponse.quickReplies,
        aiResponse.recipeOptions
      )

      if (assistantMessage) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, { ...assistantMessage, status: 'sent' as const }],
          isLoading: false,
        }))

        // Trigger image generation for recipe options if present
        // Requirements: 2.1 - Image generation for recipes
        if (aiResponse.recipeOptions && aiResponse.recipeOptions.length > 0) {
          // Generate images in the background (don't await)
          generateImagesForRecipes(aiResponse.recipeOptions)
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      
      // Mark the message as failed
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === tempMessageId
            ? { ...msg, status: 'failed' as const, errorMessage }
            : msg
        ),
        error: "I'm having trouble connecting. Please try again.",
        lastFailedMessage: content,
        isLoading: false,
      }))
      return false
    }
  }, [state.conversationId, user?.id, chatService])


  /**
   * Retry sending a failed message
   * Requirements: 7.1, 7.2 - Retry button for failed messages
   */
  const retryMessage = useCallback(async (
    messageId: string,
    userPreferences?: { allergies?: string[]; dietary?: string[] }
  ): Promise<boolean> => {
    // Find the failed message
    const failedMessage = state.messages.find(
      msg => msg.id === messageId && msg.status === 'failed'
    )
    
    if (!failedMessage) {
      return false
    }

    // Remove the failed message from the list before retrying
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId),
      error: null,
      lastFailedMessage: undefined,
    }))

    // Retry sending the message
    return sendMessage(failedMessage.content, userPreferences)
  }, [state.messages, sendMessage])

  /**
   * Retry the last failed message
   * Requirements: 7.1 - Retry option for AI service failures
   */
  const retryLastFailedMessage = useCallback(async (
    userPreferences?: { allergies?: string[]; dietary?: string[] }
  ): Promise<boolean> => {
    if (!state.lastFailedMessage) {
      return false
    }

    // Find and remove any failed messages
    const failedMessageIds = state.messages
      .filter(msg => msg.status === 'failed')
      .map(msg => msg.id)

    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => !failedMessageIds.includes(msg.id)),
      error: null,
    }))

    // Retry with the last failed message content
    return sendMessage(state.lastFailedMessage, userPreferences)
  }, [state.lastFailedMessage, state.messages, sendMessage])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  /**
   * Inject an assistant message (e.g., from vision or local helpers)
   */
  const addAssistantMessage = useCallback((content: string, quickReplies?: QuickReply[], recipeOptions?: RecipeOption[]) => {
    const message: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      status: 'sent',
      quickReplies: quickReplies && quickReplies.length > 0 ? quickReplies : undefined,
      recipeOptions: recipeOptions && recipeOptions.length > 0 ? recipeOptions : undefined,
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }))
  }, [])

  /**
   * Reset chat state
   */
  const resetChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      conversationId: null,
      lastFailedMessage: undefined,
      isGeneratingImage: false,
      recipeImages: {},
    })
    setConversation(null)
  }, [])

  /**
   * Generate image for a recipe
   * Requirements: 2.1 - Image generation for recipes
   */
  const generateRecipeImage = useCallback(async (
    recipeName: string,
    recipeId: string,
    description?: string
  ): Promise<string | null> => {
    // Check if we already have an image for this recipe
    if (state.recipeImages[recipeId]) {
      return state.recipeImages[recipeId]
    }

    setState(prev => ({ ...prev, isGeneratingImage: true }))

    try {
      // Call the image API route
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeName,
          description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      const imageUrl = data.imageUrl || '/assets/illustrations/food/placeholder-recipe.svg'

      // Store the image URL
      setState(prev => ({
        ...prev,
        isGeneratingImage: false,
        recipeImages: {
          ...prev.recipeImages,
          [recipeId]: imageUrl,
        },
      }))

      return imageUrl
    } catch (error) {
      console.error('Failed to generate recipe image:', error)
      
      // Use fallback placeholder
      const fallbackUrl = '/assets/illustrations/food/placeholder-recipe.svg'
      setState(prev => ({
        ...prev,
        isGeneratingImage: false,
        recipeImages: {
          ...prev.recipeImages,
          [recipeId]: fallbackUrl,
        },
      }))

      return fallbackUrl
    }
  }, [state.recipeImages])

  /**
   * Generate images for multiple recipes
   * Requirements: 2.1 - Image generation for recipes
   */
  const generateImagesForRecipes = useCallback(async (
    recipeOptions: RecipeOption[]
  ): Promise<void> => {
    if (!recipeOptions || recipeOptions.length === 0) return

    // Generate images for each recipe in parallel
    const imagePromises = recipeOptions.map(recipe =>
      generateRecipeImage(recipe.name, recipe.id)
    )

    await Promise.allSettled(imagePromises)
  }, [generateRecipeImage])

  /**
   * Get image URL for a recipe
   * Requirements: 2.1 - Image generation for recipes
   */
  const getRecipeImage = useCallback((recipeId: string): string | undefined => {
    return state.recipeImages[recipeId]
  }, [state.recipeImages])

  /**
   * Get user conversations list
   */
  const getUserConversations = useCallback(async (): Promise<Conversation[]> => {
    if (!user?.id) return []
    
    try {
      return await chatService.getUserConversations(user.id)
    } catch (err) {
      console.error('Failed to get conversations:', err)
      return []
    }
  }, [user?.id, chatService])

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      await chatService.deleteConversation(conversationId)
      
      // If deleting current conversation, reset state
      if (conversationId === state.conversationId) {
        resetChat()
      }
      
      return true
    } catch (err) {
      console.error('Failed to delete conversation:', err)
      return false
    }
  }, [state.conversationId, chatService, resetChat])

  // Initialize: load conversation if ID provided
  useEffect(() => {
    if (!userLoading) {
      if (initialConversationId && user?.id) {
        loadConversation(initialConversationId)
      }
      setIsInitializing(false)
    }
  }, [initialConversationId, user?.id, userLoading, loadConversation])

  return {
    // State
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    conversation,
    isInitializing: userLoading || isInitializing,
    isAuthenticated: !!user,
    lastFailedMessage: state.lastFailedMessage,
    
    // Image generation state (Requirements: 2.1)
    isGeneratingImage: state.isGeneratingImage,
    recipeImages: state.recipeImages,
    
    // Actions
    sendMessage,
    loadConversation,
    createConversation,
    retryMessage,
    retryLastFailedMessage,
    clearError,
    addAssistantMessage,
    resetChat,
    getUserConversations,
    deleteConversation,
    
    // Image generation actions (Requirements: 2.1)
    generateRecipeImage,
    generateImagesForRecipes,
    getRecipeImage,
    
    // Utilities
    validateMessage: chatService.validateMessage.bind(chatService),
  }
}
