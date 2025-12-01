/**
 * Cache Service for KitchenPal
 * Implements response caching for recipe suggestions and generated images
 * Requirements: 4.3 (return cached response on network failure)
 */

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  value: T
  timestamp: number
  expiresAt: number
  hits: number
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Default TTL in milliseconds */
  defaultTtlMs: number
  /** Maximum number of entries */
  maxEntries: number
  /** Enable LRU eviction */
  enableLru: boolean
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  defaultTtlMs: 5 * 60 * 1000, // 5 minutes
  maxEntries: 100,
  enableLru: true,
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
}

/**
 * Generic in-memory cache implementation
 * Requirements: 4.3 (caching for network failure fallback)
 */
export class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private config: CacheConfig
  private stats = { hits: 0, misses: 0 }

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
  }


  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Cached value or undefined if not found/expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return undefined
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.stats.misses++
      return undefined
    }

    // Update hit count for LRU
    entry.hits++
    this.stats.hits++

    return entry.value
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlMs - Optional TTL override in milliseconds
   */
  set(key: string, value: T, ttlMs?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.config.maxEntries && !this.cache.has(key)) {
      this.evict()
    }

    const now = Date.now()
    const ttl = ttlMs ?? this.config.defaultTtlMs

    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt: now + ttl,
      hits: 0,
    })
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    }
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Evict entries based on LRU or oldest
   */
  private evict(): void {
    if (this.cache.size === 0) return

    // First, remove expired entries
    const now = Date.now()
    const keysToDelete: string[] = []
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))

    // If still at capacity, use LRU or oldest
    if (this.cache.size >= this.config.maxEntries) {
      if (this.config.enableLru) {
        // Find entry with lowest hit count
        let minHits = Infinity
        let minKey: string | null = null

        this.cache.forEach((entry, key) => {
          if (entry.hits < minHits) {
            minHits = entry.hits
            minKey = key
          }
        })

        if (minKey) {
          this.cache.delete(minKey)
        }
      } else {
        // Remove oldest entry
        const firstKey = this.cache.keys().next().value
        if (firstKey) {
          this.cache.delete(firstKey)
        }
      }
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now()
    let removed = 0

    const keysToDelete: string[] = []
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      this.cache.delete(key)
      removed++
    })

    return removed
  }
}


/**
 * Generate a cache key from ingredients
 * Normalizes and sorts ingredients for consistent keys
 */
export function generateIngredientsCacheKey(ingredients: string[]): string {
  const normalized = ingredients
    .map(i => i.toLowerCase().trim())
    .filter(i => i.length > 0)
    .sort()
    .join(',')
  return `ingredients:${normalized}`
}

/**
 * Generate a cache key for recipe name
 */
export function generateRecipeCacheKey(recipeName: string): string {
  const normalized = recipeName.toLowerCase().trim().replace(/\s+/g, '-')
  return `recipe:${normalized}`
}

/**
 * Generate a cache key for image
 */
export function generateImageCacheKey(recipeName: string, description?: string): string {
  const normalizedName = recipeName.toLowerCase().trim().replace(/\s+/g, '-')
  const normalizedDesc = description
    ? `:${description.toLowerCase().trim().substring(0, 50).replace(/\s+/g, '-')}`
    : ''
  return `image:${normalizedName}${normalizedDesc}`
}

/**
 * Recipe cache entry type
 */
export interface CachedRecipeSuggestion {
  name: string
  description: string
  ingredients: Array<{ name: string; quantity: number; unit: string }>
  instructions: string[]
  prepTime: string
  cookTime: string
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  calories?: number
}

/**
 * Image cache entry type
 */
export interface CachedImage {
  base64Data: string
  mimeType: 'image/png' | 'image/jpeg'
  url?: string
}

/**
 * Recipe suggestions cache
 * Caches recipe suggestions by ingredients
 * Requirements: 4.3 (cache recipe suggestions for similar ingredients)
 */
class RecipeSuggestionsCache {
  private cache: Cache<CachedRecipeSuggestion[]>

  constructor() {
    this.cache = new Cache<CachedRecipeSuggestion[]>({
      defaultTtlMs: 10 * 60 * 1000, // 10 minutes for recipes
      maxEntries: 50,
    })
  }

  /**
   * Get cached recipe suggestions for ingredients
   */
  get(ingredients: string[]): CachedRecipeSuggestion[] | undefined {
    const key = generateIngredientsCacheKey(ingredients)
    return this.cache.get(key)
  }

  /**
   * Cache recipe suggestions for ingredients
   */
  set(ingredients: string[], recipes: CachedRecipeSuggestion[]): void {
    const key = generateIngredientsCacheKey(ingredients)
    this.cache.set(key, recipes)
  }

  /**
   * Check if ingredients have cached suggestions
   */
  has(ingredients: string[]): boolean {
    const key = generateIngredientsCacheKey(ingredients)
    return this.cache.has(key)
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return this.cache.getStats()
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear()
  }
}

/**
 * Image cache
 * Caches generated images by recipe name
 * Requirements: 4.3 (cache generated images by recipe name)
 */
class ImageCache {
  private cache: Cache<CachedImage>

  constructor() {
    this.cache = new Cache<CachedImage>({
      defaultTtlMs: 30 * 60 * 1000, // 30 minutes for images
      maxEntries: 30, // Fewer entries since images are larger
    })
  }

  /**
   * Get cached image for recipe
   */
  get(recipeName: string, description?: string): CachedImage | undefined {
    const key = generateImageCacheKey(recipeName, description)
    return this.cache.get(key)
  }

  /**
   * Cache image for recipe
   */
  set(recipeName: string, image: CachedImage, description?: string): void {
    const key = generateImageCacheKey(recipeName, description)
    this.cache.set(key, image)
  }

  /**
   * Check if recipe has cached image
   */
  has(recipeName: string, description?: string): boolean {
    const key = generateImageCacheKey(recipeName, description)
    return this.cache.has(key)
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return this.cache.getStats()
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear()
  }
}

// Singleton instances
let recipeSuggestionsCache: RecipeSuggestionsCache | null = null
let imageCache: ImageCache | null = null

/**
 * Get or create the recipe suggestions cache
 */
export function getRecipeSuggestionsCache(): RecipeSuggestionsCache {
  if (!recipeSuggestionsCache) {
    recipeSuggestionsCache = new RecipeSuggestionsCache()
  }
  return recipeSuggestionsCache
}

/**
 * Get or create the image cache
 */
export function getImageCache(): ImageCache {
  if (!imageCache) {
    imageCache = new ImageCache()
  }
  return imageCache
}

/**
 * Clear all caches (useful for testing)
 */
export function clearAllCaches(): void {
  recipeSuggestionsCache?.clear()
  imageCache?.clear()
  recipeSuggestionsCache = null
  imageCache = null
}

/**
 * Get combined cache statistics
 */
export function getAllCacheStats(): {
  recipes: CacheStats
  images: CacheStats
} {
  return {
    recipes: getRecipeSuggestionsCache().getStats(),
    images: getImageCache().getStats(),
  }
}
