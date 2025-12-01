-- Migration: Add is_favorite column to user_generated_recipes
-- This allows users to mark generated recipes as favorites without a separate table

-- Add is_favorite column with default false
ALTER TABLE public.user_generated_recipes
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_generated_recipes_is_favorite
ON public.user_generated_recipes(user_id, is_favorite)
WHERE is_favorite = TRUE;
