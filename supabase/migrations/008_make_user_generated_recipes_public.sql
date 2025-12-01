-- Migration: Make user_generated_recipes publicly readable

-- Drop the old SELECT policy that restricted to own user
DROP POLICY IF EXISTS "Users can view own generated recipes" ON public.user_generated_recipes;

-- Public read access for generated recipes
CREATE POLICY "Anyone can view generated recipes" ON public.user_generated_recipes
  FOR SELECT USING (true);

-- Keep existing insert/update/delete policies (ownership enforced)
