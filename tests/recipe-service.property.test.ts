import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { RecipeService } from '../lib/services/recipe.service'
import { scaleIngredientQuantity } from '../types/chat'
import type { Recipe, Ingredient } from '../types/chat'

/**
 * Property-Based Tests for Recipe Service
 * Using fast-check library as specified in design document
 * Minimum 100 iterations per property test
 */

// Create a mock Supabase client for testing pure functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSupabase = {} as any

/**
 * Arbitrary generators for Recipe and Ingredient types
 */
const ingredientArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  quantity: fc.float({ min: Math.fround(0.1), max: Math.fround(1000), noNaN: true }),
  unit: fc.constantFrom('g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece'),
  iconUrl: fc.option(fc.webUrl(), { nil: undefined }),
  sortOrder: fc.nat({ max: 100 }),
})

const recipeArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  author: fc.string({ minLength: 1, maxLength: 50 }),
  rating: fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true }),
  reviewCount: fc.nat({ max: 10000 }),
  prepTime: fc.constantFrom('10 min', '20 min', '30 min', '1 hour', '2 hours'),
  difficulty: fc.constantFrom('Easy', 'Medium', 'Hard') as fc.Arbitrary<'Easy' | 'Medium' | 'Hard'>,
  calories: fc.nat({ max: 2000 }),
  description: fc.string({ maxLength: 500 }),
  imageUrl: fc.webUrl(),
  ingredients: fc.array(ingredientArbitrary, { minLength: 1, maxLength: 20 }),
  instructions: fc.array(
    fc.record({
      step: fc.nat({ max: 20 }),
      text: fc.string({ minLength: 1, maxLength: 200 }),
      duration: fc.option(fc.constantFrom('5 min', '10 min', '15 min'), { nil: undefined }),
    }),
    { minLength: 1, maxLength: 15 }
  ),
  reviews: fc.array(
    fc.record({
      id: fc.uuid(),
      userId: fc.uuid(),
      userName: fc.string({ minLength: 1, maxLength: 50 }),
      userAvatar: fc.webUrl(),
      date: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
      rating: fc.integer({ min: 1, max: 5 }),
      comment: fc.string({ maxLength: 300 }),
    }),
    { maxLength: 10 }
  ),
})

// Arbitrary for allergy names (common allergens)
const allergyArbitrary = fc.constantFrom(
  'peanut', 'tree nut', 'milk', 'egg', 'wheat', 'soy', 'fish', 'shellfish',
  'sesame', 'gluten', 'dairy', 'almond', 'cashew', 'walnut', 'hazelnut',
  'pecan', 'pistachio', 'macadamia', 'shrimp', 'crab', 'lobster', 'oyster'
)

describe('RecipeService Property Tests', () => {
  /**
   * **Feature: ai-chat, Property 5: Allergy filtering excludes conflicting recipes**
   * **Validates: Requirements 4.2**
   * 
   * *For any* set of user allergies and any set of recipes, the filtered recipe list
   * should contain no recipes with ingredients that match any user allergy.
   */
  describe('Property 5: Allergy filtering excludes conflicting recipes', () => {
    const recipeService = new RecipeService(mockSupabase)

    it('should exclude all recipes containing ingredients that match user allergies', () => {
      fc.assert(
        fc.property(
          fc.array(recipeArbitrary, { minLength: 0, maxLength: 10 }),
          fc.array(allergyArbitrary, { minLength: 1, maxLength: 5 }),
          (recipes, allergies) => {
            const filteredRecipes = recipeService.filterByAllergies(recipes, allergies)
            const lowerAllergies = allergies.map(a => a.toLowerCase())

            // Property: No filtered recipe should contain any allergen
            for (const recipe of filteredRecipes) {
              for (const ingredient of recipe.ingredients) {
                const ingredientName = ingredient.name.toLowerCase()
                for (const allergy of lowerAllergies) {
                  // Check both directions: ingredient contains allergy OR allergy contains ingredient
                  const hasConflict = ingredientName.includes(allergy) || allergy.includes(ingredientName)
                  expect(hasConflict).toBe(false)
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return all recipes when no allergies are specified', () => {
      fc.assert(
        fc.property(
          fc.array(recipeArbitrary, { minLength: 0, maxLength: 10 }),
          (recipes) => {
            const filteredRecipes = recipeService.filterByAllergies(recipes, [])
            
            // Property: With no allergies, all recipes should be returned
            expect(filteredRecipes.length).toBe(recipes.length)
            expect(filteredRecipes).toEqual(recipes)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve recipes that have no conflicting ingredients', () => {
      // Generate recipes with known safe ingredients (no common allergens)
      const safeIngredientNames = ['carrot', 'potato', 'tomato', 'onion', 'garlic', 'pepper', 'salt', 'olive oil', 'basil', 'oregano']
      
      const safeIngredientArbitrary = fc.record({
        id: fc.uuid(),
        name: fc.constantFrom(...safeIngredientNames),
        quantity: fc.float({ min: Math.fround(0.1), max: Math.fround(1000), noNaN: true }),
        unit: fc.constantFrom('g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece'),
        iconUrl: fc.option(fc.webUrl(), { nil: undefined }),
        sortOrder: fc.nat({ max: 100 }),
      })

      const safeRecipeArbitrary = fc.record({
        id: fc.uuid(),
        name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        author: fc.string({ minLength: 1, maxLength: 50 }),
        rating: fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true }),
        reviewCount: fc.nat({ max: 10000 }),
        prepTime: fc.constantFrom('10 min', '20 min', '30 min', '1 hour', '2 hours'),
        difficulty: fc.constantFrom('Easy', 'Medium', 'Hard') as fc.Arbitrary<'Easy' | 'Medium' | 'Hard'>,
        calories: fc.nat({ max: 2000 }),
        description: fc.string({ maxLength: 500 }),
        imageUrl: fc.webUrl(),
        ingredients: fc.array(safeIngredientArbitrary, { minLength: 1, maxLength: 10 }),
        instructions: fc.array(
          fc.record({
            step: fc.nat({ max: 20 }),
            text: fc.string({ minLength: 1, maxLength: 200 }),
            duration: fc.option(fc.constantFrom('5 min', '10 min', '15 min'), { nil: undefined }),
          }),
          { minLength: 1, maxLength: 15 }
        ),
        reviews: fc.array(
          fc.record({
            id: fc.uuid(),
            userId: fc.uuid(),
            userName: fc.string({ minLength: 1, maxLength: 50 }),
            userAvatar: fc.webUrl(),
            date: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
            rating: fc.integer({ min: 1, max: 5 }),
            comment: fc.string({ maxLength: 300 }),
          }),
          { maxLength: 10 }
        ),
      })

      fc.assert(
        fc.property(
          fc.array(safeRecipeArbitrary, { minLength: 1, maxLength: 5 }),
          fc.array(allergyArbitrary, { minLength: 1, maxLength: 5 }),
          (safeRecipes, allergies) => {
            const filteredRecipes = recipeService.filterByAllergies(safeRecipes, allergies)
            
            // Property: Safe recipes (with no allergen ingredients) should all be preserved
            expect(filteredRecipes.length).toBe(safeRecipes.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should correctly filter recipes with allergen-containing ingredients', () => {
      // Create a recipe generator that explicitly includes an allergen
      fc.assert(
        fc.property(
          allergyArbitrary,
          fc.array(allergyArbitrary, { minLength: 0, maxLength: 3 }),
          (targetAllergy, otherAllergies) => {
            // Create a recipe with the target allergen as an ingredient
            const recipeWithAllergen: Recipe = {
              id: 'test-recipe-1',
              name: 'Test Recipe',
              author: 'Test Author',
              rating: 4.5,
              reviewCount: 10,
              prepTime: '30 min',
              difficulty: 'Medium',
              calories: 500,
              description: 'A test recipe',
              imageUrl: 'https://example.com/image.jpg',
              ingredients: [
                {
                  id: 'ing-1',
                  name: targetAllergy, // This ingredient IS the allergen
                  quantity: 100,
                  unit: 'g',
                },
                {
                  id: 'ing-2',
                  name: 'safe ingredient',
                  quantity: 200,
                  unit: 'g',
                },
              ],
              instructions: [{ step: 1, text: 'Mix ingredients' }],
              reviews: [],
            }

            const allergies = [targetAllergy, ...otherAllergies]
            const filteredRecipes = recipeService.filterByAllergies([recipeWithAllergen], allergies)

            // Property: Recipe with allergen ingredient should be filtered out
            expect(filteredRecipes.length).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle case-insensitive allergy matching', () => {
      fc.assert(
        fc.property(
          allergyArbitrary,
          fc.constantFrom('UPPER', 'lower', 'MiXeD'),
          (allergy, caseStyle) => {
            // Transform allergy to different case
            let transformedAllergy: string
            switch (caseStyle) {
              case 'UPPER':
                transformedAllergy = allergy.toUpperCase()
                break
              case 'lower':
                transformedAllergy = allergy.toLowerCase()
                break
              case 'MiXeD':
                transformedAllergy = allergy.split('').map((c, i) => 
                  i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
                ).join('')
                break
              default:
                transformedAllergy = allergy
            }

            // Create recipe with ingredient matching the allergy (in original case)
            const recipe: Recipe = {
              id: 'test-recipe',
              name: 'Test Recipe',
              author: 'Test Author',
              rating: 4.0,
              reviewCount: 5,
              prepTime: '20 min',
              difficulty: 'Easy',
              calories: 300,
              description: 'Test',
              imageUrl: 'https://example.com/img.jpg',
              ingredients: [
                {
                  id: 'ing-1',
                  name: allergy, // Original case
                  quantity: 50,
                  unit: 'g',
                },
              ],
              instructions: [{ step: 1, text: 'Cook' }],
              reviews: [],
            }

            // Filter with transformed case allergy
            const filteredRecipes = recipeService.filterByAllergies([recipe], [transformedAllergy])

            // Property: Case should not matter - recipe should still be filtered
            expect(filteredRecipes.length).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: ai-chat, Property 10: Portion adjustment scales ingredients correctly**
   * **Validates: Requirements 10.2**
   * 
   * *For any* recipe with ingredients and any positive integer portion multiplier,
   * all ingredient quantities should scale proportionally (quantity * newPortions / originalPortions).
   */
  describe('Property 10: Portion adjustment scales ingredients correctly', () => {
    const recipeService = new RecipeService(mockSupabase)

    it('should scale all ingredient quantities proportionally', () => {
      fc.assert(
        fc.property(
          fc.array(ingredientArbitrary, { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 1, max: 20 }), // originalPortions
          fc.integer({ min: 1, max: 20 }), // newPortions
          (ingredients, originalPortions, newPortions) => {
            const scaledIngredients = recipeService.scaleIngredients(
              ingredients,
              originalPortions,
              newPortions
            )

            // Property: Each ingredient quantity should be scaled by (newPortions / originalPortions)
            const expectedScaleFactor = newPortions / originalPortions

            for (let i = 0; i < ingredients.length; i++) {
              const original = ingredients[i]
              const scaled = scaledIngredients[i]

              // Calculate expected quantity (rounded to 2 decimal places like the implementation)
              const expectedQuantity = Math.round(original.quantity * expectedScaleFactor * 100) / 100

              expect(scaled.quantity).toBeCloseTo(expectedQuantity, 2)
              // Other properties should remain unchanged
              expect(scaled.id).toBe(original.id)
              expect(scaled.name).toBe(original.name)
              expect(scaled.unit).toBe(original.unit)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve ingredient count after scaling', () => {
      fc.assert(
        fc.property(
          fc.array(ingredientArbitrary, { minLength: 0, maxLength: 15 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          (ingredients, originalPortions, newPortions) => {
            const scaledIngredients = recipeService.scaleIngredients(
              ingredients,
              originalPortions,
              newPortions
            )

            // Property: Number of ingredients should remain the same
            expect(scaledIngredients.length).toBe(ingredients.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return original quantities when portions are equal', () => {
      fc.assert(
        fc.property(
          fc.array(ingredientArbitrary, { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 1, max: 20 }),
          (ingredients, portions) => {
            const scaledIngredients = recipeService.scaleIngredients(
              ingredients,
              portions,
              portions // same as original
            )

            // Property: When portions are equal, quantities should be unchanged
            for (let i = 0; i < ingredients.length; i++) {
              expect(scaledIngredients[i].quantity).toBeCloseTo(ingredients[i].quantity, 2)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should double quantities when portions are doubled', () => {
      fc.assert(
        fc.property(
          fc.array(ingredientArbitrary, { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 1, max: 10 }),
          (ingredients, originalPortions) => {
            const newPortions = originalPortions * 2
            const scaledIngredients = recipeService.scaleIngredients(
              ingredients,
              originalPortions,
              newPortions
            )

            // Property: Doubling portions should double quantities
            for (let i = 0; i < ingredients.length; i++) {
              const expectedQuantity = Math.round(ingredients[i].quantity * 2 * 100) / 100
              expect(scaledIngredients[i].quantity).toBeCloseTo(expectedQuantity, 2)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should halve quantities when portions are halved', () => {
      fc.assert(
        fc.property(
          fc.array(ingredientArbitrary, { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 2, max: 20 }).filter(n => n % 2 === 0), // even numbers only
          (ingredients, originalPortions) => {
            const newPortions = originalPortions / 2
            const scaledIngredients = recipeService.scaleIngredients(
              ingredients,
              originalPortions,
              newPortions
            )

            // Property: Halving portions should halve quantities
            for (let i = 0; i < ingredients.length; i++) {
              const expectedQuantity = Math.round(ingredients[i].quantity * 0.5 * 100) / 100
              expect(scaledIngredients[i].quantity).toBeCloseTo(expectedQuantity, 2)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return original ingredients when originalPortions is zero or negative', () => {
      fc.assert(
        fc.property(
          fc.array(ingredientArbitrary, { minLength: 1, maxLength: 5 }),
          fc.integer({ min: -10, max: 0 }),
          fc.integer({ min: 1, max: 10 }),
          (ingredients, invalidOriginalPortions, newPortions) => {
            const scaledIngredients = recipeService.scaleIngredients(
              ingredients,
              invalidOriginalPortions,
              newPortions
            )

            // Property: Invalid original portions should return original ingredients unchanged
            expect(scaledIngredients).toEqual(ingredients)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return original ingredients when newPortions is zero or negative', () => {
      fc.assert(
        fc.property(
          fc.array(ingredientArbitrary, { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: -10, max: 0 }),
          (ingredients, originalPortions, invalidNewPortions) => {
            const scaledIngredients = recipeService.scaleIngredients(
              ingredients,
              originalPortions,
              invalidNewPortions
            )

            // Property: Invalid new portions should return original ingredients unchanged
            expect(scaledIngredients).toEqual(ingredients)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: ai-chat, Property 10: scaleIngredientQuantity helper function**
   * **Validates: Requirements 10.2**
   * 
   * Tests the standalone helper function for scaling individual ingredient quantities.
   */
  describe('Property 10: scaleIngredientQuantity helper', () => {
    it('should scale quantity proportionally', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(1000), noNaN: true }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          (originalQuantity, originalPortions, newPortions) => {
            const scaledQuantity = scaleIngredientQuantity(
              originalQuantity,
              originalPortions,
              newPortions
            )

            // Property: Scaled quantity should equal (original * newPortions / originalPortions)
            const expectedQuantity = (originalQuantity * newPortions) / originalPortions
            expect(scaledQuantity).toBeCloseTo(expectedQuantity, 5)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return original quantity when originalPortions is zero or negative', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(1000), noNaN: true }),
          fc.integer({ min: -10, max: 0 }),
          fc.integer({ min: 1, max: 20 }),
          (originalQuantity, invalidOriginalPortions, newPortions) => {
            const scaledQuantity = scaleIngredientQuantity(
              originalQuantity,
              invalidOriginalPortions,
              newPortions
            )

            // Property: Invalid original portions should return original quantity
            expect(scaledQuantity).toBe(originalQuantity)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
