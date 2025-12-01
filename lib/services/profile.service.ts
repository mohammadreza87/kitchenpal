import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Profile, ProfileUpdate, SocialLinks, SocialLinksUpdate } from '@/types/database'

export class ProfileService {
  constructor(private supabase: SupabaseClient<Database>) { }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      throw new Error(error.message)
    }

    return data
  }

  async getSocialLinks(userId: string): Promise<SocialLinks | null> {
    const { data, error } = await this.supabase
      .from('user_social_links')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no record exists, create one
      if (error.code === 'PGRST116') {
        return this.createSocialLinks(userId)
      }
      console.error('Error fetching social links:', error)
      return null
    }

    return data
  }

  async createSocialLinks(userId: string): Promise<SocialLinks | null> {
    const { data, error } = await this.supabase
      .from('user_social_links')
      .insert({ user_id: userId })
      .select()
      .single()

    if (error) {
      console.error('Error creating social links:', error)
      return null
    }

    return data
  }

  async updateSocialLinks(userId: string, updates: SocialLinksUpdate): Promise<SocialLinks | null> {
    const { data, error } = await this.supabase
      .from('user_social_links')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating social links:', error)
      throw new Error(error.message)
    }

    return data
  }

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      throw new Error(uploadError.message)
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update profile with new avatar URL
    await this.updateProfile(userId, { avatar_url: publicUrl })

    return publicUrl
  }

  async deleteAccount(userId: string): Promise<boolean> {
    // Delete user from auth (this will cascade to profiles due to FK)
    const { error } = await this.supabase.auth.admin.deleteUser(userId)

    if (error) {
      // If admin API not available, try RPC or mark for deletion
      console.error('Error deleting account:', error)
      throw new Error('Unable to delete account. Please contact support.')
    }

    return true
  }
}

// Factory function for creating service instance
export function createProfileService(supabase: SupabaseClient<Database>) {
  return new ProfileService(supabase)
}
