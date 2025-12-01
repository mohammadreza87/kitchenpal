-- Migration: Create reviews table for user generated recipes
-- This allows users to review each other's generated recipes

-- ============================================
-- GENERATED RECIPE REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.generated_recipe_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.user_generated_recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_generated_recipe_reviews_recipe_id
ON public.generated_recipe_reviews(recipe_id);

CREATE INDEX IF NOT EXISTS idx_generated_recipe_reviews_user_id
ON public.generated_recipe_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_generated_recipe_reviews_created_at
ON public.generated_recipe_reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.generated_recipe_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Anyone can read all reviews (public)
CREATE POLICY "Anyone can view all generated recipe reviews"
ON public.generated_recipe_reviews
FOR SELECT USING (true);

-- Authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews"
ON public.generated_recipe_reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.generated_recipe_reviews
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.generated_recipe_reviews
FOR DELETE USING (auth.uid() = user_id);

-- Unique constraint: one review per user per recipe
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_recipe_review
ON public.generated_recipe_reviews(recipe_id, user_id);
