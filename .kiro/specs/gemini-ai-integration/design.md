# Gemini AI Integration Design Document

## Overview

This document outlines the technical design for integrating Google Gemini AI into KitchenPal's chat system. The integration includes two main capabilities: text generation using Gemini models for recipe suggestions and conversational AI, and image generation using Imagen 3 for creating appetizing food images. The design follows a service-oriented architecture with proper error handling, rate limiting, and testability.

## Architecture

```mermaid
graph TB
    subgraph "Frontend"
        ChatPage[Chat Page]
        useChat[useChat Hook]
    end
    
    subgraph "API Routes"
        ChatAPI[/api/chat/route.ts]
        ImageAPI[/api/image/route.ts]
    end
    
    subgraph "Services"
        GeminiService[Gemini Service]
        ImageService[Image Generation Service]
        PromptBuilder[Prompt Builder]
    end
    
    subgraph "External APIs"
        GeminiAPI[Google Gemini API]
        Imagen3[Imagen 3 API]
    end
    
    ChatPage --> useChat
    useChat --> ChatAPI
    ChatAPI --> GeminiService
    ChatAPI --> ImageService
    GeminiService --> PromptBuilder
    GeminiService --> GeminiAPI
    ImageService --> Imagen3
```

## Components and Interfaces

### Gemini Service

```typescript
interface GeminiServiceConfig {
  apiKey: string
  textModel: 'gemini-1.5-flash' | 'gemini-1.5-pro'
  maxTokens: number
  temperature: number
}

interface GeminiService {
  generateResponse(
    message: string,
    conversationHistory: ChatMessage[],
    userPreferences?: UserPreferences
  ): Promise<AIResponse>
  
  generateRecipeSuggestions(
    ingredients: string[],
    preferences?: UserPreferences
  ): Promise<RecipeSuggestion[]>
}

interface AIResponse {
  content: string
  quickReplies?: QuickReply[]
  recipeOptions?: RecipeOption[]
  recipes?: GeneratedRecipe[]
}

interface GeneratedRecipe {
  name: string
  description: string
  ingredients: IngredientItem[]
  instructions: string[]
  prepTime: string
  cookTime: string
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  calories?: number
}

interface IngredientItem {
  name: string
  quantity: number
  unit: string
}
```

### Image Generation Service

```typescript
interface ImageServiceConfig {
  apiKey: string
  model: 'imagen-3.0-generate-002'
}

interface ImageService {
  generateFoodImage(
    recipeName: string,
    description?: string
  ): Promise<GeneratedImage>
}

interface GeneratedImage {
  base64Data: string
  mimeType: 'image/png' | 'image/jpeg'
  url?: string // If uploaded to storage
}
```

### Prompt Builder

```typescript
interface PromptBuilder {
  buildSystemPrompt(preferences?: UserPreferences): string
  buildRecipePrompt(ingredients: string[], preferences?: UserPreferences): string
  buildImagePrompt(recipeName: string, description?: string): string
  formatConversationHistory(messages: ChatMessage[]): string
}
```

### API Route Types

```typescript
// POST /api/chat
interface ChatRequest {
  message: string
  conversationId?: string
  conversationHistory?: ChatMessage[]
}

interface ChatResponse {
  content: string
  quickReplies?: QuickReply[]
  recipeOptions?: RecipeOption[]
  recipes?: GeneratedRecipe[]
  error?: string
}

// POST /api/image
interface ImageRequest {
  recipeName: string
  description?: string
}

interface ImageResponse {
  imageUrl: string
  error?: string
}
```

## Data Models

### Environment Configuration

```typescript
// Required environment variables
interface EnvConfig {
  GEMINI_API_KEY: string
  GEMINI_TEXT_MODEL?: string // defaults to 'gemini-1.5-flash'
  GEMINI_MAX_TOKENS?: number // defaults to 2048
  GEMINI_TEMPERATURE?: number // defaults to 0.7
}
```

### User Preferences Integration

```typescript
interface UserPreferences {
  allergies: string[]
  dietary: string[] // vegetarian, vegan, gluten-free, etc.
  cuisinePreferences: string[]
  cookingSkill: 'beginner' | 'intermediate' | 'advanced'
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: System prompt includes user preferences
*For any* set of user preferences (allergies, dietary restrictions), the generated system prompt should contain all specified preferences as text.
**Validates: Requirements 1.2**

### Property 2: Recipe response structure validation
*For any* valid API response containing recipe data, the parsed result should contain all required fields: name, ingredients (as array), and instructions (as array).
**Validates: Requirements 1.4**

### Property 3: Image response format validation
*For any* successful image generation response, the output should be either a valid base64 string or a valid URL format.
**Validates: Requirements 2.3**

### Property 4: Image generation error fallback
*For any* image generation error, the service should return a valid fallback placeholder image path and not throw an unhandled exception.
**Validates: Requirements 2.4**

### Property 5: Missing API key error handling
*For any* missing required environment variable (GEMINI_API_KEY), the service initialization should throw an error with a descriptive message containing the variable name.
**Validates: Requirements 3.2**

### Property 6: API key not exposed in responses
*For any* service response (success or error), the response content should not contain the API key string.
**Validates: Requirements 3.3**

### Property 7: API error to user-friendly message transformation
*For any* Gemini API error response, the service should return a user-friendly message that does not expose internal error details.
**Validates: Requirements 4.1**

### Property 8: Network error graceful handling
*For any* network failure, the service should return an appropriate error response without crashing.
**Validates: Requirements 4.3**

### Property 9: Conversation history inclusion
*For any* non-empty conversation history, the formatted prompt should include content from all previous messages in chronological order.
**Validates: Requirements 5.1**

### Property 10: Token limit enforcement
*For any* conversation history, the formatted prompt length should not exceed the configured maximum token limit.
**Validates: Requirements 5.2**

### Property 11: Response type transformation
*For any* valid Gemini API response, the transformation to internal types should produce a valid AIResponse object with correct field types.
**Validates: Requirements 6.3**

## Error Handling

| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| API Key Missing | "Service configuration error" | Throw during init, log details |
| API Rate Limited | "Please wait a moment..." | Queue and retry with backoff |
| API Error (4xx) | "I couldn't process that request" | Return error, suggest retry |
| API Error (5xx) | "Service temporarily unavailable" | Return error, auto-retry once |
| Network Timeout | "Connection issue, please try again" | Return cached or error |
| Invalid Response | "Unexpected response format" | Log error, return fallback |
| Image Gen Failed | (Use placeholder image) | Return fallback, log error |

## Testing Strategy

### Unit Testing
- Test prompt builder functions with various preference combinations
- Test response parsing and transformation logic
- Test error message formatting
- Test token counting and truncation logic

### Property-Based Testing
Using `fast-check` library for property-based tests:

- **Property 1-2**: Generate random preferences and verify prompt/response structure
- **Property 3-4**: Generate various response scenarios, verify format handling
- **Property 5-8**: Generate error conditions, verify graceful handling
- **Property 9-10**: Generate conversation histories, verify formatting and limits
- **Property 11**: Generate API response shapes, verify transformation

### Integration Testing
- Test actual Gemini API calls with test credentials
- Test image generation with sample prompts
- Test rate limiting behavior
- Test conversation context flow

## Implementation Notes

### API Route Structure
```
app/
  api/
    chat/
      route.ts       # POST handler for chat messages
    image/
      route.ts       # POST handler for image generation
```

### Service Layer Structure
```
lib/
  services/
    gemini.service.ts      # Main Gemini text service
    image.service.ts       # Image generation service
    prompt-builder.ts      # Prompt construction utilities
```

### Environment Variables
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_TEXT_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7
```

### System Prompt Template
```
You are KitchenPal, a friendly and knowledgeable cooking assistant. 
Your role is to help users discover recipes based on their available ingredients,
dietary preferences, and cooking skill level.

User Preferences:
- Allergies: {allergies}
- Dietary Restrictions: {dietary}
- Cuisine Preferences: {cuisines}
- Cooking Skill: {skill}

Guidelines:
1. Always consider user allergies and dietary restrictions
2. Suggest recipes appropriate for the user's skill level
3. Provide clear, step-by-step instructions
4. Include prep time, cook time, and serving size
5. Be encouraging and supportive
```
