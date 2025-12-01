-- Migration: Create chat and recipe tables for AI Chat feature
-- Requirements: 6.2 (message persistence), 4.1 (user preferences integration)

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster user conversation lookups
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster message retrieval by conversation
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- ============================================
-- RECIPES TABLE
-- ============================================
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  prep_time TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  calories INTEGER,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for recipe searches
CREATE INDEX idx_recipes_name ON public.recipes(name);
CREATE INDEX idx_recipes_author_id ON public.recipes(author_id);
CREATE INDEX idx_recipes_rating ON public.recipes(rating DESC);


-- ============================================
-- RECIPE INGREDIENTS TABLE
-- ============================================
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Index for ingredient lookups
CREATE INDEX idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_name ON public.recipe_ingredients(name);

-- ============================================
-- RECIPE INSTRUCTIONS TABLE
-- ============================================
CREATE TABLE public.recipe_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  step INTEGER NOT NULL,
  text TEXT NOT NULL,
  duration TEXT
);

-- Index for instruction lookups
CREATE INDEX idx_recipe_instructions_recipe_id ON public.recipe_instructions(recipe_id);

-- ============================================
-- RECIPE REVIEWS TABLE
-- ============================================
CREATE TABLE public.recipe_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for review lookups
CREATE INDEX idx_recipe_reviews_recipe_id ON public.recipe_reviews(recipe_id);
CREATE INDEX idx_recipe_reviews_user_id ON public.recipe_reviews(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_reviews ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only access their own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages: Users can only access messages in their conversations
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (
    conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in own conversations" ON public.chat_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
  );

-- Recipes: Publicly readable, only authors can modify
CREATE POLICY "Recipes are publicly readable" ON public.recipes
  FOR SELECT USING (true);

CREATE POLICY "Authors can insert recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = author_id);

-- Recipe Ingredients: Publicly readable
CREATE POLICY "Recipe ingredients are publicly readable" ON public.recipe_ingredients
  FOR SELECT USING (true);

CREATE POLICY "Authors can manage recipe ingredients" ON public.recipe_ingredients
  FOR ALL USING (
    recipe_id IN (SELECT id FROM public.recipes WHERE author_id = auth.uid())
  );

-- Recipe Instructions: Publicly readable
CREATE POLICY "Recipe instructions are publicly readable" ON public.recipe_instructions
  FOR SELECT USING (true);

CREATE POLICY "Authors can manage recipe instructions" ON public.recipe_instructions
  FOR ALL USING (
    recipe_id IN (SELECT id FROM public.recipes WHERE author_id = auth.uid())
  );

-- Recipe Reviews: Publicly readable, users can manage their own
CREATE POLICY "Recipe reviews are publicly readable" ON public.recipe_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON public.recipe_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.recipe_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.recipe_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for recipes
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTION TO UPDATE RECIPE RATING
-- ============================================

-- Function to recalculate recipe rating when reviews change
CREATE OR REPLACE FUNCTION public.update_recipe_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.recipes
    SET 
      rating = COALESCE((SELECT AVG(rating)::DECIMAL(2,1) FROM public.recipe_reviews WHERE recipe_id = OLD.recipe_id), 0),
      review_count = (SELECT COUNT(*) FROM public.recipe_reviews WHERE recipe_id = OLD.recipe_id)
    WHERE id = OLD.recipe_id;
    RETURN OLD;
  ELSE
    UPDATE public.recipes
    SET 
      rating = COALESCE((SELECT AVG(rating)::DECIMAL(2,1) FROM public.recipe_reviews WHERE recipe_id = NEW.recipe_id), 0),
      review_count = (SELECT COUNT(*) FROM public.recipe_reviews WHERE recipe_id = NEW.recipe_id)
    WHERE id = NEW.recipe_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update recipe rating on review changes
CREATE TRIGGER update_recipe_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.recipe_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_recipe_rating();
