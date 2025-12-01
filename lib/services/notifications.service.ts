import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, NotificationSettings, NotificationSettingsUpdate } from '@/types/database'

// Note: Using 'any' casts below because Supabase types may be out of sync with actual schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any>

export class NotificationsService {
  private supabase: AnySupabase

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase as AnySupabase
  }

  async getSettings(userId: string): Promise<NotificationSettings | null> {
    const { data, error } = await this.supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no record exists, create one
      if (error.code === 'PGRST116') {
        return this.createSettings(userId)
      }
      console.error('Error fetching notification settings:', error)
      return null
    }

    return data
  }

  async createSettings(userId: string): Promise<NotificationSettings | null> {
    const { data, error } = await this.supabase
      .from('user_notification_settings')
      .insert({ user_id: userId })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification settings:', error)
      return null
    }

    return data
  }

  async updateSettings(userId: string, updates: NotificationSettingsUpdate): Promise<NotificationSettings | null> {
    const { data, error } = await this.supabase
      .from('user_notification_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating notification settings:', error)
      throw new Error(error.message)
    }

    return data
  }

  async unsubscribeAll(userId: string): Promise<NotificationSettings | null> {
    return this.updateSettings(userId, {
      push_inspiration: false,
      push_updates: false,
      email_inspiration: false,
      email_updates: false,
    })
  }

  async togglePushInspiration(userId: string, enabled: boolean): Promise<NotificationSettings | null> {
    return this.updateSettings(userId, { push_inspiration: enabled })
  }

  async togglePushUpdates(userId: string, enabled: boolean): Promise<NotificationSettings | null> {
    return this.updateSettings(userId, { push_updates: enabled })
  }

  async toggleEmailInspiration(userId: string, enabled: boolean): Promise<NotificationSettings | null> {
    return this.updateSettings(userId, { email_inspiration: enabled })
  }

  async toggleEmailUpdates(userId: string, enabled: boolean): Promise<NotificationSettings | null> {
    return this.updateSettings(userId, { email_updates: enabled })
  }
}

export function createNotificationsService(supabase: SupabaseClient<Database>) {
  return new NotificationsService(supabase)
}
