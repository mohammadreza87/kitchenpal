import type { SupabaseClient, AuthMFAEnrollResponse, AuthMFAVerifyResponse } from '@supabase/supabase-js'
import type { Database, SecuritySettings, SecuritySettingsUpdate, UserSession } from '@/types/database'

// Note: Using 'any' casts below because Supabase types may be out of sync with actual schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any>

export interface MFAEnrollmentData {
  id: string
  type: 'totp'
  totp: {
    qr_code: string
    secret: string
    uri: string
  }
}

export interface UserDataExport {
  profile: Record<string, unknown> | null
  preferences: Record<string, unknown> | null
  socialLinks: Record<string, unknown> | null
  notificationSettings: Record<string, unknown> | null
  securitySettings: Record<string, unknown> | null
  feedback: Record<string, unknown>[]
  exportedAt: string
}

export class SecurityService {
  private supabase: AnySupabase

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase as AnySupabase
  }

  // Security Settings
  async getSettings(userId: string): Promise<SecuritySettings | null> {
    const { data, error } = await this.supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return this.createSettings(userId)
      }
      console.error('Error fetching security settings:', error)
      return null
    }

    return data
  }

  async createSettings(userId: string): Promise<SecuritySettings | null> {
    const { data, error } = await this.supabase
      .from('user_security_settings')
      .insert({ user_id: userId })
      .select()
      .single()

    if (error) {
      console.error('Error creating security settings:', error)
      return null
    }

    return data
  }


  async updateSettings(userId: string, updates: SecuritySettingsUpdate): Promise<SecuritySettings | null> {
    const { data, error } = await this.supabase
      .from('user_security_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating security settings:', error)
      throw new Error(error.message)
    }

    return data
  }

  // ==========================================
  // TWO-FACTOR AUTHENTICATION (TOTP MFA)
  // ==========================================

  async getMFAFactors() {
    const { data, error } = await this.supabase.auth.mfa.listFactors()
    if (error) {
      console.error('Error listing MFA factors:', error)
      throw new Error(error.message)
    }
    return data
  }

  async enrollMFA(): Promise<MFAEnrollmentData> {
    const { data, error } = await this.supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'KitchenPal Authenticator',
    }) as AuthMFAEnrollResponse

    if (error) {
      console.error('Error enrolling MFA:', error)
      throw new Error(error.message)
    }

    // Type assertion since we know we're enrolling TOTP
    const totpData = data as { id: string; type: 'totp'; totp: { qr_code: string; secret: string; uri: string } }

    return {
      id: totpData.id,
      type: 'totp',
      totp: {
        qr_code: totpData.totp.qr_code,
        secret: totpData.totp.secret,
        uri: totpData.totp.uri,
      },
    }
  }

  async verifyMFA(factorId: string, code: string): Promise<boolean> {
    const { data: challengeData, error: challengeError } = await this.supabase.auth.mfa.challenge({
      factorId,
    })

    if (challengeError) {
      console.error('Error creating MFA challenge:', challengeError)
      throw new Error(challengeError.message)
    }

    const { error: verifyError } = await this.supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    }) as AuthMFAVerifyResponse

    if (verifyError) {
      console.error('Error verifying MFA:', verifyError)
      throw new Error('Invalid verification code')
    }

    return true
  }

  async unenrollMFA(factorId: string): Promise<boolean> {
    const { error } = await this.supabase.auth.mfa.unenroll({
      factorId,
    })

    if (error) {
      console.error('Error unenrolling MFA:', error)
      throw new Error(error.message)
    }

    return true
  }

  async getAssuranceLevel() {
    const { data, error } = await this.supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error) {
      console.error('Error getting assurance level:', error)
      return null
    }
    return data
  }


  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================

  async getSessions(userId: string): Promise<UserSession[]> {
    const { data, error } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      return []
    }

    return data || []
  }

  async createSession(userId: string, session: Omit<UserSession, 'id' | 'user_id' | 'created_at'>): Promise<UserSession | null> {
    const { data, error } = await this.supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        ...session,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return null
    }

    return data
  }

  async updateSessionLastSeen(sessionId: string): Promise<void> {
    await this.supabase
      .from('user_sessions')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', sessionId)
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      console.error('Error deleting session:', error)
      return false
    }

    return true
  }

  async deleteAllOtherSessions(userId: string, currentSessionId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .neq('id', currentSessionId)

    if (error) {
      console.error('Error deleting other sessions:', error)
      return false
    }

    return true
  }

  // Sign out from Supabase Auth (invalidates refresh token)
  async signOutCurrentSession(): Promise<boolean> {
    const { error } = await this.supabase.auth.signOut({ scope: 'local' })
    if (error) {
      console.error('Error signing out:', error)
      throw new Error(error.message)
    }
    return true
  }

  async signOutAllSessions(): Promise<boolean> {
    const { error } = await this.supabase.auth.signOut({ scope: 'global' })
    if (error) {
      console.error('Error signing out all sessions:', error)
      throw new Error(error.message)
    }
    return true
  }


  // ==========================================
  // PASSWORD MANAGEMENT
  // ==========================================

  async changePassword(newPassword: string): Promise<boolean> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('Error changing password:', error)
      throw new Error(error.message)
    }

    return true
  }

  // ==========================================
  // DATA EXPORT
  // ==========================================

  async exportUserData(userId: string): Promise<UserDataExport> {
    // Fetch all user data from various tables
    const [
      profileResult,
      preferencesResult,
      socialLinksResult,
      notificationResult,
      securityResult,
      feedbackResult,
    ] = await Promise.all([
      this.supabase.from('profiles').select('*').eq('id', userId).single(),
      this.supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
      this.supabase.from('user_social_links').select('*').eq('user_id', userId).single(),
      this.supabase.from('user_notification_settings').select('*').eq('user_id', userId).single(),
      this.supabase.from('user_security_settings').select('*').eq('user_id', userId).single(),
      this.supabase.from('user_feedback').select('*').eq('user_id', userId),
    ])

    const exportData: UserDataExport = {
      profile: profileResult.data,
      preferences: preferencesResult.data,
      socialLinks: socialLinksResult.data,
      notificationSettings: notificationResult.data,
      securitySettings: securityResult.data ? {
        ...securityResult.data,
        // Remove sensitive fields
        id: undefined,
        user_id: undefined,
      } : null,
      feedback: feedbackResult.data || [],
      exportedAt: new Date().toISOString(),
    }

    return exportData
  }

  async downloadDataAsJSON(userId: string): Promise<Blob> {
    const data = await this.exportUserData(userId)
    const jsonString = JSON.stringify(data, null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  }

  // ==========================================
  // DATA DELETION
  // ==========================================

  async requestDataDeletion(userId: string): Promise<string> {
    // Mark account for deletion by updating a flag
    // In production, this would trigger a background job
    const { error } = await this.supabase
      .from('user_security_settings')
      .update({
        deletion_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error requesting deletion:', error)
      throw new Error('Failed to submit deletion request')
    }

    return 'Deletion request submitted. Your account will be deleted within 30 days. You can cancel this by contacting support.'
  }

  async deleteAllUserData(userId: string): Promise<boolean> {
    // Delete in order respecting foreign keys
    const tables = [
      'feedback_attachments',
      'user_feedback',
      'user_sessions',
      'user_security_settings',
      'user_notification_settings',
      'user_preferences',
      'user_social_links',
    ]

    for (const table of tables) {
      const column = table === 'feedback_attachments' ? 'feedback_id' : 'user_id'

      if (table === 'feedback_attachments') {
        // Get feedback IDs first
        const { data: feedbacks } = await this.supabase
          .from('user_feedback')
          .select('id')
          .eq('user_id', userId)

        if (feedbacks && feedbacks.length > 0) {
          const feedbackIds = feedbacks.map((f: { id: string }) => f.id)
          await this.supabase
            .from('feedback_attachments')
            .delete()
            .in('feedback_id', feedbackIds)
        }
      } else {
        await this.supabase
          .from(table)
          .delete()
          .eq(column, userId)
      }
    }

    // Finally delete profile (this may cascade from auth.users)
    await this.supabase.from('profiles').delete().eq('id', userId)

    return true
  }
}

export function createSecurityService(supabase: SupabaseClient<Database>) {
  return new SecurityService(supabase)
}
