# Implementation Plan

## Status: ✅ Complete

All tasks for the AI Chat feature have been implemented. The feature includes:
- Database schema with RLS policies
- Chat and recipe services with full CRUD operations
- React hooks for state management
- Complete UI component library
- Property-based tests for all correctness properties
- Error handling and authentication guards

---

- [x] 1. Set up database schema and types
  - [x] 1.1 Create database migration for chat and recipe tables
    - Create conversations, chat_messages, recipes, recipe_ingredients, recipe_instructions, recipe_reviews tables
    - Add RLS policies for user data protection
    - _Requirements: 6.2, 4.1_
  - [x] 1.2 Create TypeScript types for chat and recipe data models
    - Define ChatMessage, QuickReply, RecipeOption, Recipe, Ingredient, Instruction, Review interfaces
    - Add types to types/database.ts or create new types/chat.ts file
    - _Requirements: 1.1, 3.1, 9.1_

- [x] 2. Implement chat service layer
  - [x] 2.1 Create chat service for message operations
    - Implement sendMessage, getConversation, createConversation methods
    - Handle AI API integration placeholder
    - _Requirements: 1.1, 1.2, 6.2_
  - [x] 2.2 Write property test for message validation
    - **Property 2: Empty message rejection**
    - **Validates: Requirements 1.3**
  - [x] 2.3 Create recipe service for recipe operations
    - Implement getRecipe, getRecipesByIngredients, filterByAllergies methods
    - _Requirements: 3.1, 4.2_
  - [x] 2.4 Write property test for allergy filtering
    - **Property 5: Allergy filtering excludes conflicting recipes**
    - **Validates: Requirements 4.2**

- [x] 3. Implement chat hooks
  - [x] 3.1 Create useChat hook for chat state management
    - Manage messages array, loading state, error state
    - Implement sendMessage, loadConversation functions
    - _Requirements: 1.1, 1.4, 6.2_
  - [x] 3.2 Write property test for message persistence
    - **Property 7: Message persistence across sessions**
    - **Validates: Requirements 6.2**
  - [x] 3.3 Create useRecipeDetail hook for recipe modal state
    - Manage selected recipe, portions, active tab
    - Implement portion adjustment logic
    - _Requirements: 9.1, 10.1, 10.2_
  - [x] 3.4 Write property test for portion scaling
    - **Property 10: Portion adjustment scales ingredients correctly**
    - **Validates: Requirements 10.2**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build chat UI components
  - [x] 5.1 Create MessageBubble component
    - Render user messages right-aligned with brand color
    - Render AI messages left-aligned with avatar
    - Support text content formatting
    - _Requirements: 5.1, 5.2_
  - [x] 5.2 Write property test for message alignment
    - **Property 6: Message alignment based on role**
    - **Validates: Requirements 5.1, 5.2**
  - [x] 5.3 Create QuickReplies component
    - Render clickable buttons for each quick reply option
    - Handle selection and disable after click
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 5.4 Write property test for quick replies rendering
    - **Property 3: Quick replies render for messages with options**
    - **Validates: Requirements 2.1**
  - [x] 5.5 Create RecipeOptions component
    - Render radio-button style options for recipe suggestions
    - Handle selection to open recipe detail
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 5.6 Write property test for recipe options rendering
    - **Property 4: Recipe options render as selectable items**
    - **Validates: Requirements 3.1, 3.2**
  - [x] 5.7 Create TypingIndicator component
    - Animated three-dot indicator
    - _Requirements: 8.1, 8.2_
  - [x] 5.8 Create ChatInput component
    - Text input with send button
    - Validate non-empty messages
    - Show loading state during send
    - _Requirements: 1.1, 1.3, 1.4_

- [x] 6. Build recipe detail modal components
  - [x] 6.1 Create RecipeDetailModal component (bottom sheet)
    - Implement drag handle and slide-up animation
    - Display hero image at top
    - _Requirements: 9.1_
  - [x] 6.2 Create RecipeHeader component
    - Display title, author, rating with star icon
    - Display quick stats (time, difficulty, calories)
    - _Requirements: 9.2, 9.3_
  - [x] 6.3 Write property test for recipe detail display
    - **Property 8: Recipe detail displays all required information**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
  - [x] 6.4 Create TabNavigation component
    - Three tabs: Ingredients, Instructions, Reviews
    - Underline indicator for active tab
    - _Requirements: 9.5_
  - [x] 6.5 Write property test for tab navigation
    - **Property 9: Tab navigation contains all sections**
    - **Validates: Requirements 9.5**
  - [x] 6.6 Create IngredientsTab component
    - Portion adjuster with +/- buttons
    - Ingredient list with icons and quantities
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 6.7 Write property test for ingredients display
    - **Property 11: Ingredients display with required elements**
    - **Validates: Requirements 10.3**
  - [x] 6.8 Create InstructionsTab component
    - Numbered step list
    - Highlight duration text
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 6.9 Write property test for instructions display
    - **Property 12: Instructions display in correct order**
    - **Validates: Requirements 11.1, 11.2**
  - [x] 6.10 Write property test for time highlighting
    - **Property 13: Time highlighting in instructions**
    - **Validates: Requirements 11.3**
  - [x] 6.11 Create ReviewsTab component
    - Review summary with count and avatars
    - Review list with user info and star rating
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 6.12 Write property test for reviews display
    - **Property 14: Reviews display with required elements**
    - **Validates: Requirements 12.1, 12.2**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build chat page
  - [x] 8.1 Update chat page at /chat route
    - Integrate ChatMessages, ChatInput, RecipeDetailModal
    - Load user preferences on mount
    - Display welcome message on empty state
    - _Requirements: 4.1, 5.3, 5.5, 6.1_
  - [x] 8.2 Implement message sending flow
    - Send message to AI service
    - Display typing indicator while waiting
    - Show AI response with quick replies/recipe options
    - _Requirements: 1.1, 1.2, 8.1, 8.2_
  - [x] 8.3 Implement recipe selection flow
    - Open RecipeDetailModal on recipe option click
    - Load full recipe details
    - _Requirements: 3.3, 9.1_

- [x] 9. Implement error handling
  - [x] 9.1 Add error states to chat
    - Display error message for AI service failures
    - Show retry button for failed messages
    - _Requirements: 7.1, 7.2_
  - [x] 9.2 Add auth guard for chat page
    - Redirect unauthenticated users to login
    - _Requirements: 6.3_

- [x] 10. Add navigation integration
  - [x] 10.1 Add chat icon to bottom navigation
    - Navigate to /chat on tap
    - _Requirements: 6.1_

- [x] 11. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
