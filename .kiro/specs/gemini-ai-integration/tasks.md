# Implementation Plan

- [x] 1. Set up environment and dependencies
  - [x] 1.1 Install Google Generative AI SDK
    - Run `npm install @google/generative-ai`
    - _Requirements: 1.1, 3.1_
  - [x] 1.2 Add environment variables configuration
    - Add GEMINI_API_KEY to .env.example and .env.local
    - Update lib/env.ts to include Gemini configuration
    - _Requirements: 3.1, 3.2_
  - [x] 1.3 Write property test for missing API key error
    - **Property 5: Missing API key error handling**
    - **Validates: Requirements 3.2**

- [x] 2. Implement prompt builder utilities
  - [x] 2.1 Create prompt-builder.ts service
    - Implement buildSystemPrompt with user preferences
    - Implement buildRecipePrompt for ingredient-based queries
    - Implement buildImagePrompt for food image generation
    - Implement formatConversationHistory for context
    - _Requirements: 1.2, 5.1_
  - [x] 2.2 Write property test for system prompt preferences
    - **Property 1: System prompt includes user preferences**
    - **Validates: Requirements 1.2**
  - [x] 2.3 Write property test for conversation history inclusion
    - **Property 9: Conversation history inclusion**
    - **Validates: Requirements 5.1**
  - [x] 2.4 Write property test for token limit enforcement
    - **Property 10: Token limit enforcement**
    - **Validates: Requirements 5.2**

- [x] 3. Implement Gemini text service
  - [x] 3.1 Create gemini.service.ts
    - Initialize Gemini client with API key
    - Implement generateResponse method
    - Implement generateRecipeSuggestions method
    - Add response parsing and transformation
    - _Requirements: 1.1, 1.4, 6.3_
  - [x] 3.2 Write property test for recipe response structure
    - **Property 2: Recipe response structure validation**
    - **Validates: Requirements 1.4**
  - [x] 3.3 Write property test for response type transformation
    - **Property 11: Response type transformation**
    - **Validates: Requirements 6.3**
  - [x] 3.4 Write property test for API key not exposed
    - **Property 6: API key not exposed in responses**
    - **Validates: Requirements 3.3**

- [x] 4. Implement error handling
  - [x] 4.1 Add error handling to Gemini service
    - Handle API errors with user-friendly messages
    - Handle network failures gracefully
    - Implement retry logic for transient errors
    - _Requirements: 4.1, 4.3_
  - [x] 4.2 Write property test for API error transformation
    - **Property 7: API error to user-friendly message transformation**
    - **Validates: Requirements 4.1**
  - [x] 4.3 Write property test for network error handling
    - **Property 8: Network error graceful handling**
    - **Validates: Requirements 4.3**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement image generation service
  - [x] 6.1 Create image.service.ts
    - Initialize Imagen 3 client
    - Implement generateFoodImage method
    - Handle base64 encoding and URL generation
    - Add fallback placeholder handling
    - _Requirements: 2.1, 2.3, 2.4_
  - [x] 6.2 Write property test for image response format
    - **Property 3: Image response format validation**
    - **Validates: Requirements 2.3**
  - [x] 6.3 Write property test for image error fallback
    - **Property 4: Image generation error fallback**
    - **Validates: Requirements 2.4**

- [x] 7. Create API routes
  - [x] 7.1 Create /api/chat route
    - Handle POST requests for chat messages
    - Integrate with Gemini service
    - Return structured responses
    - _Requirements: 1.1, 1.4_
  - [x] 7.2 Create /api/image route
    - Handle POST requests for image generation
    - Integrate with image service
    - Return image URL or base64
    - _Requirements: 2.1, 2.3_

- [x] 8. Integrate with existing chat service
  - [x] 8.1 Update chat.service.ts getAIResponse method
    - Replace placeholder with Gemini API call
    - Pass user preferences to prompt builder
    - Handle response transformation
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 8.2 Update useChat hook for image generation
    - Add image generation call when recipe is suggested
    - Handle image loading states
    - _Requirements: 2.1_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Add rate limiting and caching
  - [x] 10.1 Implement rate limiter for API calls
    - Add request queuing for rate limit errors
    - Implement exponential backoff
    - _Requirements: 4.2_
  - [x] 10.2 Add response caching for common queries
    - Cache recipe suggestions for similar ingredients
    - Cache generated images by recipe name
    - _Requirements: 4.3_

- [x] 11. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
