-- Migration: Make generated recipes publicly viewable
-- All authenticated users can view all recipes, but can only modify their own

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own generated recipes" ON public.user_generated_recipes;

-- Create new policy: All authenticated users can view all recipes
CREATE POLICY "Anyone can view all generated recipes" ON public.user_generated_recipes
  FOR SELECT USING (true);

-- Keep existing INSERT policy (users can only insert their own)
-- "Users can insert own generated recipes" already exists

-- Keep existing UPDATE policy (users can only update their own)
-- "Users can update own generated recipes" already exists

-- Keep existing DELETE policy (users can only delete their own)
-- "Users can delete own generated recipes" already exists

-- Add is_public column for future use (optional - if users want to hide some recipes)
ALTER TABLE public.user_generated_recipes
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE NOT NULL;

-- Create index for public recipes
CREATE INDEX IF NOT EXISTS idx_user_generated_recipes_public
ON public.user_generated_recipes(is_public, created_at DESC)
WHERE is_public = TRUE;
