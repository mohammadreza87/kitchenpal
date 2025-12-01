-- Allow public uploads to the generated/ folder in generated-recipes bucket
-- This is needed for server-side API routes that don't have user auth context

-- Drop the old authenticated-only insert policy if it exists
DROP POLICY IF EXISTS "Authenticated users can upload generated recipe images" ON storage.objects;

-- Create new policy that allows anyone to upload to the generated/ folder
CREATE POLICY "Public can upload to generated folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated-recipes'
  AND (storage.foldername(name))[1] = 'generated'
);

-- Also allow updates to the generated folder
DROP POLICY IF EXISTS "Users can update their own generated recipe images" ON storage.objects;

CREATE POLICY "Public can update generated folder images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'generated-recipes'
  AND (storage.foldername(name))[1] = 'generated'
)
WITH CHECK (
  bucket_id = 'generated-recipes'
  AND (storage.foldername(name))[1] = 'generated'
);
