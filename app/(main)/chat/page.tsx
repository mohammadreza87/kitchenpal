'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FreeformChat, RecipeFormTab, ImageRecipeTab } from '@/components/chat'
import { useUser } from '@/hooks/useUser'

type TabType = 'chat' | 'form' | 'image'

const TABS = [
  { id: 'chat' as TabType, label: 'Chat' },
  { id: 'form' as TabType, label: 'Create' },
  { id: 'image' as TabType, label: 'Photo' },
]

/**
 * ChatPage Component
 * Chat interface for AI-powered recipe discovery with multiple tabs
 */
export default function ChatPage() {
  const router = useRouter()
  const { user, loading } = useUser()
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [previousTab, setPreviousTab] = useState<TabType>('chat')
  const [isAnimating, setIsAnimating] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const tabContainerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [indicatorReady, setIndicatorReady] = useState(false)

  // Update indicator when active tab changes, on resize, or after loading
  useEffect(() => {
    // Don't run while loading
    if (loading) return

    const updateIndicator = () => {
      const container = tabContainerRef.current
      const activeButton = container?.querySelector(`[data-tab="${activeTab}"]`) as HTMLButtonElement
      if (container && activeButton) {
        const containerRect = container.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
        })
        if (!indicatorReady) {
          setIndicatorReady(true)
        }
      }
    }

    // Update with delays to ensure DOM is ready
    const timer1 = setTimeout(updateIndicator, 0)
    const timer2 = setTimeout(updateIndicator, 100)

    window.addEventListener('resize', updateIndicator)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [activeTab, loading, indicatorReady])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/chat')
    }
  }, [loading, user, router])

  // Handle tab change with animation
  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab || isAnimating) return
    setPreviousTab(activeTab)
    setIsAnimating(true)
    setActiveTab(newTab)

    // Reset scroll and animation state
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
      setIsAnimating(false)
    }, 300)
  }

  // Get animation direction
  const getAnimationDirection = () => {
    const tabOrder = ['chat', 'form', 'image']
    const currentIndex = tabOrder.indexOf(activeTab)
    const previousIndex = tabOrder.indexOf(previousTab)
    return currentIndex > previousIndex ? 'left' : 'right'
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-primary/30" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-brand-primary/50" />
            <div className="absolute inset-4 rounded-full bg-brand-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Centered container with max-width for desktop */}
      <div className="w-full max-w-[768px] mx-auto flex flex-col min-h-screen">
        {/* Tab Navigation - fixed at top */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background">
          <div className="w-full max-w-[768px] mx-auto px-6 pt-6 pb-0">
            <div ref={tabContainerRef} className="relative flex justify-center gap-10">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'relative whitespace-nowrap pb-3 text-base font-medium transition-colors duration-200',
                    activeTab === tab.id
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
              {/* Animated indicator */}
              <div
                className={cn(
                  "absolute bottom-0 h-0.5 bg-brand-primary rounded-full",
                  indicatorReady ? "transition-all duration-300 ease-out" : ""
                )}
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                  opacity: indicatorStyle.width > 0 ? 1 : 0,
                }}
              />
            </div>
            {/* Full width bottom line */}
            <div className="h-px bg-gray-200 -mt-px" />
          </div>
        </div>

        {/* Tab Content - with top padding to account for fixed header */}
        <div
          ref={contentRef}
          className="flex flex-1 flex-col pt-[60px] pb-4 overflow-y-auto"
        >
          <div
            className={cn(
              'flex-1 transition-all duration-300 ease-out',
              isAnimating && getAnimationDirection() === 'left' && 'animate-slide-in-right',
              isAnimating && getAnimationDirection() === 'right' && 'animate-slide-in-left'
            )}
          >
            {activeTab === 'chat' && <FreeformChat />}
            {activeTab === 'form' && <RecipeFormTab />}
            {activeTab === 'image' && <ImageRecipeTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
