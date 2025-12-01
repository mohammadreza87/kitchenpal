-- Create feedback table
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_category ON public.user_feedback(category);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON public.user_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert feedback (even anonymous)
CREATE POLICY "Users can insert feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own pending feedback
CREATE POLICY "Users can update their own pending feedback"
  ON public.user_feedback FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Create feedback_attachments table for screenshots/files
CREATE TABLE IF NOT EXISTS public.feedback_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id uuid REFERENCES public.user_feedback(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on attachments
ALTER TABLE public.feedback_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments for their feedback
CREATE POLICY "Users can view their feedback attachments"
  ON public.feedback_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_feedback 
      WHERE id = feedback_id AND user_id = auth.uid()
    )
  );

-- Users can insert attachments for their feedback
CREATE POLICY "Users can insert feedback attachments"
  ON public.feedback_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_feedback 
      WHERE id = feedback_id AND user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_feedback_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_feedback_updated_at ON public.user_feedback;
CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW EXECUTE PROCEDURE public.update_feedback_updated_at();
