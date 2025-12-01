'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/gsap'
import { useGeneratedRecipes, detectRecipeTags } from '@/hooks'
import { flattenTags, type RecipeTags } from '@/types/recipe-tags'

// Define the conversation flow
interface ChatStep {
  id: string
  question: string
  options: string[]
  multiSelect?: boolean
}

const chatFlow: ChatStep[] = [
  {
    id: 'cuisine',
    question: "What type of cuisine are you in the mood for today?",
    options: ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'French'],
  },
  {
    id: 'meal',
    question: "What meal are you planning?",
    options: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'],
  },
  {
    id: 'time',
    question: "How much time do you have?",
    options: ['Quick (15 min)', 'Medium (30 min)', 'Relaxed (1 hour)', 'No rush (1+ hour)'],
  },
  {
    id: 'difficulty',
    question: "What's your cooking skill level?",
    options: ['Beginner', 'Intermediate', 'Advanced'],
  },
  {
    id: 'dietary',
    question: "Any dietary preferences?",
    options: ['No restrictions', 'Vegetarian', 'Vegan', 'Gluten-free', 'Low-carb', 'Dairy-free'],
    multiSelect: true,
  },
  {
    id: 'ingredients',
    question: "Do you have a main ingredient in mind?",
    options: ['Chicken', 'Beef', 'Fish', 'Pasta', 'Vegetables', 'Surprise me!'],
  },
]

// Generated recipe type
interface GeneratedRecipe {
  id: string
  name: string
  description: string
  ingredients: Array<{ name: string; quantity: number; unit: string }>
  instructions: string[]
  prepTime: string
  cookTime: string
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  calories?: number
  imageUrl?: string
}

// Build prompt from selections
const buildRecipePrompt = (selections: Record<string, string | string[]>): string => {
  const cuisine = selections.cuisine as string
  const meal = selections.meal as string
  const time = selections.time as string
  const difficulty = selections.difficulty as string
  const dietary = selections.dietary as string | string[]
  const ingredient = selections.ingredients as string

  const dietaryStr = Array.isArray(dietary) ? dietary.join(', ') : dietary

  return `Generate a ${cuisine} ${meal.toLowerCase()} recipe that:
- Can be prepared in ${time}
- Is suitable for ${difficulty.toLowerCase()} level cooks
- Dietary preferences: ${dietaryStr}
- Main ingredient: ${ingredient}

Please provide a complete recipe with name, description, ingredients with quantities, and step-by-step instructions.`
}

interface Message {
  id: string
  type: 'assistant' | 'user'
  content: string
  options?: string[]
  multiSelect?: boolean
  isComplete?: boolean
  generatedRecipe?: GeneratedRecipe
}

export function GuidedChat() {
  const router = useRouter()
  const { addGeneratedRecipe } = useGeneratedRecipes()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string | string[]>>({})
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize with welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: "Hi! I'm your personal chef assistant. Let me help you find the perfect recipe. 👨‍🍳",
        },
      ])

      // Add first question after a delay
      setTimeout(() => {
        addAssistantMessage(chatFlow[0])
      }, 800)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Animate new messages
  useEffect(() => {
    if (containerRef.current) {
      const lastMessage = containerRef.current.querySelector('[data-message]:last-child')
      if (lastMessage) {
        gsap.fromTo(
          lastMessage,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
      }
    }
  }, [messages])

  const addAssistantMessage = (step: ChatStep) => {
    setMessages(prev => [
      ...prev,
      {
        id: step.id,
        type: 'assistant',
        content: step.question,
        options: step.options,
        multiSelect: step.multiSelect,
      },
    ])
  }

  const handleOptionSelect = (option: string, multiSelect?: boolean) => {
    if (multiSelect) {
      setSelectedOptions(prev =>
        prev.includes(option)
          ? prev.filter(o => o !== option)
          : [...prev, option]
      )
    } else {
      // Single select - immediately proceed
      processSelection(option)
    }
  }

  const handleConfirmMultiSelect = () => {
    if (selectedOptions.length > 0) {
      processSelection(selectedOptions)
      setSelectedOptions([])
    }
  }

  const processSelection = (selection: string | string[]) => {
    const currentStepData = chatFlow[currentStep]

    // Add user's selection as a message
    const displaySelection = Array.isArray(selection) ? selection.join(', ') : selection
    setMessages(prev => [
      ...prev.map(m => m.id === currentStepData.id ? { ...m, options: undefined } : m),
      {
        id: `user-${currentStepData.id}`,
        type: 'user',
        content: displaySelection,
      },
    ])

    // Store selection
    setSelections(prev => ({
      ...prev,
      [currentStepData.id]: selection,
    }))

    // Move to next step or complete
    if (currentStep < chatFlow.length - 1) {
      setCurrentStep(prev => prev + 1)
      setTimeout(() => {
        addAssistantMessage(chatFlow[currentStep + 1])
      }, 600)
    } else {
      // All questions answered - generate recipe
      setTimeout(() => {
        generateRecipe({ ...selections, [currentStepData.id]: selection })
      }, 600)
    }
  }

  const generateRecipe = async (allSelections: Record<string, string | string[]>) => {
    setIsGenerating(true)

    // Add generating message
    setMessages(prev => [
      ...prev,
      {
        id: 'generating',
        type: 'assistant',
        content: "Perfect! Let me create the ideal recipe for you... 🔍",
      },
    ])

    try {
      // Build prompt from selections
      const prompt = buildRecipePrompt(allSelections)

      // Call chat API to generate recipe
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      })

      const chatData = await chatResponse.json()

      if (chatData.error || !chatData.recipes || chatData.recipes.length === 0) {
        throw new Error(chatData.error || 'Failed to generate recipe')
      }

      const recipe = chatData.recipes[0]

      // Update message to show generating image
      setMessages(prev => [
        ...prev.map(m => m.id === 'generating'
          ? { ...m, content: "Recipe created! Now generating a beautiful image... 🎨" }
          : m
        ),
      ])

      // Call image API to generate recipe image
      let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop' // fallback
      try {
        const imageResponse = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeName: recipe.name,
            description: recipe.description
          }),
        })

        const imageData = await imageResponse.json()
        if (imageData.imageUrl) {
          imageUrl = imageData.imageUrl
        }
      } catch (imgError) {
        console.warn('Image generation failed, using fallback:', imgError)
      }

      // Create the generated recipe object
      const generatedRecipe: GeneratedRecipe = {
        id: `generated-${Date.now()}`,
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        imageUrl,
      }

      // Store in sessionStorage for the detail page to access
      sessionStorage.setItem('generatedRecipe', JSON.stringify(generatedRecipe))

      // Detect structured tags using the new 2025 best practices system
      const structuredTags: RecipeTags = detectRecipeTags({
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        calories: recipe.calories,
        difficulty: recipe.difficulty,
        cuisine: selections.cuisine as string,
        mealType: selections.meal as string,
      })

      // Get flat categories for backward compatibility
      const categories = flattenTags(structuredTags)

      // Add user selections as additional categories
      const cuisine = selections.cuisine as string
      const meal = selections.meal as string
      const dietary = selections.dietary as string | string[]
      const ingredient = selections.ingredients as string

      if (cuisine) categories.push(cuisine.toLowerCase())
      if (meal) categories.push(meal.toLowerCase())
      if (ingredient && ingredient !== 'Surprise me!') categories.push(ingredient.toLowerCase())
      if (Array.isArray(dietary)) {
        dietary.forEach(d => {
          if (d !== 'No restrictions') categories.push(d.toLowerCase())
        })
      } else if (dietary && dietary !== 'No restrictions') {
        categories.push(dietary.toLowerCase())
      }

      // Add 'new' and 'generated' markers
      categories.push('new', 'generated')

      addGeneratedRecipe({
        id: generatedRecipe.id,
        title: recipe.name,
        description: recipe.description,
        imageUrl: imageUrl || '',
        rating: 5.0,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cuisine: cuisine,
        mealType: meal,
        tags: structuredTags, // Store structured tags for 2025 best practices
        categories: Array.from(new Set(categories)), // Legacy flat categories for backward compatibility
      })

      setMessages(prev => [
        ...prev.filter(m => m.id !== 'generating'),
        {
          id: 'complete',
          type: 'assistant',
          content: `I've created "${recipe.name}" just for you! It's a ${recipe.difficulty.toLowerCase()} recipe that takes about ${recipe.prepTime}. Ready to start cooking?`,
          isComplete: true,
          generatedRecipe,
        },
      ])
    } catch (error) {
      console.error('Recipe generation failed:', error)
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'generating'),
        {
          id: 'error',
          type: 'assistant',
          content: "I'm sorry, I couldn't generate a recipe right now. Please try again.",
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleViewRecipe = () => {
    // Navigate to the generated recipe page
    router.push('/recipe/generated')
  }

  const handleStartOver = () => {
    setMessages([])
    setCurrentStep(0)
    setSelections({})
    setSelectedOptions([])
    setIsGenerating(false)

    setTimeout(() => {
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: "Hi! I'm your personal chef assistant. Let me help you find the perfect recipe. 👨‍🍳",
        },
      ])

      setTimeout(() => {
        addAssistantMessage(chatFlow[0])
      }, 800)
    }, 300)
  }

  return (
    <div className="flex h-full flex-col bg-neutral-50">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-neutral-100 bg-white px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10">
          <Image
            src="/assets/icons/Chef's Hat.svg"
            alt="AI Assistant"
            width={24}
            height={24}
            className="opacity-80"
          />
        </div>
        <div>
          <h1 className="text-body-lg font-semibold">KitchenPal AI</h1>
          <p className="text-label-sm text-muted-foreground">
            Your cooking assistant
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 pb-8">
        {messages.map((message) => (
          <div
            key={message.id}
            data-message
            className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white shadow-sm'
              }`}
            >
              <p className="text-body-md">{message.content}</p>

              {/* Options */}
              {message.options && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.options.map((option) => {
                    const isSelected = selectedOptions.includes(option)
                    return (
                      <button
                        key={option}
                        onClick={() => handleOptionSelect(option, message.multiSelect)}
                        disabled={isGenerating}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-brand-primary text-white'
                            : 'bg-neutral-100 text-foreground hover:bg-brand-primary/10 active:scale-95'
                        } disabled:opacity-50`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Confirm button for multi-select */}
              {message.multiSelect && message.options && selectedOptions.length > 0 && (
                <button
                  onClick={handleConfirmMultiSelect}
                  className="mt-3 w-full rounded-full bg-brand-primary py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-primary-dark active:scale-[0.98]"
                >
                  Continue with {selectedOptions.length} selected
                </button>
              )}

              {/* View Recipe Button */}
              {message.isComplete && message.generatedRecipe && (
                <div className="mt-4 space-y-3">
                  {/* Recipe Preview */}
                  {message.generatedRecipe.imageUrl && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3">
                      <Image
                        src={message.generatedRecipe.imageUrl}
                        alt={message.generatedRecipe.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleViewRecipe}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-primary py-3 text-base font-medium text-white transition-all hover:bg-brand-primary-dark active:scale-[0.98]"
                  >
                    <Image
                      src="/assets/icons/Fork.svg"
                      alt=""
                      width={20}
                      height={20}
                      className="invert"
                    />
                    View Recipe
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="w-full rounded-full border border-neutral-200 bg-white py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-neutral-50 active:scale-[0.98]"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Generating indicator */}
        {isGenerating && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted-foreground">Finding your recipe...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
