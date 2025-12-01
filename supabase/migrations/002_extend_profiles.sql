-- Extend profiles table with additional fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS bio text;

-- Create user_social_links table
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

-- Create user_preferences table
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

-- Create user_notification_settings table
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

-- Create user_security_settings table
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  two_factor_enabled boolean DEFAULT false,
  login_alerts boolean DEFAULT true,
  biometric_lock boolean DEFAULT false,
  data_personalization boolean DEFAULT true,
  usage_analytics boolean DEFAULT true,
  private_mode boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_sessions table for device management
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

-- Enable RLS on all new tables
ALTER TABLE public.user_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_social_links
CREATE POLICY "Users can view their own social links"
  ON public.user_social_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social links"
  ON public.user_social_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social links"
  ON public.user_social_links FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_notification_settings
CREATE POLICY "Users can view their own notification settings"
  ON public.user_notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON public.user_notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON public.user_notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_security_settings
CREATE POLICY "Users can view their own security settings"
  ON public.user_security_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
  ON public.user_security_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
  ON public.user_security_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_sessions
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

-- Function to initialize user settings on profile creation
CREATE OR REPLACE FUNCTION public.initialize_user_settings()
RETURNS trigger AS $$
BEGIN
  -- Create social links record
  INSERT INTO public.user_social_links (user_id) VALUES (NEW.id);
  -- Create preferences record
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);
  -- Create notification settings record
  INSERT INTO public.user_notification_settings (user_id) VALUES (NEW.id);
  -- Create security settings record
  INSERT INTO public.user_security_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize settings when profile is created
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.initialize_user_settings();

-- Create storage bucket for avatars (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
