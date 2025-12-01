'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/gsap'
import { useGeneratedRecipes, detectRecipeTags } from '@/hooks'
import { flattenTags, type RecipeTags } from '@/types/recipe-tags'
import { ChatInput } from '@/components/chat/ChatInput'

// Define the conversation flow
interface ChatStep {
  id: string
  question: string
  options: string[]
  multiSelect?: boolean
}

const chatFlow: ChatStep[] = [
  {
    id: 'ingredients',
    question: "What treasures do you have in your kitchen today? Share a couple of ingredients you'd love to cook with, and let's whip up something delightful together!",
    options: ['Chicken', 'Beef', 'Fish', 'Pasta', 'Vegetables', 'Eggs'],
  },
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
  const ingredients = selections.ingredients as string
  const cuisine = selections.cuisine as string
  const meal = selections.meal as string
  const time = selections.time as string
  const difficulty = selections.difficulty as string
  const dietary = selections.dietary as string | string[]

  const dietaryStr = Array.isArray(dietary) ? dietary.join(', ') : dietary

  return `Generate a ${cuisine} ${meal.toLowerCase()} recipe with these requirements:
- Main ingredient: ${ingredients}
- Preparation time: ${time}
- Skill level: ${difficulty.toLowerCase()}
- Dietary preferences: ${dietaryStr}

IMPORTANT: You MUST respond with a JSON object in this exact format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description of the dish",
      "ingredients": [{"name": "ingredient name", "quantity": 1, "unit": "cup"}],
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "prepTime": "15 mins",
      "cookTime": "30 mins",
      "servings": 4,
      "difficulty": "Easy",
      "calories": 350
    }
  ]
}

Provide exactly one recipe that matches all the requirements.`
}

interface Message {
  id: string
  type: 'assistant' | 'user'
  content: string
  options?: string[]
  multiSelect?: boolean
  isComplete?: boolean
  generatedRecipe?: GeneratedRecipe
  isRecipeCard?: boolean
  detectedName?: string
  ctaType?: 'recipe-from-image'
}

export function FreeformChat() {
  const router = useRouter()
  const { addGeneratedRecipe } = useGeneratedRecipes()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string | string[]>>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const hasScrolledOnce = useRef(false)

  // Initialize with welcome message and first question immediately
  useEffect(() => {
    // Set initial messages immediately without delays
    setMessages([
      {
        id: 'welcome',
        type: 'assistant',
        content: "Hi There, 🥗",
      },
      {
        id: chatFlow[0].id,
        type: 'assistant',
        content: chatFlow[0].question,
        options: chatFlow[0].options,
        multiSelect: chatFlow[0].multiSelect,
      },
    ])
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      if (!hasScrolledOnce.current) {
        hasScrolledOnce.current = true
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' })
        return
      }
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, selectedOption, selectedOptions])

  // Animate new messages (skip initial load)
  const isInitialLoad = useRef(true)
  useEffect(() => {
    // Skip animation on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    if (containerRef.current) {
      const lastMessage = containerRef.current.querySelector('[data-message]:last-child')
      if (lastMessage) {
        gsap.fromTo(
          lastMessage,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
        )
      }
    }
  }, [messages])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

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
      // For single select, auto-proceed after selection
      setSelectedOption(option)

      // Auto-proceed after a short delay for visual feedback
      setTimeout(() => {
        processSelection(option)
      }, 300)
    }
  }

  const handleConfirmMultiSelect = () => {
    if (selectedOptions.length > 0) {
      processSelection(selectedOptions)
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

    // Reset selections
    setSelectedOption(null)
    setSelectedOptions([])

    // Move to next step or complete
    if (currentStep < chatFlow.length - 1) {
      setCurrentStep(prev => prev + 1)
      setTimeout(() => {
        addAssistantMessage(chatFlow[currentStep + 1])
      }, 400)
    } else {
      // All questions answered - generate recipe
      setTimeout(() => {
        generateRecipe({ ...selections, [currentStepData.id]: selection })
      }, 400)
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
      if (ingredient) categories.push(ingredient.toLowerCase())
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

      // Format ingredients for display
      const ingredientsList = recipe.ingredients
        .map((ing: { name: string; quantity: number; unit: string }) => ing.name)
        .join(', ')

      setMessages(prev => [
        ...prev.filter(m => m.id !== 'generating'),
        {
          id: 'recipe-card',
          type: 'assistant',
          content: '',
          isRecipeCard: true,
          generatedRecipe: {
            ...generatedRecipe,
            description: ingredientsList, // Use for ingredients display
          },
        },
        {
          id: 'complete',
          type: 'assistant',
          content: `Fantastic choice! 😊\nReady to start cooking up some delicious ${recipe.name} 🍴?\nClick the button below to view the full recipe details and get started in the kitchen!`,
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

  const generateQuickRecipeFromImage = async (dishName: string) => {
    const defaults: Record<string, string | string[]> = {
      ingredients: dishName,
      cuisine: 'International',
      meal: 'Dinner',
      time: 'Medium (30 min)',
      difficulty: 'Intermediate',
      dietary: 'No restrictions',
    }
    setSelections(defaults)
    await generateRecipe(defaults)
  }

  const handleViewRecipe = () => {
    router.push('/recipe/generated')
  }

  const handleStartOver = () => {
    setCurrentStep(0)
    setSelections({})
    setSelectedOption(null)
    setSelectedOptions([])
    setIsGenerating(false)
    hasScrolledOnce.current = false
    isInitialLoad.current = true

    // Reset messages immediately
    setMessages([
      {
        id: 'welcome',
        type: 'assistant',
        content: "Hi There, 🥗",
      },
      {
        id: chatFlow[0].id,
        type: 'assistant',
        content: chatFlow[0].question,
        options: chatFlow[0].options,
        multiSelect: chatFlow[0].multiSelect,
      },
    ])
  }

  // Get current options to display
  const currentMessage = messages.find(m => m.options && m.options.length > 0)
  const hasOptions = !!currentMessage?.options

  return (
    <div className="flex flex-1 flex-col bg-white pb-28">
      {/* Header - Fixed below tabs */}
      <div className="fixed top-[60px] left-0 right-0 z-40 bg-white border-b border-neutral-100">
        <div className="max-w-[768px] mx-auto flex items-center justify-end px-4 py-3">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-neutral-100 active:scale-95"
            >
              <Image
                src="/assets/icons/More-Vertical.svg"
                alt="Menu"
                width={24}
                height={24}
              />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 z-50 min-w-[160px] rounded-xl bg-white shadow-lg border border-neutral-100 py-2">
                <button
                  onClick={() => {
                    handleStartOver()
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground hover:bg-neutral-50 transition-colors"
                >
                  <Image
                    src="/assets/icons/Rotate-Left.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="opacity-70"
                  />
                  Reset Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Messages Area - with top padding for fixed header */}
        <div ref={containerRef} className="flex-1 px-4 pt-24 pb-6">
        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            data-message
            className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Recipe Card */}
            {message.isRecipeCard && message.generatedRecipe ? (
              <div className="max-w-[85%] rounded-2xl bg-neutral-100 px-4 py-4">
                <h3 className="font-semibold text-base text-foreground mb-2">
                  {message.generatedRecipe.name} 🍴
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Ingredients:</span> {message.generatedRecipe.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Preparation Time:</span> {message.generatedRecipe.prepTime}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Serving Size:</span> {message.generatedRecipe.servings} servings
                </p>
              </div>
            ) : message.isComplete && message.generatedRecipe ? (
              /* Complete message with View Recipe button */
              <div className="max-w-[85%] rounded-2xl bg-neutral-100 px-4 py-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">{message.content}</p>
                <button
                  onClick={handleViewRecipe}
                  className="w-full rounded-full bg-[#FF7A5C] py-3 text-base font-medium text-white transition-all hover:bg-[#E56A4C] active:scale-[0.98]"
                >
                  View Recipe
                </button>
              </div>
            ) : (
              /* Regular message bubble */
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-[#FDDDD5] text-foreground'
                    : 'bg-neutral-100 text-foreground'
                }`}
              >
                {message.id === 'welcome' ? (
                  <p className="font-semibold text-base">{message.content}</p>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
                {message.ctaType === 'recipe-from-image' && message.detectedName && (
                  <button
                    onClick={() => generateQuickRecipeFromImage(message.detectedName as string)}
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-[#FF7A5C] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#E56A4C] active:scale-[0.98]"
                  >
                    Send recipe
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Options - Displayed as a card on the right */}
        {hasOptions && currentMessage && !isGenerating && (
          <div data-message className="mb-4 flex justify-end">
            <div className="max-w-[85%] rounded-3xl bg-[#FDDDD5] p-5">
              <div className="divide-y divide-[#E8C4BC]">
                {currentMessage.options?.map((option, index) => {
                  const isSelected = currentMessage.multiSelect
                    ? selectedOptions.includes(option)
                    : selectedOption === option

                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option, currentMessage.multiSelect)}
                      className={`flex w-full items-center gap-4 text-left py-4 ${
                        index === 0 ? 'pt-0' : ''
                      } ${index === (currentMessage.options?.length || 0) - 1 ? 'pb-0' : ''}`}
                    >
                      {/* Radio button - exact style from design */}
                      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isSelected
                          ? 'border-[#FF7A5C]'
                          : 'border-neutral-500'
                      }`}>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-[#FF7A5C]" />
                        )}
                      </div>
                      <span className="text-base text-foreground">{option}</span>
                    </button>
                  )
                })}
              </div>

              {/* Confirm Button - Only for multi-select */}
              {currentMessage.multiSelect && selectedOptions.length > 0 && (
                <button
                  onClick={handleConfirmMultiSelect}
                  className="mt-4 w-full rounded-full bg-[#FF7A5C] py-3 text-base font-medium text-white transition-all hover:bg-[#E56A4C] active:scale-[0.98]"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isGenerating && (
          <div className="flex justify-start mb-4">
            <div className="bg-neutral-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

        <ChatInput onSend={(message) => {
          setMessages(prev => [...prev, { id: `user-${Date.now()}`, type: 'user', content: message }])
        }} />
      </div>
  )
}
