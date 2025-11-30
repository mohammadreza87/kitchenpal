# KitchenPal Color Palette

## Overview

KitchenPal uses a Material Design 3 inspired color system with warm, food-friendly tones. The palette provides semantic color roles for consistent theming across light and dark modes.

## Quick Reference

### Primary Colors (Orange)
- **Main**: `#ff7043` (P-60) - Use for primary buttons, key actions, CTAs
- **Container**: `#ffd4c6` (P-95) - Use for light backgrounds
- **On Container**: `#33160d` (P-10) - Use for text on container backgrounds

### Secondary Colors (Yellow)
- **Main**: `#ffd54f` (S-60) - Use for secondary actions, highlights
- **Container**: `#fff3ca` (S-95) - Use for light backgrounds
- **On Container**: `#332b10` (S-10) - Use for text on container backgrounds

### Tertiary Colors (Pink)
- **Main**: `#ff4081` (T-60) - Use for accents, special features
- **Container**: `#ffc6d9` (T-95) - Use for light backgrounds
- **On Container**: `#330d1a` (T-10) - Use for text on container backgrounds

### Error Colors (Red)
- **Main**: `#e33338` (E-60) - Use for error states, destructive actions
- **Container**: `#fce9e9` (E-99) - Use for error backgrounds
- **On Container**: `#440f11` (E-20) - Use for error text

### Neutral Colors
- **Surface**: `#fafafa` (N-99) - Default background
- **Surface Bright**: `#f4f4f4` (N-98) - Elevated surfaces
- **Surface Dim**: `#efefef` (N-95) - Recessed surfaces
- **On Surface**: `#282828` (N-10) - High-emphasis text
- **Outline**: `#797979` (N-40) - Borders (3:1 contrast)

## Usage in Code

### Using Tailwind Classes

```tsx
// Primary button
<button className="bg-primary text-primary-foreground">
  Click me
</button>

// Using brand colors directly
<div className="bg-brand-primary text-white">
  Primary content
</div>

// Secondary button
<button className="bg-secondary text-secondary-foreground">
  Secondary action
</button>

// Error state
<div className="bg-destructive text-destructive-foreground">
  Error message
</div>
```

### Using TypeScript Constants

```tsx
import { colors, semanticColors } from '@/lib/colors'

// Access specific tones
const primaryColor = colors.primary[60] // #ff7043
const containerColor = colors.primary[95] // #ffd4c6

// Use semantic colors
const surfaceColor = semanticColors.surface // #fafafa
const outlineColor = semanticColors.outline // #797979
```

### Using CSS Variables

```css
/* In your CSS */
.custom-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.custom-border {
  border-color: hsl(var(--border));
}
```

## Color Roles

### Container Pattern
- **Container (95)**: Light background for color group
- **On Container (10)**: Text on container backgrounds
- **Fixed (98)**: Consistent color regardless of theme
- **On Fixed (0)**: Text on fixed backgrounds

### Surface Pattern
- **Surface Bright (N-98)**: Elevated surfaces (cards, modals)
- **Surface (N-99)**: Default background
- **Surface Dim (N-95)**: Recessed surfaces (wells, insets)
- **On Surface (N-10)**: High-emphasis text

## Accessibility

- All main colors (60 tone) provide **4.5:1 contrast** with white backgrounds
- Outline colors provide **3:1 contrast** for borders and dividers
- Dark mode uses lighter tones (80) to maintain contrast
- Inverse colors ensure readability in both themes

## Dark Mode

The palette automatically adjusts for dark mode:
- Primary: P-60 → P-80 (lighter)
- Secondary: S-60 → S-80 (lighter)
- Tertiary: T-60 → T-80 (lighter)
- Background: N-99 → N-10 (darker)
- Borders: N-40 → NV-20 (adjusted)

## Visual Reference

Visit `/design-system` in your local development environment to see the full interactive color palette with copy-to-clipboard functionality.

## Best Practices

1. **Use semantic tokens** (`primary`, `secondary`, etc.) instead of direct hex values for theme consistency
2. **Use brand colors** (`brand.primary`, `brand.secondary`) when you need specific tones
3. **Follow the container pattern** for backgrounds with text
4. **Test in both light and dark modes** to ensure proper contrast
5. **Use outline colors** for borders to maintain 3:1 contrast ratio
