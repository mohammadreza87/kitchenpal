import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, UserPreferences, UserPreferencesUpdate } from '@/types/database'

export class PreferencesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no record exists, create one
      if (error.code === 'PGRST116') {
        return this.createPreferences(userId)
      }
      console.error('Error fetching preferences:', error)
      return null
    }

    return data
  }

  async createPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .insert({ user_id: userId })
      .select()
      .single()

    if (error) {
      console.error('Error creating preferences:', error)
      return null
    }

    return data
  }

  async updatePreferences(userId: string, updates: UserPreferencesUpdate): Promise<UserPreferences | null> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating preferences:', error)
      throw new Error(error.message)
    }

    return data
  }

  async addDietaryPreference(userId: string, preference: string): Promise<UserPreferences | null> {
    const current = await this.getPreferences(userId)
    if (!current) return null

    const dietary = [...new Set([...current.dietary, preference])]
    return this.updatePreferences(userId, { dietary })
  }

  async removeDietaryPreference(userId: string, preference: string): Promise<UserPreferences | null> {
    const current = await this.getPreferences(userId)
    if (!current) return null

    const dietary = current.dietary.filter(p => p !== preference)
    return this.updatePreferences(userId, { dietary })
  }

  async addCuisinePreference(userId: string, cuisine: string): Promise<UserPreferences | null> {
    const current = await this.getPreferences(userId)
    if (!current) return null

    const cuisineList = [...new Set([...current.cuisine, cuisine])]
    return this.updatePreferences(userId, { cuisine: cuisineList })
  }

  async removeCuisinePreference(userId: string, cuisine: string): Promise<UserPreferences | null> {
    const current = await this.getPreferences(userId)
    if (!current) return null

    const cuisineList = current.cuisine.filter(c => c !== cuisine)
    return this.updatePreferences(userId, { cuisine: cuisineList })
  }

  async addAllergy(userId: string, allergy: string): Promise<UserPreferences | null> {
    const current = await this.getPreferences(userId)
    if (!current) return null

    const allergies = [...new Set([...current.allergies, allergy])]
    return this.updatePreferences(userId, { allergies })
  }

  async removeAllergy(userId: string, allergy: string): Promise<UserPreferences | null> {
    const current = await this.getPreferences(userId)
    if (!current) return null

    const allergies = current.allergies.filter(a => a !== allergy)
    return this.updatePreferences(userId, { allergies })
  }

  async setCookingSkill(userId: string, skill: string): Promise<UserPreferences | null> {
    return this.updatePreferences(userId, { cooking_skill: skill })
  }
}

export function createPreferencesService(supabase: SupabaseClient<Database>) {
  return new PreferencesService(supabase)
}
