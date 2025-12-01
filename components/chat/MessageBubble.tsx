'use client'

import { forwardRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/chat'

export interface MessageBubbleProps {
  message: ChatMessage
  className?: string
  onRetry?: (messageId: string) => void
}

/**
 * MessageBubble Component
 * Renders chat messages with appropriate alignment and styling based on role.
 * - User messages: right-aligned with brand primary color
 * - AI messages: left-aligned with avatar
 * - Failed messages: show error state with retry button
 * Requirements: 5.1, 5.2, 7.2
 */
const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ message, className, onRetry }, ref) => {
    const isUser = message.role === 'user'
    const isAssistant = message.role === 'assistant'
    const isFailed = message.status === 'failed'
    const isSending = message.status === 'sending'

    return (
      <div
        ref={ref}
        data-role={message.role}
        data-status={message.status}
        className={cn(
          'flex w-full gap-3',
          isUser ? 'justify-end' : 'justify-start',
          className
        )}
      >
        {/* AI Avatar - only shown for assistant messages */}
        {isAssistant && (
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10">
              <Image
                src="/assets/icons/Chef's Hat.svg"
                alt="AI Assistant"
                width={24}
                height={24}
                className="opacity-80"
              />
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className="flex flex-col items-end max-w-[75%]">
          <div
            className={cn(
              'rounded-2xl px-4 py-3',
              isUser
                ? 'bg-brand-primary text-white rounded-br-md'
                : 'bg-white text-foreground shadow-sm rounded-bl-md',
              isFailed && 'bg-red-100 border border-red-300',
              isSending && 'opacity-70'
            )}
          >
            <p className={cn(
              'text-body-md whitespace-pre-wrap break-words',
              isFailed && isUser && 'text-red-800'
            )}>
              {message.content}
            </p>
            
            {/* Timestamp or Status */}
            <p
              className={cn(
                'mt-1 text-label-sm',
                isUser ? 'text-white/70' : 'text-muted-foreground',
                isFailed && 'text-red-600',
                isSending && 'text-white/50'
              )}
            >
              {isSending ? 'Sending...' : isFailed ? 'Failed to send' : formatTime(message.timestamp)}
            </p>
          </div>

          {/* Retry button for failed messages */}
          {isFailed && onRetry && (
            <button
              onClick={() => onRetry(message.id)}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-label-sm font-medium text-red-600 transition-colors hover:bg-red-100"
              aria-label="Retry sending message"
            >
              <Image
                src="/assets/icons/Rotate-Right.svg"
                alt=""
                width={14}
                height={14}
                className="opacity-70"
              />
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }
)

MessageBubble.displayName = 'MessageBubble'

/**
 * Format timestamp to readable time string
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export { MessageBubble }
