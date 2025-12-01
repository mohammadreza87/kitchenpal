/**
 * Chat and Recipe Types for AI Chat Feature
 * Requirements: 1.1 (message sending), 3.1 (recipe display), 9.1 (recipe detail)
 */

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system'

export interface QuickReply {
  id: string
  label: string
  value: string
}

export interface RecipeOption {
  id: string
  name: string
  selected?: boolean
}

export interface RecipeCard {
  id: string
  name: string
  ingredients: string
  prepTime: string
  servings: number
}

export type MessageStatus = 'sending' | 'sent' | 'failed'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  quickReplies?: QuickReply[]
  recipeOptions?: RecipeOption[]
  recipeCard?: RecipeCard
  status?: MessageStatus
  errorMessage?: string
}

export interface Conversation {
  id: string
  userId: string
  title: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// RECIPE TYPES
// ============================================

export type RecipeDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  iconUrl?: string
  sortOrder?: number
}

export interface Instruction {
  id?: string
  step: number
  text: string
  duration?: string
}

export interface Review {
  id: string
  recipeId?: string
  userId: string
  userName: string
  userAvatar: string
  date: string
  rating: number
  comment: string
}


export interface Recipe {
  id: string
  name: string
  author: string
  authorId?: string
  rating: number
  reviewCount: number
  prepTime: string
  difficulty: RecipeDifficulty
  calories: number
  description: string
  imageUrl: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  reviews: Review[]
  createdAt?: Date
  updatedAt?: Date
}

// ============================================
// DATABASE ROW TYPES (matching Supabase schema)
// ============================================

export interface ConversationRow {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessageRow {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  metadata: ChatMessageMetadata
  created_at: string
}

export interface ChatMessageMetadata {
  quickReplies?: QuickReply[]
  recipeOptions?: RecipeOption[]
  recipeCard?: RecipeCard
}

export interface RecipeRow {
  id: string
  name: string
  author_id: string | null
  author_name: string | null
  rating: number
  review_count: number
  prep_time: string | null
  difficulty: RecipeDifficulty | null
  calories: number | null
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface RecipeIngredientRow {
  id: string
  recipe_id: string
  name: string
  quantity: number
  unit: string
  icon_url: string | null
  sort_order: number
}

export interface RecipeInstructionRow {
  id: string
  recipe_id: string
  step: number
  text: string
  duration: string | null
}

export interface RecipeReviewRow {
  id: string
  recipe_id: string
  user_id: string | null
  rating: number
  comment: string | null
  created_at: string
}

// ============================================
// INSERT/UPDATE TYPES
// ============================================

export interface ConversationInsert {
  user_id: string
  title?: string | null
}

export interface ConversationUpdate {
  title?: string | null
  updated_at?: string
}

export interface ChatMessageInsert {
  conversation_id: string
  role: MessageRole
  content: string
  metadata?: ChatMessageMetadata
}

export interface RecipeInsert {
  name: string
  author_id?: string | null
  author_name?: string | null
  prep_time?: string | null
  difficulty?: RecipeDifficulty | null
  calories?: number | null
  description?: string | null
  image_url?: string | null
}

export interface RecipeUpdate {
  name?: string
  author_name?: string | null
  prep_time?: string | null
  difficulty?: RecipeDifficulty | null
  calories?: number | null
  description?: string | null
  image_url?: string | null
}

export interface RecipeIngredientInsert {
  recipe_id: string
  name: string
  quantity: number
  unit: string
  icon_url?: string | null
  sort_order?: number
}

export interface RecipeInstructionInsert {
  recipe_id: string
  step: number
  text: string
  duration?: string | null
}

export interface RecipeReviewInsert {
  recipe_id: string
  user_id?: string | null
  rating: number
  comment?: string | null
}

// ============================================
// UTILITY TYPES
// ============================================

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  conversationId: string | null
  lastFailedMessage?: string
}

export interface RecipeDetailState {
  recipe: Recipe | null
  isLoading: boolean
  error: string | null
  activeTab: 'ingredients' | 'instructions' | 'reviews'
  portions: number
  originalPortions: number
}

// ============================================
// TRANSFORMATION HELPERS
// ============================================

/**
 * Convert database row to ChatMessage
 */
export function chatMessageFromRow(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: new Date(row.created_at),
    quickReplies: row.metadata?.quickReplies,
    recipeOptions: row.metadata?.recipeOptions,
    recipeCard: row.metadata?.recipeCard,
  }
}

/**
 * Convert database row to Conversation
 */
export function conversationFromRow(row: ConversationRow): Conversation {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/**
 * Convert database rows to Recipe with related data
 */
export function recipeFromRows(
  recipeRow: RecipeRow,
  ingredients: RecipeIngredientRow[],
  instructions: RecipeInstructionRow[],
  reviews: (RecipeReviewRow & { user_name?: string; user_avatar?: string })[]
): Recipe {
  return {
    id: recipeRow.id,
    name: recipeRow.name,
    author: recipeRow.author_name || 'Unknown',
    authorId: recipeRow.author_id || undefined,
    rating: recipeRow.rating,
    reviewCount: recipeRow.review_count,
    prepTime: recipeRow.prep_time || '',
    difficulty: recipeRow.difficulty || 'Medium',
    calories: recipeRow.calories || 0,
    description: recipeRow.description || '',
    imageUrl: recipeRow.image_url || '',
    ingredients: ingredients
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((ing) => ({
        id: ing.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        iconUrl: ing.icon_url || undefined,
        sortOrder: ing.sort_order,
      })),
    instructions: instructions
      .sort((a, b) => a.step - b.step)
      .map((inst) => ({
        id: inst.id,
        step: inst.step,
        text: inst.text,
        duration: inst.duration || undefined,
      })),
    reviews: reviews.map((rev) => ({
      id: rev.id,
      userId: rev.user_id || '',
      userName: rev.user_name || 'Anonymous',
      userAvatar: rev.user_avatar || '',
      date: rev.created_at,
      rating: rev.rating,
      comment: rev.comment || '',
    })),
    createdAt: new Date(recipeRow.created_at),
    updatedAt: new Date(recipeRow.updated_at),
  }
}

/**
 * Scale ingredient quantity based on portion adjustment
 */
export function scaleIngredientQuantity(
  originalQuantity: number,
  originalPortions: number,
  newPortions: number
): number {
  if (originalPortions <= 0) return originalQuantity
  return (originalQuantity * newPortions) / originalPortions
}
