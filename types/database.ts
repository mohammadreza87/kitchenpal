import type { MessageRole, RecipeDifficulty, ChatMessageMetadata } from './chat'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          role: MessageRole
          content: string
          metadata: ChatMessageMetadata
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: MessageRole
          content: string
          metadata?: ChatMessageMetadata
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: MessageRole
          content?: string
          metadata?: ChatMessageMetadata
          created_at?: string
        }
      }
      recipes: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          author_id?: string | null
          author_name?: string | null
          rating?: number
          review_count?: number
          prep_time?: string | null
          difficulty?: RecipeDifficulty | null
          calories?: number | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          author_id?: string | null
          author_name?: string | null
          rating?: number
          review_count?: number
          prep_time?: string | null
          difficulty?: RecipeDifficulty | null
          calories?: number | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          name: string
          quantity: number
          unit: string
          icon_url: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          recipe_id: string
          name: string
          quantity: number
          unit: string
          icon_url?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          recipe_id?: string
          name?: string
          quantity?: number
          unit?: string
          icon_url?: string | null
          sort_order?: number
        }
      }
      recipe_instructions: {
        Row: {
          id: string
          recipe_id: string
          step: number
          text: string
          duration: string | null
        }
        Insert: {
          id?: string
          recipe_id: string
          step: number
          text: string
          duration?: string | null
        }
        Update: {
          id?: string
          recipe_id?: string
          step?: number
          text?: string
          duration?: string | null
        }
      }
      recipe_reviews: {
        Row: {
          id: string
          recipe_id: string
          user_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          location: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_social_links: {
        Row: {
          id: string
          user_id: string
          website: string | null
          instagram: string | null
          youtube: string | null
          tiktok: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          website?: string | null
          instagram?: string | null
          youtube?: string | null
          tiktok?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          website?: string | null
          instagram?: string | null
          youtube?: string | null
          tiktok?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          dietary: string[]
          cuisine: string[]
          allergies: string[]
          cooking_skill: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dietary?: string[]
          cuisine?: string[]
          allergies?: string[]
          cooking_skill?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dietary?: string[]
          cuisine?: string[]
          allergies?: string[]
          cooking_skill?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_notification_settings: {
        Row: {
          id: string
          user_id: string
          push_inspiration: boolean
          push_updates: boolean
          email_inspiration: boolean
          email_updates: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          push_inspiration?: boolean
          push_updates?: boolean
          email_inspiration?: boolean
          email_updates?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          push_inspiration?: boolean
          push_updates?: boolean
          email_inspiration?: boolean
          email_updates?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_security_settings: {
        Row: {
          id: string
          user_id: string
          two_factor_enabled: boolean
          two_factor_method: 'totp' | 'sms' | null
          login_alerts: boolean
          biometric_lock: boolean
          passkey_enabled: boolean
          data_personalization: boolean
          usage_analytics: boolean
          private_mode: boolean
          deletion_requested_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          two_factor_enabled?: boolean
          two_factor_method?: 'totp' | 'sms' | null
          login_alerts?: boolean
          biometric_lock?: boolean
          passkey_enabled?: boolean
          data_personalization?: boolean
          usage_analytics?: boolean
          private_mode?: boolean
          deletion_requested_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          two_factor_enabled?: boolean
          two_factor_method?: 'totp' | 'sms' | null
          login_alerts?: boolean
          biometric_lock?: boolean
          passkey_enabled?: boolean
          data_personalization?: boolean
          usage_analytics?: boolean
          private_mode?: boolean
          deletion_requested_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          device_name: string
          device_type: string | null
          location: string | null
          ip_address: string | null
          last_seen: string
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          device_name: string
          device_type?: string | null
          location?: string | null
          ip_address?: string | null
          last_seen?: string
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_name?: string
          device_type?: string | null
          location?: string | null
          ip_address?: string | null
          last_seen?: string
          is_current?: boolean
          created_at?: string
        }
      }
      user_feedback: {
        Row: {
          id: string
          user_id: string | null
          rating: number | null
          category: 'bug' | 'feature' | 'improvement' | 'other' | null
          message: string
          email: string | null
          status: 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'closed'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          rating?: number | null
          category?: 'bug' | 'feature' | 'improvement' | 'other' | null
          message: string
          email?: string | null
          status?: 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'closed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          rating?: number | null
          category?: 'bug' | 'feature' | 'improvement' | 'other' | null
          message?: string
          email?: string | null
          status?: 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'closed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feedback_attachments: {
        Row: {
          id: string
          feedback_id: string
          file_url: string
          file_name: string
          file_type: string | null
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          file_url: string
          file_name: string
          file_type?: string | null
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          feedback_id?: string
          file_url?: string
          file_name?: string
          file_type?: string | null
          file_size?: number | null
          created_at?: string
        }
      }
      login_alerts: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          device_name: string | null
          device_type: string | null
          ip_address: string | null
          location: string | null
          user_agent: string | null
          alert_sent: boolean
          alert_sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          device_name?: string | null
          device_type?: string | null
          ip_address?: string | null
          location?: string | null
          user_agent?: string | null
          alert_sent?: boolean
          alert_sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          device_name?: string | null
          device_type?: string | null
          ip_address?: string | null
          location?: string | null
          user_agent?: string | null
          alert_sent?: boolean
          alert_sent_at?: string | null
          created_at?: string
        }
      }
      data_export_requests: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          file_url: string | null
          expires_at: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          file_url?: string | null
          expires_at?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          file_url?: string | null
          expires_at?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type SocialLinks = Database['public']['Tables']['user_social_links']['Row']
export type SocialLinksUpdate = Database['public']['Tables']['user_social_links']['Update']

export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']

export type NotificationSettings = Database['public']['Tables']['user_notification_settings']['Row']
export type NotificationSettingsUpdate = Database['public']['Tables']['user_notification_settings']['Update']

export type SecuritySettings = Database['public']['Tables']['user_security_settings']['Row']
export type SecuritySettingsUpdate = Database['public']['Tables']['user_security_settings']['Update']

export type UserSession = Database['public']['Tables']['user_sessions']['Row']

export type UserFeedback = Database['public']['Tables']['user_feedback']['Row']
export type UserFeedbackInsert = Database['public']['Tables']['user_feedback']['Insert']

export type FeedbackAttachment = Database['public']['Tables']['feedback_attachments']['Row']

export type LoginAlert = Database['public']['Tables']['login_alerts']['Row']

export type DataExportRequest = Database['public']['Tables']['data_export_requests']['Row']

// Chat and Recipe types
export type ConversationRow = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']

export type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row']
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']

export type RecipeRow = Database['public']['Tables']['recipes']['Row']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update']

export type RecipeIngredientRow = Database['public']['Tables']['recipe_ingredients']['Row']
export type RecipeIngredientInsert = Database['public']['Tables']['recipe_ingredients']['Insert']

export type RecipeInstructionRow = Database['public']['Tables']['recipe_instructions']['Row']
export type RecipeInstructionInsert = Database['public']['Tables']['recipe_instructions']['Insert']

export type RecipeReviewRow = Database['public']['Tables']['recipe_reviews']['Row']
export type RecipeReviewInsert = Database['public']['Tables']['recipe_reviews']['Insert']
