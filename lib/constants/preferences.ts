// Dietary preference options
export const dietaryOptions = [
  { id: 'dairy-free', label: 'Dairy-Free', icon: '/assets/illustrations/food/Dairy-Free Diet Dish.svg' },
  { id: 'keto', label: 'Keto', icon: '/assets/illustrations/food/Keto Diet Dish.svg' },
  { id: 'low-fat', label: 'Low-Fat', icon: '/assets/illustrations/food/Low-Fat Diet Dish.svg' },
  { id: 'low-carb', label: 'Low-Carb', icon: '/assets/illustrations/food/Low-Carb Diet Dish.svg' },
  { id: 'vegan', label: 'Vegan', icon: '/assets/illustrations/food/Vegan Diet Dish.svg' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '/assets/illustrations/food/Vegan Diet Dish_1.svg' },
  { id: 'mediterranean', label: 'Mediterranean', icon: '/assets/illustrations/food/Mediterranean Diet Dish.svg' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '/assets/illustrations/food/Gluten-Free Diet Dish.svg' },
] as const

// Cuisine preference options
export const cuisineOptions = [
  { id: 'chinese', label: 'Chinese', icon: '/assets/illustrations/food/Chinese Food.svg' },
  { id: 'thai', label: 'Thai', icon: '/assets/illustrations/food/Thai Food.svg' },
  { id: 'japanese', label: 'Japanese', icon: '/assets/illustrations/food/Japanese Dishes.svg' },
  { id: 'italian', label: 'Italian', icon: '/assets/illustrations/food/Italian Cuisine.svg' },
  { id: 'french', label: 'French', icon: '/assets/illustrations/food/French Cuisine.svg' },
  { id: 'mexican', label: 'Mexican', icon: '/assets/illustrations/food/Mexican Delights.svg' },
  { id: 'mediterranean', label: 'Mediterranean', icon: '/assets/illustrations/food/Mediterranean Food.svg' },
  { id: 'indian', label: 'Indian', icon: '/assets/illustrations/food/Indian Food.svg' },
  { id: 'middle-eastern', label: 'Middle Eastern', icon: '/assets/illustrations/food/Middle Eastern Cuisine.svg' },
  { id: 'spanish', label: 'Spanish Tapas', icon: '/assets/illustrations/food/Spanish Tapas.svg' },
] as const

// Allergy categories with items
export const allergyCategories = [
  {
    id: 'nuts',
    label: 'Nuts & Seeds',
    items: [
      'Almonds', 'Peanuts', 'Walnuts', 'Cashews', 'Pecans', 'Pistachios',
      'Hazelnuts', 'Brazil Nuts', 'Pine Nuts', 'Macadamia', 'Chestnuts',
      'Sunflower Seeds', 'Pumpkin Seeds', 'Sesame Seeds', 'Chia Seeds',
      'Flaxseeds', 'Poppy Seeds', 'Hemp Seeds'
    ]
  },
  {
    id: 'spices',
    label: 'Spices & Herbs',
    items: [
      'Cinnamon', 'Garlic', 'Ginger', 'Basil', 'Oregano', 'Thyme',
      'Rosemary', 'Cumin', 'Paprika', 'Chili Powder', 'Turmeric',
      'Coriander', 'Nutmeg', 'Cloves', 'Cardamom', 'Bay Leaves',
      'Dill', 'Parsley', 'Sage', 'Mint', 'Cilantro', 'Fennel',
      'Mustard', 'Saffron', 'Tarragon', 'Chives'
    ]
  },
  {
    id: 'dairy',
    label: 'Dairy Products',
    items: [
      'Milk', 'Cheese', 'Butter', 'Yogurt', 'Cream', 'Ice Cream',
      'Sour Cream', 'Cottage Cheese', 'Whey', 'Casein', 'Lactose',
      'Ghee', 'Kefir', 'Condensed Milk', 'Buttermilk'
    ]
  },
  {
    id: 'seafood',
    label: 'Seafood',
    items: [
      'Shrimp', 'Crab', 'Lobster', 'Oysters', 'Clams', 'Mussels',
      'Scallops', 'Squid', 'Octopus', 'Fish', 'Salmon', 'Tuna',
      'Cod', 'Sardines', 'Anchovies', 'Caviar', 'Prawns'
    ]
  },
  {
    id: 'grains',
    label: 'Grains & Gluten',
    items: [
      'Wheat', 'Barley', 'Rye', 'Oats', 'Spelt', 'Semolina',
      'Bulgur', 'Couscous', 'Farro', 'Kamut', 'Triticale',
      'Bread', 'Pasta', 'Cereal', 'Flour', 'Beer'
    ]
  },
  {
    id: 'fruits',
    label: 'Fruits',
    items: [
      'Strawberries', 'Kiwi', 'Mango', 'Pineapple', 'Banana',
      'Avocado', 'Citrus', 'Oranges', 'Lemons', 'Grapes',
      'Apples', 'Peaches', 'Cherries', 'Berries', 'Melon',
      'Papaya', 'Coconut', 'Tomatoes'
    ]
  },
  {
    id: 'vegetables',
    label: 'Vegetables',
    items: [
      'Celery', 'Carrots', 'Onions', 'Bell Peppers', 'Eggplant',
      'Mushrooms', 'Corn', 'Potatoes', 'Soy', 'Legumes',
      'Lentils', 'Chickpeas', 'Beans', 'Peas', 'Asparagus'
    ]
  },
  {
    id: 'other',
    label: 'Other',
    items: [
      'Eggs', 'Honey', 'Gelatin', 'Sulfites', 'MSG',
      'Food Coloring', 'Preservatives', 'Yeast', 'Chocolate',
      'Coffee', 'Alcohol', 'Vinegar', 'Soy Sauce'
    ]
  }
] as const

// Cooking skill levels
export const cookingSkillLevels = [
  { id: 'Beginner', label: 'Beginner', icon: '/assets/icons/Beginner.svg', description: 'Just starting out' },
  { id: 'Enthusiast', label: 'Enthusiast', icon: '/assets/icons/Enthusiast.svg', description: 'Comfortable in the kitchen' },
  { id: 'Advanced', label: 'Advanced', icon: '/assets/icons/Advanced.svg', description: 'Experienced cook' },
] as const

// Type exports
export type DietaryOption = typeof dietaryOptions[number]
export type CuisineOption = typeof cuisineOptions[number]
export type AllergyCategory = typeof allergyCategories[number]
export type CookingSkillLevel = typeof cookingSkillLevels[number]
