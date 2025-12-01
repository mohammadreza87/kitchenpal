'use client'

import { useState, forwardRef, type FormEvent, type KeyboardEvent } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

/**
 * ChatInput Component
 * Text input with send button for chat messages.
 * Validates non-empty messages and shows loading state during send.
 */
const ChatInput = forwardRef<HTMLDivElement, ChatInputProps>(
  (
    {
      onSend,
      isLoading = false,
      disabled = false,
      placeholder = 'Type a message...',
      className,
    },
    ref
  ) => {
    const [message, setMessage] = useState('')

    const isValidMessage = message.trim().length > 0
    const canSend = isValidMessage && !isLoading && !disabled

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      if (!canSend) return

      onSend(message.trim())
      setMessage('')
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (canSend) {
          onSend(message.trim())
          setMessage('')
        }
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-16 left-0 right-0 z-40 border-t border-neutral-100 bg-white px-4 py-3',
          'max-w-3xl mx-auto',
          className
        )}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading || disabled}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border-2 border-gray-200 bg-white px-4 py-4',
                'text-base placeholder:text-gray-400',
                'focus:border-brand-primary focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'max-h-32 min-h-[56px]'
              )}
              style={{
                height: 'auto',
                minHeight: '56px',
              }}
              aria-label="Message input"
            />
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className={cn(
              'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
              canSend
                ? 'bg-brand-primary text-white hover:bg-brand-primary-dark active:scale-95'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            )}
            aria-label={isLoading ? 'Sending message' : 'Send message'}
          >
            {isLoading ? (
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <Image
                src="/assets/icons/Send-2.svg"
                alt=""
                width={24}
                height={24}
                className={cn(
                  'transition-opacity',
                  canSend ? 'opacity-100 invert' : 'opacity-50'
                )}
              />
            )}
          </button>
        </form>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'

export { ChatInput }
