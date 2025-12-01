import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, UserFeedback, UserFeedbackInsert, FeedbackAttachment } from '@/types/database'

export type FeedbackCategory = 'bug' | 'feature' | 'improvement' | 'other'
export type FeedbackStatus = 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'closed'

export interface SubmitFeedbackData {
  rating?: number | null
  category?: FeedbackCategory | null
  message: string
  email?: string | null
}

export class FeedbackService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async submitFeedback(userId: string | null, data: SubmitFeedbackData): Promise<UserFeedback | null> {
    const { data: feedback, error } = await this.supabase
      .from('user_feedback')
      .insert({
        user_id: userId,
        rating: data.rating,
        category: data.category,
        message: data.message,
        email: data.email,
      })
      .select()
      .single()

    if (error) {
      console.error('Error submitting feedback:', error)
      throw new Error(error.message)
    }

    return feedback
  }

  async getUserFeedback(userId: string): Promise<UserFeedback[]> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user feedback:', error)
      return []
    }

    return data || []
  }

  async getFeedbackById(feedbackId: string): Promise<UserFeedback | null> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .select('*')
      .eq('id', feedbackId)
      .single()

    if (error) {
      console.error('Error fetching feedback:', error)
      return null
    }

    return data
  }

  async updateFeedback(feedbackId: string, updates: Partial<SubmitFeedbackData>): Promise<UserFeedback | null> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .update(updates)
      .eq('id', feedbackId)
      .select()
      .single()

    if (error) {
      console.error('Error updating feedback:', error)
      throw new Error(error.message)
    }

    return data
  }

  async deleteFeedback(feedbackId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_feedback')
      .delete()
      .eq('id', feedbackId)

    if (error) {
      console.error('Error deleting feedback:', error)
      return false
    }

    return true
  }

  // Attachment methods
  async uploadAttachment(feedbackId: string, file: File): Promise<FeedbackAttachment | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${feedbackId}-${Date.now()}.${fileExt}`
    const filePath = `feedback/${fileName}`

    // Upload file to storage
    const { error: uploadError } = await this.supabase.storage
      .from('feedback')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading attachment:', uploadError)
      throw new Error(uploadError.message)
    }

    // Get public URL
    const { data: { publicUrl } } = this.supabase.storage
      .from('feedback')
      .getPublicUrl(filePath)

    // Create attachment record
    const { data, error } = await this.supabase
      .from('feedback_attachments')
      .insert({
        feedback_id: feedbackId,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating attachment record:', error)
      throw new Error(error.message)
    }

    return data
  }

  async getAttachments(feedbackId: string): Promise<FeedbackAttachment[]> {
    const { data, error } = await this.supabase
      .from('feedback_attachments')
      .select('*')
      .eq('feedback_id', feedbackId)

    if (error) {
      console.error('Error fetching attachments:', error)
      return []
    }

    return data || []
  }

  async deleteAttachment(attachmentId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('feedback_attachments')
      .delete()
      .eq('id', attachmentId)

    if (error) {
      console.error('Error deleting attachment:', error)
      return false
    }

    return true
  }
}

export function createFeedbackService(supabase: SupabaseClient<Database>) {
  return new FeedbackService(supabase)
}
