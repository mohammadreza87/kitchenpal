'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/types/chat'

export interface RecipeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  recipe: Recipe | null
  isLoading?: boolean
  error?: string | null
  children?: ReactNode
}

/**
 * RecipeDetailModal Component - Bottom sheet modal for recipe details
 * Implements drag handle and slide-up animation with hero image
 * Requirements: 9.1 - Display recipe detail view as bottom sheet modal
 */
export function RecipeDetailModal({
  isOpen,
  onClose,
  recipe,
  isLoading = false,
  error = null,
  children,
}: RecipeDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startY = useRef(0)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])


  // Handle drag start
  const handleDragStart = (clientY: number) => {
    setIsDragging(true)
    startY.current = clientY
  }

  // Handle drag move
  const handleDragMove = (clientY: number) => {
    if (!isDragging) return
    const delta = clientY - startY.current
    // Only allow dragging down
    if (delta > 0) {
      setDragOffset(delta)
    }
  }

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false)
    // Close if dragged more than 150px
    if (dragOffset > 150) {
      onClose()
    }
    setDragOffset(0)
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={isDragging ? handleMouseUp : undefined}
      onMouseLeave={isDragging ? handleMouseUp : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={recipe ? 'recipe-title' : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full max-w-lg bg-background rounded-t-3xl shadow-xl',
          'max-h-[90vh] overflow-hidden',
          !isDragging && 'transition-transform duration-400 ease-out',
          isOpen ? 'animate-slide-up' : ''
        )}
        style={{
          transform: `translateY(${dragOffset}px)`,
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading recipe...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <Image
              src="/assets/icons/X-Circle.svg"
              alt="Error"
              width={48}
              height={48}
              className="opacity-50"
            />
            <p className="mt-4 text-muted-foreground text-center">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-full"
            >
              Close
            </button>
          </div>
        )}

        {/* Recipe Content */}
        {recipe && !isLoading && !error && (
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 48px)' }}>
            {/* Hero Image */}
            <div className="relative w-full h-48 sm:h-64">
              {recipe.imageUrl ? (
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-brand-primary-container flex items-center justify-center">
                  <Image
                    src="/assets/icons/Fork.svg"
                    alt="Recipe placeholder"
                    width={64}
                    height={64}
                    className="opacity-30"
                  />
                </div>
              )}
            </div>

            {/* Content passed as children */}
            {children}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </div>
  )
}
