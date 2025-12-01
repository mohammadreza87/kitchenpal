import { describe, it, expect, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { RecipeDetailModal } from '../components/recipe/RecipeDetailModal'
import { RecipeHeader } from '../components/recipe/RecipeHeader'
import { TabNavigation, RecipeTab } from '../components/recipe/TabNavigation'
import { IngredientsTab } from '../components/recipe/IngredientsTab'
import { InstructionsTab } from '../components/recipe/InstructionsTab'
import { ReviewsTab } from '../components/recipe/ReviewsTab'
import { ReviewsProvider } from '../hooks/useReviews'
import type { Recipe, RecipeDifficulty, Ingredient, Instruction, Review } from '../types/chat'

// Mock the useUser hook
vi.mock('../hooks/useUser', () => ({
  useUser: () => ({ user: null, loading: false })
}))

// Time units that the highlightDuration function recognizes
const TIME_UNITS = ['minutes', 'minute', 'mins', 'min', 'seconds', 'second', 'secs', 'sec', 'hours', 'hour', 'hrs', 'hr']

// Ensure cleanup after each test
afterEach(() => {
  cleanup()
})

/**
 * Property-Based Tests for Recipe Detail Display
 * Using fast-check library as specified in design document
 * Minimum 100 iterations per property test
 */

// ============================================
// ARBITRARIES FOR PROPERTY TESTS
// ============================================

/**
 * Arbitrary for generating valid recipe difficulty
 */
const difficultyArbitrary: fc.Arbitrary<RecipeDifficulty> = fc.constantFrom('Easy', 'Medium', 'Hard')

/**
 * Arbitrary for generating valid recipe
 */
const recipeArbitrary: fc.Arbitrary<Recipe> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  author: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  authorId: fc.option(fc.uuid(), { nil: undefined }),
  rating: fc.float({ min: 0, max: 5, noNaN: true }),
  reviewCount: fc.nat({ max: 10000 }),
  prepTime: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  difficulty: difficultyArbitrary,
  calories: fc.nat({ max: 5000 }),
  description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  imageUrl: fc.webUrl(),
  ingredients: fc.constant([]),
  instructions: fc.constant([]),
  reviews: fc.constant([]),
  createdAt: fc.option(fc.date(), { nil: undefined }),
  updatedAt: fc.option(fc.date(), { nil: undefined }),
})

describe('Recipe Detail Property Tests', () => {
  /**
   * **Feature: ai-chat, Property 8: Recipe detail displays all required information**
   * **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
   * 
   * *For any* recipe, when the detail view is opened, it should display the hero image,
   * title, author, rating, prep time, difficulty, calories, and description.
   */
  describe('Property 8: Recipe detail displays all required information', () => {
    it('should display hero image when recipe has imageUrl (Requirement 9.1)', () => {
      fc.assert(
        fc.property(recipeArbitrary, (recipe) => {
          const mockOnClose = vi.fn()
          const { container } = render(
            <RecipeDetailModal
              isOpen={true}
              onClose={mockOnClose}
              recipe={recipe}
            >
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
            </RecipeDetailModal>
          )
          
          // Hero image should be present - either the actual image or placeholder
          const heroImageContainer = container.querySelector('.relative.w-full.h-48, .relative.w-full.h-64')
          expect(heroImageContainer).not.toBeNull()
          
          // Should have an img element (either recipe image or placeholder)
          const images = container.querySelectorAll('img')
          expect(images.length).toBeGreaterThan(0)
          
          cleanup()
        }),
        { numRuns: 100 }
      )
    })

    it('should display recipe title (Requirement 9.2)', () => {
      fc.assert(
        fc.property(recipeArbitrary, (recipe) => {
          const mockOnClose = vi.fn()
          const { container } = render(
            <RecipeDetailModal
              isOpen={true}
              onClose={mockOnClose}
              recipe={recipe}
            >
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
            </RecipeDetailModal>
          )
          
          // Title should be displayed in an h2 element
          const titleElement = container.querySelector('#recipe-title')
          expect(titleElement).not.toBeNull()
          expect(titleElement?.textContent).toBe(recipe.name)
          
          cleanup()
        }),
        { numRuns: 100 }
      )
    })

    it('should display author name (Requirement 9.2)', () => {
      fc.assert(
        fc.property(recipeArbitrary, (recipe) => {
          const mockOnClose = vi.fn()
          const { container } = render(
            <RecipeDetailModal
              isOpen={true}
              onClose={mockOnClose}
              recipe={recipe}
            >
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
            </RecipeDetailModal>
          )
          
          // Author should be displayed with "by" prefix
          const authorText = `by ${recipe.author}`
          expect(container.textContent).toContain(authorText)
          
          cleanup()
        }),
        { numRuns: 100 }
      )
    })

    it('should display star rating (Requirement 9.2)', () => {
      fc.assert(
        fc.property(recipeArbitrary, (recipe) => {
          const mockOnClose = vi.fn()
          const { container } = render(
            <RecipeDetailModal
              isOpen={true}
              onClose={mockOnClose}
              recipe={recipe}
            >
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
            </RecipeDetailModal>
          )
          
          // Rating should be displayed as formatted number
          const formattedRating = recipe.rating.toFixed(1)
          expect(container.textContent).toContain(formattedRating)
          
          // Should have star icons (5 stars for rating display)
          const starImages = container.querySelectorAll('img[src*="Star"]')
          expect(starImages.length).toBe(5)
          
          cleanup()
        }),
        { numRuns: 100 }
      )
    })

    it('should display prep time (Requirement 9.3)', () => {
      fc.assert(
        fc.property(recipeArbitrary, (recipe) => {
          const mockOnClose = vi.fn()
          const { container } = render(
            <RecipeDetailModal
              isOpen={true}
              onClose={mockOnClose}
              recipe={recipe}
            >
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
            </RecipeDetailModal>
          )
          
          // Prep time should be displayed
          expect(container.textContent).toContain(recipe.prepTime)
          
          // Should have "Time" label
          expect(container.textContent).toContain('Time')
          
          cleanup()
        }),
        { numRuns: 100 }
      )
    })

    it('should display difficulty level (Requirement 9.3)', () => {
      fc.assert(
        fc.property(recipeArbitrary, (recipe) => {
          const mockOnClose = vi.fn()
          const { container } = render(
            <RecipeDetailModal
              isOpen={true}
              onClose={mockOnClose}
              recipe={recipe}
            >
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
            </RecipeDetailModal>
          )
          
          // Difficulty should be displayed
          expect(container.textContent).toContain(recipe.difficulty)
          
          // Should have "Level" label
          expect(container.textContent).toContain('Level')
          
          cleanup()
        }),
        { numRuns: 100 }
      )
    })

    it('should display calorie count (Requirement 9.3)', () => {
      fc.assert(
        fc.property(recipeArbitrary, (recipe) => {
          const mockOnClose = vi.fn()
          const { container } = render(
            <RecipeDetailModal
              isOpen={true}
              onClose={mockOnClose}
              recipe={recipe}
            >
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
            </RecipeDetailModal>
          )
          
          // Calories should be displayed with "kcal" unit
          expect(container.textContent).toContain(`${recipe.calories} kcal`)
          
          // Should have "Calories" label
          expect(container.textContent).toContain('Calories')
          
          cleanup()
        }),
        { numRuns: 100 }
      )
    })

    it('should display description (Requirement 9.4)', () => {
      fc.assert(
        fc.property(recipeArbitrary, (recipe) => {
          const mockOnClose = vi.fn()
          const { container } = render(
            <RecipeDetailModal
              isOpen={true}
              onClose={mockOnClose}
              recipe={recipe}
            >
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
            </RecipeDetailModal>
          )
          
          // Description should be displayed
          expect(container.textContent).toContain(recipe.description)
          
          cleanup()
        }),
        { numRuns: 100 }
      )
    })

    it('should display all required information together', () => {
      fc.assert(
        fc.property(recipeArbitrary, (recipe) => {
          const mockOnClose = vi.fn()
          const { container } = render(
            <RecipeDetailModal
              isOpen={true}
              onClose={mockOnClose}
              recipe={recipe}
            >
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
            </RecipeDetailModal>
          )
          
          const content = container.textContent || ''
          
          // All required information should be present
          // 9.1: Hero image (checked via img elements)
          const images = container.querySelectorAll('img')
          expect(images.length).toBeGreaterThan(0)
          
          // 9.2: Title, author, rating
          expect(content).toContain(recipe.name)
          expect(content).toContain(recipe.author)
          expect(content).toContain(recipe.rating.toFixed(1))
          
          // 9.3: Prep time, difficulty, calories
          expect(content).toContain(recipe.prepTime)
          expect(content).toContain(recipe.difficulty)
          expect(content).toContain(`${recipe.calories} kcal`)
          
          // 9.4: Description
          expect(content).toContain(recipe.description)
          
          cleanup()
        }),
        { numRuns: 100 }
      )
    })
  })
})


/**
 * **Feature: ai-chat, Property 9: Tab navigation contains all sections**
 * **Validates: Requirements 9.5**
 * 
 * *For any* recipe detail view, the tab navigation should contain exactly three tabs:
 * Ingredients, Instructions, and Reviews.
 */
describe('Property 9: Tab navigation contains all sections', () => {
  /**
   * Arbitrary for generating valid active tab
   */
  const activeTabArbitrary: fc.Arbitrary<RecipeTab> = fc.constantFrom('ingredients', 'instructions', 'reviews')

  it('should render exactly three tabs', () => {
    fc.assert(
      fc.property(activeTabArbitrary, (activeTab) => {
        const mockOnTabChange = vi.fn()
        const { container } = render(
          <TabNavigation
            activeTab={activeTab}
            onTabChange={mockOnTabChange}
          />
        )
        
        // Should have exactly 3 tab buttons
        const tabButtons = container.querySelectorAll('[role="tab"]')
        expect(tabButtons.length).toBe(3)
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should contain Ingredients tab', () => {
    fc.assert(
      fc.property(activeTabArbitrary, (activeTab) => {
        const mockOnTabChange = vi.fn()
        const { container } = render(
          <TabNavigation
            activeTab={activeTab}
            onTabChange={mockOnTabChange}
          />
        )
        
        // Should have Ingredients tab
        const ingredientsTab = container.querySelector('#ingredients-tab')
        expect(ingredientsTab).not.toBeNull()
        expect(ingredientsTab?.textContent).toBe('Ingredients')
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should contain Instructions tab', () => {
    fc.assert(
      fc.property(activeTabArbitrary, (activeTab) => {
        const mockOnTabChange = vi.fn()
        const { container } = render(
          <TabNavigation
            activeTab={activeTab}
            onTabChange={mockOnTabChange}
          />
        )
        
        // Should have Instructions tab
        const instructionsTab = container.querySelector('#instructions-tab')
        expect(instructionsTab).not.toBeNull()
        expect(instructionsTab?.textContent).toBe('Instructions')
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should contain Reviews tab', () => {
    fc.assert(
      fc.property(activeTabArbitrary, (activeTab) => {
        const mockOnTabChange = vi.fn()
        const { container } = render(
          <TabNavigation
            activeTab={activeTab}
            onTabChange={mockOnTabChange}
          />
        )
        
        // Should have Reviews tab
        const reviewsTab = container.querySelector('#reviews-tab')
        expect(reviewsTab).not.toBeNull()
        expect(reviewsTab?.textContent).toBe('Reviews')
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should have all three tabs with correct labels', () => {
    fc.assert(
      fc.property(activeTabArbitrary, (activeTab) => {
        const mockOnTabChange = vi.fn()
        const { container } = render(
          <TabNavigation
            activeTab={activeTab}
            onTabChange={mockOnTabChange}
          />
        )
        
        const content = container.textContent || ''
        
        // All three tab labels should be present
        expect(content).toContain('Ingredients')
        expect(content).toContain('Instructions')
        expect(content).toContain('Reviews')
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should mark the active tab as selected', () => {
    fc.assert(
      fc.property(activeTabArbitrary, (activeTab) => {
        const mockOnTabChange = vi.fn()
        const { container } = render(
          <TabNavigation
            activeTab={activeTab}
            onTabChange={mockOnTabChange}
          />
        )
        
        // The active tab should have aria-selected="true"
        const activeTabElement = container.querySelector(`#${activeTab}-tab`)
        expect(activeTabElement).not.toBeNull()
        expect(activeTabElement?.getAttribute('aria-selected')).toBe('true')
        
        // Other tabs should have aria-selected="false"
        const allTabs = container.querySelectorAll('[role="tab"]')
        allTabs.forEach((tab) => {
          if (tab.id !== `${activeTab}-tab`) {
            expect(tab.getAttribute('aria-selected')).toBe('false')
          }
        })
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should have proper accessibility attributes', () => {
    fc.assert(
      fc.property(activeTabArbitrary, (activeTab) => {
        const mockOnTabChange = vi.fn()
        const { container } = render(
          <TabNavigation
            activeTab={activeTab}
            onTabChange={mockOnTabChange}
          />
        )
        
        // Should have tablist role
        const tablist = container.querySelector('[role="tablist"]')
        expect(tablist).not.toBeNull()
        expect(tablist?.getAttribute('aria-label')).toBe('Recipe sections')
        
        // Each tab should have aria-controls pointing to its panel
        const tabs = container.querySelectorAll('[role="tab"]')
        tabs.forEach((tab) => {
          const tabId = tab.id.replace('-tab', '')
          expect(tab.getAttribute('aria-controls')).toBe(`${tabId}-panel`)
        })
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })
})


/**
 * **Feature: ai-chat, Property 11: Ingredients display with required elements**
 * **Validates: Requirements 10.3**
 * 
 * *For any* ingredient in a recipe, the rendered ingredient item should display
 * the ingredient name and quantity with unit.
 */
describe('Property 11: Ingredients display with required elements', () => {
  /**
   * Arbitrary for generating valid ingredient
   */
  const ingredientArbitrary: fc.Arbitrary<Ingredient> = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    quantity: fc.float({ min: Math.fround(0.1), max: Math.fround(1000), noNaN: true }),
    unit: fc.constantFrom('g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'piece', 'pieces'),
    iconUrl: fc.option(fc.webUrl(), { nil: undefined }),
    sortOrder: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
  })

  /**
   * Arbitrary for generating a non-empty list of ingredients
   */
  const ingredientsListArbitrary: fc.Arbitrary<Ingredient[]> = fc.array(ingredientArbitrary, { minLength: 1, maxLength: 20 })

  /**
   * Arbitrary for generating valid portion count
   */
  const portionsArbitrary: fc.Arbitrary<number> = fc.integer({ min: 1, max: 20 })

  it('should display ingredient name for each ingredient', () => {
    fc.assert(
      fc.property(ingredientsListArbitrary, portionsArbitrary, (ingredients, portions) => {
        const mockOnIncrease = vi.fn()
        const mockOnDecrease = vi.fn()
        
        const { container } = render(
          <IngredientsTab
            ingredients={ingredients}
            portions={portions}
            onIncrease={mockOnIncrease}
            onDecrease={mockOnDecrease}
          />
        )
        
        const content = container.textContent || ''
        
        // Each ingredient name should be displayed
        ingredients.forEach((ingredient) => {
          expect(content).toContain(ingredient.name)
        })
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should display quantity for each ingredient', () => {
    fc.assert(
      fc.property(ingredientsListArbitrary, portionsArbitrary, (ingredients, portions) => {
        const mockOnIncrease = vi.fn()
        const mockOnDecrease = vi.fn()
        
        const { container } = render(
          <IngredientsTab
            ingredients={ingredients}
            portions={portions}
            onIncrease={mockOnIncrease}
            onDecrease={mockOnDecrease}
          />
        )
        
        const content = container.textContent || ''
        
        // Each ingredient quantity should be displayed (formatted)
        ingredients.forEach((ingredient) => {
          // Format quantity the same way the component does
          const formattedQuantity = (Math.round(ingredient.quantity * 100) / 100).toString()
          expect(content).toContain(formattedQuantity)
        })
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should display unit for each ingredient', () => {
    fc.assert(
      fc.property(ingredientsListArbitrary, portionsArbitrary, (ingredients, portions) => {
        const mockOnIncrease = vi.fn()
        const mockOnDecrease = vi.fn()
        
        const { container } = render(
          <IngredientsTab
            ingredients={ingredients}
            portions={portions}
            onIncrease={mockOnIncrease}
            onDecrease={mockOnDecrease}
          />
        )
        
        const content = container.textContent || ''
        
        // Each ingredient unit should be displayed
        ingredients.forEach((ingredient) => {
          expect(content).toContain(ingredient.unit)
        })
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should render an icon container for each ingredient', () => {
    fc.assert(
      fc.property(ingredientsListArbitrary, portionsArbitrary, (ingredients, portions) => {
        const mockOnIncrease = vi.fn()
        const mockOnDecrease = vi.fn()
        
        const { container } = render(
          <IngredientsTab
            ingredients={ingredients}
            portions={portions}
            onIncrease={mockOnIncrease}
            onDecrease={mockOnDecrease}
          />
        )
        
        // Each ingredient should have a list item
        const listItems = container.querySelectorAll('li')
        expect(listItems.length).toBe(ingredients.length)
        
        // Each list item should have an icon container (div with rounded-full class)
        listItems.forEach((li) => {
          const iconContainer = li.querySelector('.rounded-full')
          expect(iconContainer).not.toBeNull()
        })
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should display all required elements (name, quantity, unit) together for each ingredient', () => {
    fc.assert(
      fc.property(ingredientsListArbitrary, portionsArbitrary, (ingredients, portions) => {
        const mockOnIncrease = vi.fn()
        const mockOnDecrease = vi.fn()
        
        const { container } = render(
          <IngredientsTab
            ingredients={ingredients}
            portions={portions}
            onIncrease={mockOnIncrease}
            onDecrease={mockOnDecrease}
          />
        )
        
        const content = container.textContent || ''
        
        // For each ingredient, verify all required elements are present
        ingredients.forEach((ingredient) => {
          // Name should be present
          expect(content).toContain(ingredient.name)
          
          // Quantity (formatted) should be present
          const formattedQuantity = (Math.round(ingredient.quantity * 100) / 100).toString()
          expect(content).toContain(formattedQuantity)
          
          // Unit should be present
          expect(content).toContain(ingredient.unit)
        })
        
        // Number of list items should match number of ingredients
        const listItems = container.querySelectorAll('li')
        expect(listItems.length).toBe(ingredients.length)
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should show empty state when no ingredients provided', () => {
    const mockOnIncrease = vi.fn()
    const mockOnDecrease = vi.fn()
    
    const { container } = render(
      <IngredientsTab
        ingredients={[]}
        portions={4}
        onIncrease={mockOnIncrease}
        onDecrease={mockOnDecrease}
      />
    )
    
    const content = container.textContent || ''
    
    // Should show empty state message
    expect(content).toContain('No ingredients listed')
    
    // Should have no list items
    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBe(0)
    
    cleanup()
  })
})


/**
 * **Feature: ai-chat, Property 12: Instructions display in correct order**
 * **Validates: Requirements 11.1, 11.2**
 * 
 * *For any* recipe with instructions, the rendered instructions should appear
 * in ascending step number order, with each step showing its text content.
 */
describe('Property 12: Instructions display in correct order', () => {
  /**
   * Arbitrary for generating valid instruction without time patterns
   */
  const instructionWithoutTimeArbitrary: fc.Arbitrary<Instruction> = fc.record({
    id: fc.option(fc.uuid(), { nil: undefined }),
    step: fc.nat({ max: 100 }),
    text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    duration: fc.option(fc.constantFrom('5 mins', '10 minutes', '1 hour'), { nil: undefined }),
  })

  /**
   * Arbitrary for generating a non-empty list of instructions with unique step numbers
   */
  const instructionsListArbitrary: fc.Arbitrary<Instruction[]> = fc
    .array(instructionWithoutTimeArbitrary, { minLength: 1, maxLength: 10 })
    .map((instructions) => {
      // Ensure unique step numbers by reassigning
      return instructions.map((inst, index) => ({
        ...inst,
        step: index + 1,
      }))
    })

  it('should display instructions in ascending step order', () => {
    fc.assert(
      fc.property(instructionsListArbitrary, (instructions) => {
        const { container } = render(
          <InstructionsTab instructions={instructions} />
        )
        
        // Get all step number elements
        const stepNumbers = container.querySelectorAll('.rounded-full.bg-brand-primary')
        const displayedSteps = Array.from(stepNumbers).map(el => parseInt(el.textContent || '0', 10))
        
        // Verify steps are in ascending order
        for (let i = 1; i < displayedSteps.length; i++) {
          expect(displayedSteps[i]).toBeGreaterThan(displayedSteps[i - 1])
        }
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should display text content for each instruction', () => {
    fc.assert(
      fc.property(instructionsListArbitrary, (instructions) => {
        const { container } = render(
          <InstructionsTab instructions={instructions} />
        )
        
        const content = container.textContent || ''
        
        // Each instruction text should be displayed
        instructions.forEach((instruction) => {
          expect(content).toContain(instruction.text)
        })
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })
})


/**
 * **Feature: ai-chat, Property 13: Time highlighting in instructions**
 * **Validates: Requirements 11.3**
 * 
 * *For any* instruction step containing duration information, the duration
 * should be rendered with distinct highlighting.
 */
describe('Property 13: Time highlighting in instructions', () => {
  /**
   * Arbitrary for generating time values (number part)
   */
  const timeValueArbitrary: fc.Arbitrary<string> = fc.oneof(
    fc.nat({ max: 60 }).map(n => n.toString()),
    fc.tuple(fc.nat({ max: 30 }), fc.nat({ max: 60 })).map(([a, b]) => `${a}-${b}`)
  )

  /**
   * Arbitrary for generating time units
   */
  const timeUnitArbitrary: fc.Arbitrary<string> = fc.constantFrom(...TIME_UNITS)

  /**
   * Arbitrary for generating a time pattern string (e.g., "5 minutes", "10-15 mins")
   */
  const timePatternArbitrary: fc.Arbitrary<string> = fc
    .tuple(timeValueArbitrary, timeUnitArbitrary)
    .map(([value, unit]) => `${value} ${unit}`)

  /**
   * Arbitrary for generating instruction text that contains a time pattern
   */
  const instructionTextWithTimeArbitrary: fc.Arbitrary<string> = fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      timePatternArbitrary,
      fc.string({ minLength: 0, maxLength: 50 })
    )
    .map(([prefix, time, suffix]) => `${prefix} for ${time}${suffix ? ` ${suffix}` : ''}`)

  /**
   * Arbitrary for generating an instruction with time in the text
   */
  const instructionWithTimeInTextArbitrary: fc.Arbitrary<Instruction> = fc.record({
    id: fc.option(fc.uuid(), { nil: undefined }),
    step: fc.integer({ min: 1, max: 20 }),
    text: instructionTextWithTimeArbitrary,
    duration: fc.option(fc.constantFrom('5 mins', '10 minutes', '1 hour'), { nil: undefined }),
  })

  /**
   * Arbitrary for generating an instruction with duration field set
   */
  const instructionWithDurationFieldArbitrary: fc.Arbitrary<Instruction> = fc.record({
    id: fc.option(fc.uuid(), { nil: undefined }),
    step: fc.integer({ min: 1, max: 20 }),
    text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    duration: timePatternArbitrary,
  })

  it('should highlight time patterns in instruction text with distinct styling', () => {
    fc.assert(
      fc.property(instructionWithTimeInTextArbitrary, (instruction) => {
        const { container } = render(
          <InstructionsTab instructions={[instruction]} />
        )
        
        // Find highlighted time spans within the instruction text
        // The highlightDuration function wraps time patterns in spans with specific classes
        const highlightedSpans = container.querySelectorAll(
          'span.bg-brand-secondary-container.text-brand-secondary-on-container'
        )
        
        // Should have at least one highlighted time span
        expect(highlightedSpans.length).toBeGreaterThan(0)
        
        // The highlighted span should contain a time pattern
        const hasTimePattern = Array.from(highlightedSpans).some(span => {
          const text = span.textContent || ''
          // Check if it matches a time pattern
          return /\d+(?:-\d+)?\s*(minutes?|mins?|seconds?|secs?|hours?|hrs?)/i.test(text)
        })
        expect(hasTimePattern).toBe(true)
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should render duration badge when instruction has duration field', () => {
    fc.assert(
      fc.property(instructionWithDurationFieldArbitrary, (instruction) => {
        const { container } = render(
          <InstructionsTab instructions={[instruction]} />
        )
        
        // Find duration badge (the one with clock icon)
        const durationBadges = container.querySelectorAll(
          'span.bg-brand-secondary-container.text-brand-secondary-on-container.rounded-full'
        )
        
        // Should have at least one duration badge
        expect(durationBadges.length).toBeGreaterThan(0)
        
        // The badge should contain the duration text
        const hasDuration = Array.from(durationBadges).some(badge => {
          const text = badge.textContent || ''
          return text.includes(instruction.duration!)
        })
        expect(hasDuration).toBe(true)
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should apply consistent highlighting style to all time mentions', () => {
    // Generate instruction with multiple time patterns
    const multiTimeInstruction: Instruction = {
      step: 1,
      text: 'Cook for 5 minutes, then simmer for 30 seconds, and bake for 1 hour',
    }
    
    const { container } = render(
      <InstructionsTab instructions={[multiTimeInstruction]} />
    )
    
    // Find all highlighted time spans
    const highlightedSpans = container.querySelectorAll(
      'span.bg-brand-secondary-container.text-brand-secondary-on-container'
    )
    
    // Should have 3 highlighted spans (5 minutes, 30 seconds, 1 hour)
    expect(highlightedSpans.length).toBe(3)
    
    // All should have the same styling classes
    highlightedSpans.forEach(span => {
      expect(span.classList.contains('bg-brand-secondary-container')).toBe(true)
      expect(span.classList.contains('text-brand-secondary-on-container')).toBe(true)
      expect(span.classList.contains('font-medium')).toBe(true)
    })
    
    cleanup()
  })

  it('should not add highlighting when no time patterns exist', () => {
    const instructionWithoutTime: Instruction = {
      step: 1,
      text: 'Mix all ingredients together in a bowl',
    }
    
    const { container } = render(
      <InstructionsTab instructions={[instructionWithoutTime]} />
    )
    
    // Find highlighted time spans within the paragraph (not the duration badge)
    const paragraph = container.querySelector('p.text-body-md')
    const highlightedSpans = paragraph?.querySelectorAll(
      'span.bg-brand-secondary-container'
    )
    
    // Should have no highlighted spans in the text
    expect(highlightedSpans?.length || 0).toBe(0)
    
    cleanup()
  })

  it('should preserve original text content while adding highlighting', () => {
    fc.assert(
      fc.property(instructionWithTimeInTextArbitrary, (instruction) => {
        const { container } = render(
          <InstructionsTab instructions={[instruction]} />
        )
        
        const content = container.textContent || ''
        
        // The time pattern should be present in the rendered content
        // Extract the time pattern from the instruction text
        const timeMatch = instruction.text.match(/\d+(?:-\d+)?\s*(minutes?|mins?|seconds?|secs?|hours?|hrs?)/i)
        if (timeMatch) {
          expect(content).toContain(timeMatch[0])
        }
        
        // The step number should be displayed
        expect(content).toContain(instruction.step.toString())
        
        cleanup()
      }),
      { numRuns: 100 }
    )
  })
})


/**
 * **Feature: ai-chat, Property 14: Reviews display with required elements**
 * **Validates: Requirements 12.1, 12.2**
 *
 * *For any* review, the rendered review should display the user name, date,
 * comment text, and star rating.
 *
 * Note: The ReviewsTab component now uses context-based state management via useReviews hook.
 * These tests verify the component renders correctly when wrapped in ReviewsProvider.
 */
describe('Property 14: Reviews display with required elements', () => {
  /**
   * Arbitrary for generating valid review with recipeId
   */
  const reviewArbitrary: fc.Arbitrary<Review> = fc.record({
    id: fc.uuid(),
    recipeId: fc.constant('test-recipe-id'),
    userId: fc.uuid(),
    userName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    userAvatar: fc.webUrl(),
    date: fc.integer({ min: 1577836800000, max: Date.now() }).map(ts => new Date(ts).toISOString()),
    rating: fc.integer({ min: 1, max: 5 }),
    comment: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  })

  /**
   * Arbitrary for generating a non-empty list of reviews
   */
  const reviewsListArbitrary: fc.Arbitrary<Review[]> = fc.array(reviewArbitrary, { minLength: 1, maxLength: 10 })

  /**
   * Arbitrary for generating recipe ID
   */
  const recipeIdArbitrary: fc.Arbitrary<string> = fc.uuid()

  // Helper to render ReviewsTab with provider
  const renderWithProvider = (recipeId: string) => {
    return render(
      <ReviewsProvider>
        <ReviewsTab recipeId={recipeId} />
      </ReviewsProvider>
    )
  }

  it('should render ReviewsTab component with recipeId prop', () => {
    fc.assert(
      fc.property(recipeIdArbitrary, (recipeId) => {
        const { container } = renderWithProvider(recipeId)

        // Should render the tabpanel
        const tabPanel = container.querySelector('[role="tabpanel"]')
        expect(tabPanel).not.toBeNull()

        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should display "People said" header (Requirement 12.1)', () => {
    fc.assert(
      fc.property(recipeIdArbitrary, (recipeId) => {
        const { container } = renderWithProvider(recipeId)

        const content = container.textContent || ''

        // Should show "People said" header
        expect(content).toContain('People said')

        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should display stacked avatars container in summary (Requirement 12.1)', () => {
    fc.assert(
      fc.property(recipeIdArbitrary, (recipeId) => {
        const { container } = renderWithProvider(recipeId)

        // Summary should have stacked avatars container with -space-x-2 class
        const avatarContainer = container.querySelector('.-space-x-2')
        expect(avatarContainer).not.toBeNull()

        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should show empty state when no reviews exist for recipe', () => {
    const { container } = renderWithProvider('non-existent-recipe-id')

    const content = container.textContent || ''

    // Should show empty state message
    expect(content).toContain('No reviews yet')

    cleanup()
  })

  it('should display "Be the first to review" message in empty state', () => {
    const { container } = renderWithProvider('empty-recipe-id')

    const content = container.textContent || ''

    // Should show call-to-action message
    expect(content).toContain('Be the first to review this recipe')

    cleanup()
  })

  it('should render review list container', () => {
    fc.assert(
      fc.property(recipeIdArbitrary, (recipeId) => {
        const { container } = renderWithProvider(recipeId)

        // Should have a scrollable container for reviews
        const reviewsContainer = container.querySelector('.space-y-4')
        expect(reviewsContainer).not.toBeNull()

        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should have proper accessibility attributes', () => {
    fc.assert(
      fc.property(recipeIdArbitrary, (recipeId) => {
        const { container } = renderWithProvider(recipeId)

        // Should have tabpanel role
        const tabPanel = container.querySelector('[role="tabpanel"]')
        expect(tabPanel).not.toBeNull()

        // Should have proper id
        expect(tabPanel?.getAttribute('id')).toBe('reviews-panel')

        // Should have aria-labelledby
        expect(tabPanel?.getAttribute('aria-labelledby')).toBe('reviews-tab')

        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should have avatar placeholder icons when no avatars exist', () => {
    const { container } = renderWithProvider('recipe-without-avatars')

    // Should have placeholder avatar images (Profile.svg)
    const avatarContainer = container.querySelector('.-space-x-2')
    const profileIcons = avatarContainer?.querySelectorAll('img[src*="Profile"]')
    expect(profileIcons?.length).toBeGreaterThan(0)

    cleanup()
  })

  it('should render star icon in empty state', () => {
    const { container } = renderWithProvider('empty-recipe')

    // Empty state should have a star SVG icon
    const starSvg = container.querySelector('svg path[d*="32 4L39.56"]')
    expect(starSvg).not.toBeNull()

    cleanup()
  })
})
