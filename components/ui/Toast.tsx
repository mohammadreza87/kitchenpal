'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'loading'
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], duration?: number) => string
  hideToast: (id: string) => void
  updateToast: (id: string, message: string, type: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  // Set mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const showToast = useCallback((message: string, type: Toast['type'] = 'success', duration = 3000): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    setToasts(prev => [...prev, { id, message, type, duration }])

    // Auto-hide non-loading toasts
    if (type !== 'loading' && duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }

    return id
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const updateToast = useCallback((id: string, message: string, type: Toast['type']) => {
    setToasts(prev => prev.map(t =>
      t.id === id ? { ...t, message, type } : t
    ))

    // Auto-hide after update if not loading
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3000)
    }
  }, [])

  // Listen for image regeneration events
  useEffect(() => {
    const handleImageRegenerated = (event: CustomEvent<{ id: string; title: string; success: boolean }>) => {
      const { title, success } = event.detail
      if (success) {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setToasts(prev => [...prev, {
          id,
          message: `Image generated for "${title}"`,
          type: 'success',
          duration: 3000
        }])
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
      } else {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setToasts(prev => [...prev, {
          id,
          message: `Failed to generate image for "${title}"`,
          type: 'error',
          duration: 4000
        }])
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
      }
    }

    window.addEventListener('image-regenerated', handleImageRegenerated as EventListener)
    return () => {
      window.removeEventListener('image-regenerated', handleImageRegenerated as EventListener)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast, updateToast }}>
      {children}
      {mounted && typeof window !== 'undefined' && createPortal(
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-lg border border-gray-100"
              style={{ minWidth: '200px', maxWidth: '320px' }}
            >
              {toast.type === 'loading' && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              )}
              {toast.type === 'success' && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {toast.type === 'error' && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 flex-1">{toast.message}</span>
              <button
                onClick={() => hideToast(toast.id)}
                className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
