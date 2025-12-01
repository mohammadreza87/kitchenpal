'use client'

import { useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/gsap'
import { useChat } from '@/hooks/useChat'
import { useRecipeDetail } from '@/hooks/useRecipeDetail'
import { usePreferences } from '@/hooks/usePreferences'
import {
  MessageBubble,
  QuickReplies,
  RecipeOptions,
  TypingIndicator,
  ChatInput,
} from '@/components/chat'
import {
  RecipeDetailModal,
  RecipeHeader,
  TabNavigation,
  IngredientsTab,
  InstructionsTab,
  ReviewsTab,
} from '@/components/recipe'
import type { QuickReply, RecipeOption } from '@/types/chat'

/**
 * ChatPage Component
 * Main chat interface for AI-powered recipe assistance
 * Requirements: 4.1 (load preferences), 5.3 (welcome message), 5.5 (empty state), 6.1 (navigation)
 */
export default function ChatPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hooks
  const {
    messages,
    isLoading,
    error,
    isInitializing,
    isAuthenticated,
    lastFailedMessage,
    sendMessage,
    retryMessage,
    retryLastFailedMessage,
    clearError,
  } = useChat()

  const {
    recipe,
    isLoading: recipeLoading,
    error: recipeError,
    activeTab,
    portions,
    scaledIngredients,
    isOpen: isRecipeModalOpen,
    openRecipe,
    closeRecipe,
    setActiveTab,
    increasePortions,
    decreasePortions,
  } = useRecipeDetail()

  const { preferences, loading: preferencesLoading } = usePreferences()


  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  // Animate on mount
  useEffect(() => {
    if (!containerRef.current || isInitializing) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')
    gsap.fromTo(
      sections,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }
    )
  }, [isInitializing])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push('/login?redirect=/chat')
    }
  }, [isInitializing, isAuthenticated, router])

  /**
   * Handle sending a message
   * Requirements: 1.1, 1.2 - Send message to AI service
   */
  const handleSendMessage = useCallback(
    async (content: string) => {
      await sendMessage(content, {
        allergies: preferences?.allergies,
        dietary: preferences?.dietary,
      })
    },
    [sendMessage, preferences]
  )

  /**
   * Handle quick reply selection
   * Requirements: 2.2 - Send quick reply as user response
   */
  const handleQuickReplySelect = useCallback(
    (reply: QuickReply) => {
      handleSendMessage(reply.value)
    },
    [handleSendMessage]
  )

  /**
   * Handle recipe option selection
   * Requirements: 3.3 - Open recipe detail modal
   */
  const handleRecipeSelect = useCallback(
    (recipeOption: RecipeOption) => {
      openRecipe(recipeOption.id)
    },
    [openRecipe]
  )

  /**
   * Handle retry for failed messages
   * Requirements: 7.2 - Show retry button for failed messages
   */
  const handleRetryMessage = useCallback(
    async (messageId: string) => {
      await retryMessage(messageId, {
        allergies: preferences?.allergies,
        dietary: preferences?.dietary,
      })
    },
    [retryMessage, preferences]
  )

  /**
   * Handle retry for AI service failures
   * Requirements: 7.1 - Display friendly error message and retry option
   */
  const handleRetryLastFailed = useCallback(
    async () => {
      await retryLastFailedMessage({
        allergies: preferences?.allergies,
        dietary: preferences?.dietary,
      })
    },
    [retryLastFailedMessage, preferences]
  )

  // Show loading state while initializing
  if (isInitializing || preferencesLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  const hasMessages = messages.length > 0


  return (
    <div ref={containerRef} className="flex h-full flex-col bg-neutral-50">
      {/* Chat Header */}
      <div
        data-animate
        className="flex items-center gap-3 border-b border-neutral-100 bg-white px-4 py-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10">
          <Image
            src="/assets/icons/Chef's Hat.svg"
            alt="AI Assistant"
            width={24}
            height={24}
            className="opacity-80"
          />
        </div>
        <div>
          <h1 className="text-body-lg font-semibold">KitchenPal AI</h1>
          <p className="text-label-sm text-muted-foreground">
            Your cooking assistant
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Welcome Message / Empty State */}
        {!hasMessages && (
          <div data-animate className="flex flex-col items-center py-8">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10">
              <Image
                src="/assets/icons/Chef's Hat.svg"
                alt=""
                width={40}
                height={40}
                className="opacity-70"
              />
            </div>
            <h2 className="mb-2 text-heading-sm font-semibold">
              Welcome to KitchenPal!
            </h2>
            <p className="mb-6 max-w-xs text-center text-body-md text-muted-foreground">
              I&apos;m your AI cooking assistant. Tell me what ingredients you have,
              and I&apos;ll suggest delicious recipes!
            </p>

            {/* Conversation Starters */}
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <p className="text-label-sm text-muted-foreground text-center mb-2">
                Try asking:
              </p>
              {conversationStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(starter)}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-body-sm text-foreground transition-colors hover:border-brand-primary/50 hover:bg-brand-primary/5"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message List */}
        {hasMessages && (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col gap-2">
                <MessageBubble 
                  message={message} 
                  onRetry={message.status === 'failed' ? handleRetryMessage : undefined}
                />

                {/* Quick Replies */}
                {message.role === 'assistant' && message.quickReplies && message.quickReplies.length > 0 && (
                  <div className="ml-13 pl-13">
                    <QuickReplies
                      options={message.quickReplies}
                      onSelect={handleQuickReplySelect}
                      disabled={isLoading}
                    />
                  </div>
                )}

                {/* Recipe Options */}
                {message.role === 'assistant' && message.recipeOptions && message.recipeOptions.length > 0 && (
                  <div className="ml-13 pl-13">
                    <RecipeOptions
                      options={message.recipeOptions}
                      onSelect={handleRecipeSelect}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}

            {/* Error Message - Requirements: 7.1 - Display friendly error message and retry option */}
            {error && (
              <div className="flex flex-col gap-3 rounded-lg bg-red-50 px-4 py-3">
                <div className="flex items-center gap-2 text-red-600">
                  <Image
                    src="/assets/icons/X-Circle.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="opacity-70"
                  />
                  <span className="text-body-sm flex-1">{error}</span>
                  <button
                    onClick={clearError}
                    className="text-label-sm font-medium underline"
                    aria-label="Dismiss error"
                  >
                    Dismiss
                  </button>
                </div>
                {/* Retry button for AI service failures */}
                {lastFailedMessage && (
                  <button
                    onClick={handleRetryLastFailed}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-label-sm font-medium text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
                  >
                    <Image
                      src="/assets/icons/Rotate-Right.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="opacity-70"
                    />
                    Try again
                  </button>
                )}
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        onSend={handleSendMessage}
        isLoading={isLoading}
        placeholder="Ask about recipes or ingredients..."
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={isRecipeModalOpen}
        onClose={closeRecipe}
        recipe={recipe}
        isLoading={recipeLoading}
        error={recipeError}
      >
        {recipe && (
          <>
            <RecipeHeader
              title={recipe.name}
              author={recipe.author}
              rating={recipe.rating}
              reviewCount={recipe.reviewCount}
              prepTime={recipe.prepTime}
              difficulty={recipe.difficulty}
              calories={recipe.calories}
              description={recipe.description}
            />
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="px-4 pb-6">
              {activeTab === 'ingredients' && (
                <IngredientsTab
                  ingredients={scaledIngredients}
                  portions={portions}
                  onIncrease={increasePortions}
                  onDecrease={decreasePortions}
                />
              )}
              {activeTab === 'instructions' && (
                <InstructionsTab instructions={recipe.instructions} />
              )}
              {activeTab === 'reviews' && (
                <ReviewsTab
                  reviews={recipe.reviews}
                  totalCount={recipe.reviewCount}
                  averageRating={recipe.rating}
                />
              )}
            </div>
          </>
        )}
      </RecipeDetailModal>
    </div>
  )
}

/**
 * Conversation starters for empty state
 * Requirements: 5.5 - Show suggested conversation starters
 */
const conversationStarters = [
  "What can I make with chicken and rice?",
  "I'm looking for a quick vegetarian dinner",
  "Suggest a healthy breakfast recipe",
  "What's a good dessert for beginners?",
]
