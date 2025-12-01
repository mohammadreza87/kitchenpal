'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { RecipeHeader, TabNavigation, IngredientsTab, InstructionsTab, ReviewsTab, type RecipeTab } from '@/components/recipe'
import type { Recipe, Ingredient } from '@/types/chat'
import { scaleIngredientQuantity } from '@/types/chat'

// Mock recipe data - comprehensive version of the home page recipes
const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Chocolate Tart',
    author: 'Chef Marie',
    rating: 4.5,
    reviewCount: 128,
    prepTime: '45 min',
    difficulty: 'Medium',
    calories: 380,
    description: 'A rich and decadent chocolate tart with a buttery crust and silky ganache filling. Perfect for special occasions.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Dark Chocolate', quantity: 200, unit: 'g' },
      { id: '2', name: 'Heavy Cream', quantity: 250, unit: 'ml' },
      { id: '3', name: 'Butter', quantity: 100, unit: 'g' },
      { id: '4', name: 'All-purpose Flour', quantity: 200, unit: 'g' },
      { id: '5', name: 'Sugar', quantity: 80, unit: 'g' },
      { id: '6', name: 'Eggs', quantity: 2, unit: 'pcs' },
      { id: '7', name: 'Vanilla Extract', quantity: 1, unit: 'tsp' },
    ],
    instructions: [
      { step: 1, text: 'Prepare the tart crust by mixing flour, butter, and sugar. Press into tart pan and chill for 30 minutes.', duration: '35 min' },
      { step: 2, text: 'Blind bake the crust at 180°C (350°F) for 15 minutes until golden.', duration: '15 min' },
      { step: 3, text: 'Heat cream until simmering, then pour over chopped chocolate. Stir until smooth.', duration: '5 min' },
      { step: 4, text: 'Add butter and vanilla to the ganache, mix well.', duration: '3 min' },
      { step: 5, text: 'Pour ganache into cooled crust and refrigerate for at least 2 hours.', duration: '2 hrs' },
    ],
    reviews: [
      { id: '1', userId: 'u1', userName: 'Sarah M.', userAvatar: '/assets/illustrations/profile/Profile Pic.svg', date: '2024-01-15', rating: 5, comment: 'Absolutely divine! The ganache was perfectly smooth.' },
      { id: '2', userId: 'u2', userName: 'John D.', userAvatar: '/assets/illustrations/profile/Profile Pic-1.svg', date: '2024-01-10', rating: 4, comment: 'Great recipe, but I added a pinch of sea salt on top.' },
    ],
  },
  {
    id: '2',
    name: 'Steamed Dumplings',
    author: 'Chef Wong',
    rating: 4.8,
    reviewCount: 256,
    prepTime: '1 hr',
    difficulty: 'Medium',
    calories: 220,
    description: 'Traditional Chinese steamed dumplings filled with savory pork and vegetables. A dim sum classic.',
    imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Ground Pork', quantity: 300, unit: 'g' },
      { id: '2', name: 'Dumpling Wrappers', quantity: 30, unit: 'pcs' },
      { id: '3', name: 'Napa Cabbage', quantity: 150, unit: 'g' },
      { id: '4', name: 'Green Onions', quantity: 3, unit: 'stalks' },
      { id: '5', name: 'Ginger', quantity: 1, unit: 'tbsp' },
      { id: '6', name: 'Soy Sauce', quantity: 2, unit: 'tbsp' },
      { id: '7', name: 'Sesame Oil', quantity: 1, unit: 'tsp' },
    ],
    instructions: [
      { step: 1, text: 'Finely chop the cabbage and squeeze out excess water.', duration: '10 min' },
      { step: 2, text: 'Mix pork with cabbage, green onions, ginger, soy sauce, and sesame oil.', duration: '5 min' },
      { step: 3, text: 'Place filling in center of wrapper, fold and pleat edges to seal.', duration: '25 min' },
      { step: 4, text: 'Steam dumplings for 12-15 minutes until cooked through.', duration: '15 min' },
      { step: 5, text: 'Serve hot with dipping sauce made of soy sauce and rice vinegar.', duration: '2 min' },
    ],
    reviews: [
      { id: '1', userId: 'u3', userName: 'Emily L.', userAvatar: '/assets/illustrations/profile/Profile Pic-2.svg', date: '2024-01-20', rating: 5, comment: 'Better than restaurant quality!' },
    ],
  },
  {
    id: '3',
    name: 'Berry Bowl',
    author: 'Chef Anna',
    rating: 4.3,
    reviewCount: 89,
    prepTime: '15 min',
    difficulty: 'Easy',
    calories: 280,
    description: 'A refreshing and nutritious smoothie bowl topped with fresh berries, granola, and honey.',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Frozen Mixed Berries', quantity: 200, unit: 'g' },
      { id: '2', name: 'Banana', quantity: 1, unit: 'pc' },
      { id: '3', name: 'Greek Yogurt', quantity: 100, unit: 'g' },
      { id: '4', name: 'Almond Milk', quantity: 100, unit: 'ml' },
      { id: '5', name: 'Granola', quantity: 50, unit: 'g' },
      { id: '6', name: 'Honey', quantity: 1, unit: 'tbsp' },
      { id: '7', name: 'Fresh Berries', quantity: 50, unit: 'g' },
    ],
    instructions: [
      { step: 1, text: 'Blend frozen berries, banana, yogurt, and almond milk until smooth.', duration: '3 min' },
      { step: 2, text: 'Pour into a bowl - it should be thick enough to hold toppings.', duration: '1 min' },
      { step: 3, text: 'Top with granola, fresh berries, and drizzle with honey.', duration: '2 min' },
    ],
    reviews: [
      { id: '1', userId: 'u4', userName: 'Mike R.', userAvatar: '/assets/illustrations/profile/Profile Pic-3.svg', date: '2024-01-18', rating: 4, comment: 'Perfect breakfast option!' },
    ],
  },
  {
    id: '4',
    name: 'Gourmet Burger',
    author: 'Chef Tom',
    rating: 4.7,
    reviewCount: 312,
    prepTime: '30 min',
    difficulty: 'Easy',
    calories: 650,
    description: 'A juicy handcrafted burger with premium beef, caramelized onions, and special sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Ground Beef (80/20)', quantity: 200, unit: 'g' },
      { id: '2', name: 'Brioche Bun', quantity: 1, unit: 'pc' },
      { id: '3', name: 'Cheddar Cheese', quantity: 2, unit: 'slices' },
      { id: '4', name: 'Onion', quantity: 1, unit: 'medium' },
      { id: '5', name: 'Lettuce', quantity: 2, unit: 'leaves' },
      { id: '6', name: 'Tomato', quantity: 2, unit: 'slices' },
      { id: '7', name: 'Pickles', quantity: 4, unit: 'slices' },
    ],
    instructions: [
      { step: 1, text: 'Form beef into a patty, season with salt and pepper.', duration: '5 min' },
      { step: 2, text: 'Caramelize sliced onions in butter over medium heat.', duration: '15 min' },
      { step: 3, text: 'Grill patty 4 minutes per side for medium, add cheese in last minute.', duration: '8 min' },
      { step: 4, text: 'Toast buns, assemble with lettuce, tomato, patty, onions, and pickles.', duration: '3 min' },
    ],
    reviews: [
      { id: '1', userId: 'u5', userName: 'David K.', userAvatar: '/assets/illustrations/profile/Profile Pic-4.svg', date: '2024-01-22', rating: 5, comment: 'The caramelized onions make all the difference!' },
    ],
  },
  {
    id: '5',
    name: 'Acai Bowl',
    author: 'Chef Luna',
    rating: 4.4,
    reviewCount: 145,
    prepTime: '10 min',
    difficulty: 'Easy',
    calories: 320,
    description: 'A vibrant purple smoothie bowl made with acai berries and topped with fresh fruits.',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Acai Packet (frozen)', quantity: 2, unit: 'pcs' },
      { id: '2', name: 'Banana', quantity: 1, unit: 'pc' },
      { id: '3', name: 'Almond Milk', quantity: 80, unit: 'ml' },
      { id: '4', name: 'Strawberries', quantity: 50, unit: 'g' },
      { id: '5', name: 'Blueberries', quantity: 30, unit: 'g' },
      { id: '6', name: 'Coconut Flakes', quantity: 15, unit: 'g' },
      { id: '7', name: 'Chia Seeds', quantity: 1, unit: 'tbsp' },
    ],
    instructions: [
      { step: 1, text: 'Blend acai packets with half banana and almond milk until thick.', duration: '2 min' },
      { step: 2, text: 'Pour into bowl and arrange toppings in rows.', duration: '3 min' },
      { step: 3, text: 'Sprinkle with coconut flakes and chia seeds.', duration: '1 min' },
    ],
    reviews: [],
  },
  {
    id: '6',
    name: 'Avocado Toast',
    author: 'Chef Sam',
    rating: 4.2,
    reviewCount: 98,
    prepTime: '10 min',
    difficulty: 'Easy',
    calories: 350,
    description: 'Creamy avocado on crispy sourdough with poached egg and everything bagel seasoning.',
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Sourdough Bread', quantity: 2, unit: 'slices' },
      { id: '2', name: 'Avocado', quantity: 1, unit: 'pc' },
      { id: '3', name: 'Eggs', quantity: 2, unit: 'pcs' },
      { id: '4', name: 'Everything Bagel Seasoning', quantity: 1, unit: 'tsp' },
      { id: '5', name: 'Red Pepper Flakes', quantity: 0.5, unit: 'tsp' },
      { id: '6', name: 'Lemon Juice', quantity: 1, unit: 'tsp' },
    ],
    instructions: [
      { step: 1, text: 'Toast sourdough slices until golden and crispy.', duration: '3 min' },
      { step: 2, text: 'Mash avocado with lemon juice, salt, and pepper.', duration: '2 min' },
      { step: 3, text: 'Poach eggs in simmering water with a splash of vinegar.', duration: '4 min' },
      { step: 4, text: 'Spread avocado on toast, top with egg and seasonings.', duration: '2 min' },
    ],
    reviews: [],
  },
  {
    id: '7',
    name: 'Pesto Pasta',
    author: 'Chef Marco',
    rating: 4.6,
    reviewCount: 203,
    prepTime: '25 min',
    difficulty: 'Easy',
    calories: 520,
    description: 'Fresh basil pesto tossed with al dente pasta and topped with pine nuts and parmesan.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Pasta', quantity: 200, unit: 'g' },
      { id: '2', name: 'Fresh Basil', quantity: 50, unit: 'g' },
      { id: '3', name: 'Pine Nuts', quantity: 30, unit: 'g' },
      { id: '4', name: 'Parmesan', quantity: 50, unit: 'g' },
      { id: '5', name: 'Garlic', quantity: 2, unit: 'cloves' },
      { id: '6', name: 'Olive Oil', quantity: 80, unit: 'ml' },
    ],
    instructions: [
      { step: 1, text: 'Toast pine nuts in a dry pan until golden.', duration: '3 min' },
      { step: 2, text: 'Blend basil, garlic, pine nuts, parmesan, and olive oil until smooth.', duration: '3 min' },
      { step: 3, text: 'Cook pasta al dente, reserve 1 cup pasta water.', duration: '12 min' },
      { step: 4, text: 'Toss hot pasta with pesto, adding pasta water to reach desired consistency.', duration: '2 min' },
    ],
    reviews: [],
  },
  {
    id: '8',
    name: 'Fresh Salad',
    author: 'Chef Nina',
    rating: 4.1,
    reviewCount: 67,
    prepTime: '15 min',
    difficulty: 'Easy',
    calories: 180,
    description: 'A crisp garden salad with mixed greens, cherry tomatoes, and balsamic vinaigrette.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Mixed Greens', quantity: 150, unit: 'g' },
      { id: '2', name: 'Cherry Tomatoes', quantity: 100, unit: 'g' },
      { id: '3', name: 'Cucumber', quantity: 1, unit: 'pc' },
      { id: '4', name: 'Red Onion', quantity: 0.5, unit: 'pc' },
      { id: '5', name: 'Balsamic Vinegar', quantity: 2, unit: 'tbsp' },
      { id: '6', name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
    ],
    instructions: [
      { step: 1, text: 'Wash and dry all vegetables thoroughly.', duration: '5 min' },
      { step: 2, text: 'Slice cucumber and onion, halve cherry tomatoes.', duration: '5 min' },
      { step: 3, text: 'Whisk balsamic vinegar with olive oil, salt, and pepper.', duration: '2 min' },
      { step: 4, text: 'Toss greens with vegetables and dress just before serving.', duration: '2 min' },
    ],
    reviews: [],
  },
  {
    id: '9',
    name: 'Grilled Salmon',
    author: 'Chef Pierre',
    rating: 4.9,
    reviewCount: 178,
    prepTime: '25 min',
    difficulty: 'Medium',
    calories: 420,
    description: 'Perfectly grilled salmon fillet with lemon herb butter and roasted asparagus.',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Salmon Fillet', quantity: 200, unit: 'g' },
      { id: '2', name: 'Asparagus', quantity: 150, unit: 'g' },
      { id: '3', name: 'Butter', quantity: 50, unit: 'g' },
      { id: '4', name: 'Lemon', quantity: 1, unit: 'pc' },
      { id: '5', name: 'Fresh Dill', quantity: 2, unit: 'tbsp' },
      { id: '6', name: 'Garlic', quantity: 2, unit: 'cloves' },
    ],
    instructions: [
      { step: 1, text: 'Season salmon with salt, pepper, and olive oil.', duration: '2 min' },
      { step: 2, text: 'Make herb butter by mixing softened butter with dill, garlic, and lemon zest.', duration: '3 min' },
      { step: 3, text: 'Grill salmon skin-side down for 4-5 minutes, flip and cook 3 more minutes.', duration: '8 min' },
      { step: 4, text: 'Roast asparagus at 200°C while salmon cooks.', duration: '10 min' },
      { step: 5, text: 'Top salmon with herb butter and serve with asparagus.', duration: '2 min' },
    ],
    reviews: [],
  },
  {
    id: '10',
    name: 'Grilled Steak',
    author: 'Chef Roberto',
    rating: 4.8,
    reviewCount: 245,
    prepTime: '20 min',
    difficulty: 'Medium',
    calories: 550,
    description: 'Restaurant-quality ribeye steak with a perfect sear and garlic herb butter.',
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Ribeye Steak', quantity: 300, unit: 'g' },
      { id: '2', name: 'Butter', quantity: 50, unit: 'g' },
      { id: '3', name: 'Garlic', quantity: 3, unit: 'cloves' },
      { id: '4', name: 'Fresh Thyme', quantity: 3, unit: 'sprigs' },
      { id: '5', name: 'Fresh Rosemary', quantity: 2, unit: 'sprigs' },
    ],
    instructions: [
      { step: 1, text: 'Bring steak to room temperature, pat dry and season generously.', duration: '30 min' },
      { step: 2, text: 'Heat cast iron pan until smoking hot.', duration: '5 min' },
      { step: 3, text: 'Sear steak 3-4 minutes per side for medium-rare.', duration: '8 min' },
      { step: 4, text: 'Add butter, garlic, and herbs, baste steak for 1 minute.', duration: '2 min' },
      { step: 5, text: 'Rest for 5 minutes before slicing.', duration: '5 min' },
    ],
    reviews: [],
  },
  {
    id: '11',
    name: 'Chicken Breast',
    author: 'Chef Elena',
    rating: 4.3,
    reviewCount: 134,
    prepTime: '25 min',
    difficulty: 'Easy',
    calories: 320,
    description: 'Juicy pan-seared chicken breast with a crispy golden crust and lemon pan sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Chicken Breast', quantity: 250, unit: 'g' },
      { id: '2', name: 'Lemon', quantity: 1, unit: 'pc' },
      { id: '3', name: 'Chicken Broth', quantity: 100, unit: 'ml' },
      { id: '4', name: 'Butter', quantity: 30, unit: 'g' },
      { id: '5', name: 'Capers', quantity: 1, unit: 'tbsp' },
      { id: '6', name: 'Fresh Parsley', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      { step: 1, text: 'Pound chicken to even thickness, season well.', duration: '5 min' },
      { step: 2, text: 'Sear chicken in hot pan 5-6 minutes per side until golden.', duration: '12 min' },
      { step: 3, text: 'Remove chicken, add broth and lemon juice to pan.', duration: '2 min' },
      { step: 4, text: 'Simmer sauce, whisk in butter and capers.', duration: '3 min' },
      { step: 5, text: 'Slice chicken, drizzle with sauce and garnish with parsley.', duration: '2 min' },
    ],
    reviews: [],
  },
  {
    id: '12',
    name: 'Shrimp Salad',
    author: 'Chef Coastal',
    rating: 4.5,
    reviewCount: 92,
    prepTime: '20 min',
    difficulty: 'Easy',
    calories: 280,
    description: 'Refreshing shrimp salad with avocado, mango, and citrus dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Large Shrimp', quantity: 200, unit: 'g' },
      { id: '2', name: 'Mixed Greens', quantity: 100, unit: 'g' },
      { id: '3', name: 'Avocado', quantity: 1, unit: 'pc' },
      { id: '4', name: 'Mango', quantity: 0.5, unit: 'pc' },
      { id: '5', name: 'Lime', quantity: 2, unit: 'pcs' },
      { id: '6', name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
    ],
    instructions: [
      { step: 1, text: 'Season and grill shrimp 2 minutes per side.', duration: '5 min' },
      { step: 2, text: 'Dice avocado and mango into cubes.', duration: '5 min' },
      { step: 3, text: 'Whisk lime juice with olive oil and honey.', duration: '2 min' },
      { step: 4, text: 'Arrange greens, top with shrimp, avocado, mango, and dress.', duration: '3 min' },
    ],
    reviews: [],
  },
  {
    id: '13',
    name: 'Croissant',
    author: 'Chef François',
    rating: 4.9,
    reviewCount: 189,
    prepTime: '3 hrs',
    difficulty: 'Hard',
    calories: 340,
    description: 'Flaky, buttery French croissants with dozens of delicate layers.',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'All-purpose Flour', quantity: 500, unit: 'g' },
      { id: '2', name: 'Cold Butter', quantity: 280, unit: 'g' },
      { id: '3', name: 'Milk', quantity: 240, unit: 'ml' },
      { id: '4', name: 'Sugar', quantity: 50, unit: 'g' },
      { id: '5', name: 'Yeast', quantity: 7, unit: 'g' },
      { id: '6', name: 'Egg', quantity: 1, unit: 'pc' },
    ],
    instructions: [
      { step: 1, text: 'Make dough with flour, milk, sugar, yeast. Chill 1 hour.', duration: '1 hr 15 min' },
      { step: 2, text: 'Pound butter into a flat square, encase in dough.', duration: '10 min' },
      { step: 3, text: 'Perform 3 folds, chilling 30 min between each.', duration: '2 hrs' },
      { step: 4, text: 'Roll out, cut triangles, shape into croissants.', duration: '20 min' },
      { step: 5, text: 'Proof 2 hours, brush with egg wash, bake at 200°C for 15 min.', duration: '2 hrs 15 min' },
    ],
    reviews: [],
  },
  {
    id: '14',
    name: 'Crème Brûlée',
    author: 'Chef François',
    rating: 4.7,
    reviewCount: 156,
    prepTime: '1 hr',
    difficulty: 'Medium',
    calories: 420,
    description: 'Classic French vanilla custard with a caramelized sugar crust.',
    imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Heavy Cream', quantity: 400, unit: 'ml' },
      { id: '2', name: 'Egg Yolks', quantity: 5, unit: 'pcs' },
      { id: '3', name: 'Sugar', quantity: 100, unit: 'g' },
      { id: '4', name: 'Vanilla Bean', quantity: 1, unit: 'pc' },
      { id: '5', name: 'Demerara Sugar', quantity: 50, unit: 'g' },
    ],
    instructions: [
      { step: 1, text: 'Heat cream with vanilla bean seeds until steaming.', duration: '5 min' },
      { step: 2, text: 'Whisk egg yolks with sugar until pale.', duration: '3 min' },
      { step: 3, text: 'Slowly temper hot cream into yolks, strain.', duration: '5 min' },
      { step: 4, text: 'Bake in water bath at 150°C for 40-45 minutes.', duration: '45 min' },
      { step: 5, text: 'Chill, then torch sugar topping until caramelized.', duration: '3 min' },
    ],
    reviews: [],
  },
  {
    id: '15',
    name: 'French Onion Soup',
    author: 'Chef Lyon',
    rating: 4.6,
    reviewCount: 134,
    prepTime: '1.5 hrs',
    difficulty: 'Medium',
    calories: 380,
    description: 'Rich caramelized onion soup topped with crusty bread and melted Gruyère.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
    ingredients: [
      { id: '1', name: 'Yellow Onions', quantity: 1, unit: 'kg' },
      { id: '2', name: 'Beef Broth', quantity: 1, unit: 'L' },
      { id: '3', name: 'Butter', quantity: 60, unit: 'g' },
      { id: '4', name: 'Baguette', quantity: 4, unit: 'slices' },
      { id: '5', name: 'Gruyère Cheese', quantity: 150, unit: 'g' },
      { id: '6', name: 'Dry White Wine', quantity: 100, unit: 'ml' },
    ],
    instructions: [
      { step: 1, text: 'Thinly slice onions and cook in butter over medium-low heat until deeply caramelized.', duration: '45 min' },
      { step: 2, text: 'Deglaze with white wine, cook until evaporated.', duration: '5 min' },
      { step: 3, text: 'Add broth and simmer for 20 minutes.', duration: '20 min' },
      { step: 4, text: 'Ladle into oven-safe bowls, top with bread and cheese.', duration: '5 min' },
      { step: 5, text: 'Broil until cheese is bubbly and golden.', duration: '5 min' },
    ],
    reviews: [],
  },
]

// Helper function to scale ingredients
function scaleIngredients(ingredients: Ingredient[], originalPortions: number, newPortions: number): Ingredient[] {
  return ingredients.map(ing => ({
    ...ing,
    quantity: scaleIngredientQuantity(ing.quantity, originalPortions, newPortions)
  }))
}

export default function RecipePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<RecipeTab>('ingredients')
  const [portions, setPortions] = useState(4)
  const [scaledIngredients, setScaledIngredients] = useState<Ingredient[]>([])

  // Default portions (assumed to be 4 for recipes)
  const originalPortions = 4

  useEffect(() => {
    // Find recipe from mock data
    const foundRecipe = mockRecipes.find(r => r.id === id)

    if (foundRecipe) {
      setRecipe(foundRecipe)
      setScaledIngredients(foundRecipe.ingredients)
    } else {
      setError('Recipe not found')
    }

    setLoading(false)
  }, [id])

  // Handle portion changes
  useEffect(() => {
    if (recipe && recipe.ingredients) {
      const scaled = scaleIngredients(recipe.ingredients, originalPortions, portions)
      setScaledIngredients(scaled)
    }
  }, [portions, recipe])

  // Animate on load
  useEffect(() => {
    if (!loading && !error && containerRef.current) {
      const elements = containerRef.current.querySelectorAll('[data-animate]')
      gsap.fromTo(
        elements,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      )
    }
  }, [loading, error])

  const handleBack = () => {
    router.back()
  }

  const handleIncreasePortions = () => {
    setPortions(prev => prev + 1)
  }

  const handleDecreasePortions = () => {
    setPortions(prev => Math.max(1, prev - 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Loading Skeleton */}
        <div className="animate-pulse">
          {/* Hero Image Skeleton */}
          <div className="h-64 bg-gray-200" />

          {/* Content Skeleton */}
          <div className="px-6 py-6 space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="flex gap-2 mt-4">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-4 mt-6">
              <div className="h-12 w-24 bg-gray-200 rounded" />
              <div className="h-12 w-24 bg-gray-200 rounded" />
              <div className="h-12 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Image
          src="/assets/icons/X-Circle.svg"
          alt="Error"
          width={64}
          height={64}
          className="opacity-40"
        />
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {error || 'Recipe not found'}
        </h2>
        <p className="mt-2 text-muted-foreground text-center">
          We couldn&apos;t find the recipe you&apos;re looking for.
        </p>
        <button
          onClick={handleBack}
          className="mt-6 px-6 py-3 bg-brand-primary text-white rounded-full font-medium transition-all hover:bg-brand-primary-dark active:scale-[0.98]"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-24">
      {/* Hero Image with Back Button */}
      <div data-animate className="relative h-64 w-full">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-brand-primary-container flex items-center justify-center">
            <Image
              src="/assets/icons/Fork.svg"
              alt="Recipe placeholder"
              width={64}
              height={64}
              className="opacity-30"
            />
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:bg-white active:scale-95"
        >
          <Image
            src="/assets/icons/Arrow-Left.svg"
            alt="Back"
            width={24}
            height={24}
          />
        </button>

        {/* Save Button */}
        <button
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:bg-white active:scale-95"
        >
          <Image
            src="/assets/icons/Bookmark.svg"
            alt="Save"
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* Recipe Header */}
      <div data-animate>
        <RecipeHeader
          title={recipe.name}
          author={recipe.author}
          rating={recipe.rating}
          reviewCount={recipe.reviewCount}
          prepTime={recipe.prepTime}
          difficulty={recipe.difficulty}
          calories={recipe.calories}
          description={recipe.description}
        />
      </div>

      {/* Tab Navigation */}
      <div data-animate>
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div data-animate>
        {activeTab === 'ingredients' && (
          <IngredientsTab
            ingredients={scaledIngredients}
            portions={portions}
            onIncrease={handleIncreasePortions}
            onDecrease={handleDecreasePortions}
          />
        )}

        {activeTab === 'instructions' && (
          <InstructionsTab
            instructions={recipe.instructions}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab
            reviews={recipe.reviews}
            totalCount={recipe.reviewCount}
            averageRating={recipe.rating}
          />
        )}
      </div>
    </div>
  )
}
