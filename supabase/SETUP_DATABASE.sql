-- =====================================================
-- KITCHENPAL DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  location text,
  bio text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- 2. CREATE USER_SOCIAL_LINKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_social_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  website text,
  instagram text,
  youtube text,
  tiktok text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own social links" ON public.user_social_links;
DROP POLICY IF EXISTS "Users can insert their own social links" ON public.user_social_links;
DROP POLICY IF EXISTS "Users can update their own social links" ON public.user_social_links;

CREATE POLICY "Users can view their own social links"
  ON public.user_social_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social links"
  ON public.user_social_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social links"
  ON public.user_social_links FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE USER_PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  dietary text[] DEFAULT '{}',
  cuisine text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  cooking_skill text DEFAULT 'Beginner',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);


-- =====================================================
-- 4. CREATE USER_NOTIFICATION_SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  push_inspiration boolean DEFAULT true,
  push_updates boolean DEFAULT false,
  email_inspiration boolean DEFAULT false,
  email_updates boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notification settings" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can insert their own notification settings" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can update their own notification settings" ON public.user_notification_settings;

CREATE POLICY "Users can view their own notification settings"
  ON public.user_notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON public.user_notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON public.user_notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. CREATE USER_SECURITY_SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  two_factor_enabled boolean DEFAULT false,
  two_factor_method text CHECK (two_factor_method IN ('totp', 'sms')),
  login_alerts boolean DEFAULT true,
  biometric_lock boolean DEFAULT false,
  passkey_enabled boolean DEFAULT false,
  data_personalization boolean DEFAULT true,
  usage_analytics boolean DEFAULT true,
  private_mode boolean DEFAULT false,
  deletion_requested_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_security_deletion_requested 
ON public.user_security_settings(deletion_requested_at) 
WHERE deletion_requested_at IS NOT NULL;

ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own security settings" ON public.user_security_settings;
DROP POLICY IF EXISTS "Users can insert their own security settings" ON public.user_security_settings;
DROP POLICY IF EXISTS "Users can update their own security settings" ON public.user_security_settings;

CREATE POLICY "Users can view their own security settings"
  ON public.user_security_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
  ON public.user_security_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
  ON public.user_security_settings FOR UPDATE
  USING (auth.uid() = user_id);


-- =====================================================
-- 6. CREATE USER_SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  device_name text NOT NULL,
  device_type text,
  location text,
  ip_address text,
  last_seen timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. CREATE USER_FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  category text CHECK (category IN ('bug', 'feature', 'improvement', 'other')),
  message text NOT NULL,
  email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'in_progress', 'resolved', 'closed')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can insert feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can update their own pending feedback" ON public.user_feedback;

CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own pending feedback"
  ON public.user_feedback FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');


-- =====================================================
-- 8. FUNCTION TO INITIALIZE USER SETTINGS
-- =====================================================
CREATE OR REPLACE FUNCTION public.initialize_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_social_links (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_notification_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_security_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.initialize_user_settings();

-- =====================================================
-- 9. CREATE PROFILE FOR EXISTING USER (if needed)
-- =====================================================
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. LOGIN ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.login_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid,
  device_name text,
  device_type text,
  ip_address inet,
  location text,
  user_agent text,
  alert_sent boolean DEFAULT false,
  alert_sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.login_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own login alerts" ON public.login_alerts;
DROP POLICY IF EXISTS "System can insert login alerts" ON public.login_alerts;

CREATE POLICY "Users can view their own login alerts"
  ON public.login_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert login alerts"
  ON public.login_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- 11. DATA EXPORT REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at timestamp with time zone
);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own export requests" ON public.data_export_requests;
DROP POLICY IF EXISTS "Users can create export requests" ON public.data_export_requests;

CREATE POLICY "Users can view their own export requests"
  ON public.data_export_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests"
  ON public.data_export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 12. FUNCTION TO LOG LOGIN ALERTS
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_login_alert()
RETURNS trigger AS $$
DECLARE
  alerts_enabled boolean;
BEGIN
  SELECT login_alerts INTO alerts_enabled
  FROM public.user_security_settings
  WHERE user_id = NEW.user_id;
  
  IF alerts_enabled = TRUE THEN
    INSERT INTO public.login_alerts (user_id, device_name, ip_address, location)
    VALUES (NEW.user_id, NEW.device_name, NEW.ip_address::inet, NEW.location);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_session_alert ON public.user_sessions;
CREATE TRIGGER on_new_session_alert
  AFTER INSERT ON public.user_sessions
  FOR EACH ROW EXECUTE PROCEDURE public.log_login_alert();

-- =====================================================
-- 13. STORAGE BUCKET FOR AVATARS
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

-- =====================================================
-- DONE! Your database is now set up.
-- =====================================================
