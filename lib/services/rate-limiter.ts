/**
 * Rate Limiter Service for KitchenPal
 * Implements request queuing and exponential backoff for API calls
 * Requirements: 4.2 (rate limit handling with queue and retry)
 */

/**
 * Configuration for rate limiter
 */
export interface RateLimiterConfig {
  /** Maximum requests per time window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum queue size (0 = unlimited) */
  maxQueueSize: number
  /** Base delay for exponential backoff in ms */
  baseDelayMs: number
  /** Maximum delay for exponential backoff in ms */
  maxDelayMs: number
  /** Maximum retry attempts */
  maxRetries: number
}

/**
 * Default rate limiter configuration
 * Conservative defaults for Gemini API (60 requests per minute)
 */
export const DEFAULT_RATE_LIMITER_CONFIG: RateLimiterConfig = {
  maxRequests: 60,
  windowMs: 60000, // 1 minute
  maxQueueSize: 100,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  maxRetries: 3,
}

/**
 * Queued request structure
 */
interface QueuedRequest<T> {
  id: string
  execute: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
  retryCount: number
  createdAt: number
}

/**
 * Rate limiter state
 */
interface RateLimiterState {
  requestTimestamps: number[]
  isProcessingQueue: boolean
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterMs: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

/**
 * Queue full error
 */
export class QueueFullError extends Error {
  constructor(message: string = 'Request queue is full. Please try again later.') {
    super(message)
    this.name = 'QueueFullError'
  }
}


/**
 * Calculate exponential backoff delay
 * @param attempt - Current retry attempt (0-indexed)
 * @param config - Rate limiter configuration
 * @returns Delay in milliseconds with jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  config: Pick<RateLimiterConfig, 'baseDelayMs' | 'maxDelayMs'> = DEFAULT_RATE_LIMITER_CONFIG
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt)
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs)
  // Add jitter (±10%) to prevent thundering herd
  const jitter = cappedDelay * 0.1 * (Math.random() * 2 - 1)
  return Math.floor(cappedDelay + jitter)
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Rate Limiter class for managing API request rates
 * Implements sliding window rate limiting with request queuing
 * Requirements: 4.2 (rate limit handling)
 */
export class RateLimiter {
  private config: RateLimiterConfig
  private state: RateLimiterState
  private queue: QueuedRequest<unknown>[] = []

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_RATE_LIMITER_CONFIG, ...config }
    this.state = {
      requestTimestamps: [],
      isProcessingQueue: false,
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): RateLimiterConfig {
    return { ...this.config }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length
  }

  /**
   * Get number of requests in current window
   */
  getCurrentRequestCount(): number {
    this.cleanupOldTimestamps()
    return this.state.requestTimestamps.length
  }

  /**
   * Check if rate limit is exceeded
   */
  isRateLimited(): boolean {
    this.cleanupOldTimestamps()
    return this.state.requestTimestamps.length >= this.config.maxRequests
  }

  /**
   * Get time until rate limit resets (in ms)
   */
  getTimeUntilReset(): number {
    if (this.state.requestTimestamps.length === 0) {
      return 0
    }
    const oldestTimestamp = this.state.requestTimestamps[0]
    const resetTime = oldestTimestamp + this.config.windowMs
    return Math.max(0, resetTime - Date.now())
  }

  /**
   * Clean up timestamps outside the current window
   */
  private cleanupOldTimestamps(): void {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    this.state.requestTimestamps = this.state.requestTimestamps.filter(
      ts => ts > windowStart
    )
  }

  /**
   * Record a request timestamp
   */
  private recordRequest(): void {
    this.state.requestTimestamps.push(Date.now())
  }


  /**
   * Execute a request with rate limiting
   * If rate limited, queues the request for later execution
   * Requirements: 4.2 (queue request and retry after cooldown)
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we can execute immediately
    if (!this.isRateLimited()) {
      this.recordRequest()
      return fn()
    }

    // Queue the request
    return this.enqueue(fn)
  }

  /**
   * Enqueue a request for later execution
   */
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    // Check queue size limit
    if (this.config.maxQueueSize > 0 && this.queue.length >= this.config.maxQueueSize) {
      return Promise.reject(new QueueFullError())
    }

    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: generateRequestId(),
        execute: fn,
        resolve: resolve as (value: unknown) => void,
        reject,
        retryCount: 0,
        createdAt: Date.now(),
      }

      this.queue.push(request as QueuedRequest<unknown>)

      // Start processing queue if not already running
      if (!this.state.isProcessingQueue) {
        this.processQueue()
      }
    })
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.state.isProcessingQueue) {
      return
    }

    this.state.isProcessingQueue = true

    while (this.queue.length > 0) {
      // Wait until we can make a request
      if (this.isRateLimited()) {
        const waitTime = this.getTimeUntilReset()
        if (waitTime > 0) {
          await sleep(waitTime + 100) // Add small buffer
        }
        continue
      }

      // Get next request from queue
      const request = this.queue.shift()
      if (!request) {
        continue
      }

      // Execute the request
      try {
        this.recordRequest()
        const result = await request.execute()
        request.resolve(result)
      } catch (error) {
        // Check if it's a rate limit error from the API
        const isRateLimitError = this.isApiRateLimitError(error)

        if (isRateLimitError && request.retryCount < this.config.maxRetries) {
          // Re-queue with exponential backoff
          request.retryCount++
          const delay = calculateBackoffDelay(request.retryCount, this.config)
          await sleep(delay)
          this.queue.unshift(request) // Add back to front of queue
        } else {
          // Max retries exceeded or non-retryable error
          request.reject(error instanceof Error ? error : new Error(String(error)))
        }
      }
    }

    this.state.isProcessingQueue = false
  }

  /**
   * Check if an error is a rate limit error from the API
   */
  private isApiRateLimitError(error: unknown): boolean {
    if (error instanceof RateLimitError) {
      return true
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      return (
        message.includes('rate') ||
        message.includes('quota') ||
        message.includes('429') ||
        message.includes('too many requests')
      )
    }

    return false
  }

  /**
   * Clear the request queue
   */
  clearQueue(): void {
    const queuedRequests = [...this.queue]
    this.queue = []

    // Reject all queued requests
    for (const request of queuedRequests) {
      request.reject(new Error('Queue cleared'))
    }
  }

  /**
   * Reset the rate limiter state
   */
  reset(): void {
    this.clearQueue()
    this.state.requestTimestamps = []
    this.state.isProcessingQueue = false
  }
}

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(config?: Partial<RateLimiterConfig>): RateLimiter {
  return new RateLimiter(config)
}

/**
 * Shared rate limiter instances for different services
 */
let geminiRateLimiter: RateLimiter | null = null
let imageRateLimiter: RateLimiter | null = null

/**
 * Get or create the Gemini API rate limiter
 */
export function getGeminiRateLimiter(): RateLimiter {
  if (!geminiRateLimiter) {
    geminiRateLimiter = createRateLimiter({
      maxRequests: 60,
      windowMs: 60000, // 60 requests per minute
    })
  }
  return geminiRateLimiter
}

/**
 * Get or create the Image API rate limiter
 */
export function getImageRateLimiter(): RateLimiter {
  if (!imageRateLimiter) {
    imageRateLimiter = createRateLimiter({
      maxRequests: 10,
      windowMs: 60000, // 10 images per minute (more conservative)
    })
  }
  return imageRateLimiter
}

/**
 * Reset all rate limiters (useful for testing)
 */
export function resetAllRateLimiters(): void {
  geminiRateLimiter?.reset()
  imageRateLimiter?.reset()
  geminiRateLimiter = null
  imageRateLimiter = null
}
