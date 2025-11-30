'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mb-4 text-6xl">😕</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mb-6 max-w-md text-muted-foreground">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-brand-primary px-6 py-3 font-medium text-white transition-colors hover:bg-brand-primary-dark"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
          >
            Go home
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error details (dev only)
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
