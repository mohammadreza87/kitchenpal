/**
 * KitchenPal Typography System
 *
 * Based on Material Design 3 Type Scale
 * Font: Poppins
 *
 * IMPORTANT: Always use these typography classes instead of arbitrary text sizes.
 * This ensures consistency across the entire application.
 */

/**
 * Typography scale mapping
 * Format: name -> { size/lineHeight, letterSpacing, weight }
 */
export const typography = {
  // Display - For hero sections, splash screens, marketing pages
  display: {
    large: 'text-display-lg',   // 57/64, -0.25px, Regular
    medium: 'text-display-md',  // 45/52, 0, Regular
    small: 'text-display-sm',   // 36/44, 0, Regular
  },

  // Heading - For page titles, section headers
  heading: {
    large: 'text-heading-lg',   // 32/40, 0, Regular
    medium: 'text-heading-md',  // 28/36, 0, Regular
    small: 'text-heading-sm',   // 24/32, 0, Regular
  },

  // Title - For card titles, dialog titles, list item titles
  title: {
    large: 'text-title-lg',     // 22/28, 0, Regular
    medium: 'text-title-md',    // 16/24, +0.15px, Medium
    small: 'text-title-sm',     // 14/20, +0.1px, Medium
  },

  // Label - For buttons, form labels, chips, tabs
  label: {
    large: 'text-label-lg',     // 14/20, +0.1px, Medium
    medium: 'text-label-md',    // 12/16, +0.5px, Medium
    small: 'text-label-sm',     // 11/16, +0.5px, Medium
  },

  // Body - For paragraphs, descriptions, helper text
  body: {
    large: 'text-body-lg',      // 16/24, +0.5px, Regular
    medium: 'text-body-md',     // 14/20, +0.25px, Regular
    small: 'text-body-sm',      // 12/16, +0.4px, Regular
  },
} as const

/**
 * Typography usage guide
 *
 * DISPLAY:
 * - display-lg: App name on splash screen, major announcements
 * - display-md: Section heroes, promotional banners
 * - display-sm: Feature highlights, onboarding titles
 *
 * HEADING:
 * - heading-lg: Page titles (e.g., "My Recipes")
 * - heading-md: Section headers (e.g., "Popular Recipes")
 * - heading-sm: Subsection headers, dialog titles
 *
 * TITLE:
 * - title-lg: Large card titles, featured content
 * - title-md: Standard card titles, list headers
 * - title-sm: Compact card titles, toolbar titles
 *
 * LABEL:
 * - label-lg: Primary buttons, prominent form labels
 * - label-md: Secondary buttons, chips, tabs
 * - label-sm: Tertiary buttons, small chips, captions
 *
 * BODY:
 * - body-lg: Primary content, important descriptions
 * - body-md: Default body text, form placeholders
 * - body-sm: Secondary text, helper text, timestamps
 */

// Type for component props that accept typography variants
export type TypographyVariant =
  | 'display-lg' | 'display-md' | 'display-sm'
  | 'heading-lg' | 'heading-md' | 'heading-sm'
  | 'title-lg' | 'title-md' | 'title-sm'
  | 'label-lg' | 'label-md' | 'label-sm'
  | 'body-lg' | 'body-md' | 'body-sm'

/**
 * Get typography class from variant string
 */
export function getTypographyClass(variant: TypographyVariant): string {
  return `text-${variant}`
}
