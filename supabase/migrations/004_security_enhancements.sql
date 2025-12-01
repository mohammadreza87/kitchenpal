-- Migration: Security Enhancements
-- Adds new fields for MFA tracking and account deletion

-- Add new columns to user_security_settings
ALTER TABLE user_security_settings 
ADD COLUMN IF NOT EXISTS two_factor_method TEXT CHECK (two_factor_method IN ('totp', 'sms')),
ADD COLUMN IF NOT EXISTS passkey_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

-- Create index for deletion requests (for cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_security_deletion_requested 
ON user_security_settings(deletion_requested_at) 
WHERE deletion_requested_at IS NOT NULL;

-- Create login_alerts table for tracking login notifications
CREATE TABLE IF NOT EXISTS login_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  device_name TEXT,
  device_type TEXT,
  ip_address INET,
  location TEXT,
  user_agent TEXT,
  alert_sent BOOLEAN DEFAULT FALSE,
  alert_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on login_alerts
ALTER TABLE login_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for login_alerts
CREATE POLICY "Users can view their own login alerts"
  ON login_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert login alerts"
  ON login_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create data_export_requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on data_export_requests
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for data_export_requests
CREATE POLICY "Users can view their own export requests"
  ON data_export_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests"
  ON data_export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to log login alerts when login_alerts is enabled
CREATE OR REPLACE FUNCTION log_login_alert()
RETURNS TRIGGER AS $$
DECLARE
  alerts_enabled BOOLEAN;
BEGIN
  -- Check if user has login alerts enabled
  SELECT login_alerts INTO alerts_enabled
  FROM user_security_settings
  WHERE user_id = NEW.user_id;
  
  -- If alerts are enabled, create an alert record
  IF alerts_enabled = TRUE THEN
    INSERT INTO login_alerts (user_id, device_name, ip_address, location)
    VALUES (NEW.user_id, NEW.device_name, NEW.ip_address::inet, NEW.location);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log login alerts on new session
DROP TRIGGER IF EXISTS on_new_session_alert ON user_sessions;
CREATE TRIGGER on_new_session_alert
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_login_alert();

-- Grant necessary permissions
GRANT SELECT, INSERT ON login_alerts TO authenticated;
GRANT SELECT, INSERT ON data_export_requests TO authenticated;
