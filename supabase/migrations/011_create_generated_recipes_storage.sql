-- Create storage bucket for generated recipe images
-- This bucket stores permanently persisted images from Leonardo.ai

-- Insert the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-recipes',
  'generated-recipes',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Policy: Anyone can view images (public bucket)
CREATE POLICY "Public read access for generated recipe images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-recipes');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload generated recipe images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generated-recipes');

-- Policy: Users can update their own uploaded images
CREATE POLICY "Users can update their own generated recipe images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'generated-recipes' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'generated-recipes');

-- Policy: Users can delete their own uploaded images
CREATE POLICY "Users can delete their own generated recipe images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'generated-recipes' AND auth.uid()::text = (storage.foldername(name))[1]);
