-- Migration: Create user favorites table for saving recipes
-- This enables users to save/bookmark their favorite recipes

-- ============================================
-- USER SAVED RECIPES TABLE (Junction Table)
-- ============================================
CREATE TABLE public.user_saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure a user can only save a recipe once
  UNIQUE(user_id, recipe_id)
);

-- Indexes for faster lookups
CREATE INDEX idx_user_saved_recipes_user_id ON public.user_saved_recipes(user_id);
CREATE INDEX idx_user_saved_recipes_recipe_id ON public.user_saved_recipes(recipe_id);
CREATE INDEX idx_user_saved_recipes_created_at ON public.user_saved_recipes(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.user_saved_recipes ENABLE ROW LEVEL SECURITY;

-- Users can only view their own saved recipes
CREATE POLICY "Users can view own saved recipes" ON public.user_saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can save recipes (insert)
CREATE POLICY "Users can save recipes" ON public.user_saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unsave recipes (delete)
CREATE POLICY "Users can unsave recipes" ON public.user_saved_recipes
  FOR DELETE USING (auth.uid() = user_id);
