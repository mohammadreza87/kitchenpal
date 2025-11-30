# Getting Started with KitchenPal Colors

## TL;DR

Use `bg-primary`, `bg-secondary`, `bg-accent`, and `bg-destructive` for buttons and key elements. Everything is already configured.

## Three Ways to Use Colors

### 1. Semantic Tokens (Recommended for most cases)

These automatically adapt to light/dark mode:

```tsx
<button className="bg-primary text-primary-foreground">Primary Action</button>
<button className="bg-secondary text-secondary-foreground">Secondary Action</button>
<button className="bg-accent text-accent-foreground">Accent</button>
<button className="bg-destructive text-destructive-foreground">Delete</button>

<div className="bg-card border rounded-lg p-4">
  <p className="text-foreground">Card content</p>
  <p className="text-muted-foreground">Subtle text</p>
</div>
```

### 2. Brand Colors (For specific tones)

Use when you need exact control over color tones:

```tsx
// Direct brand colors
<div className="bg-brand-primary text-white">Orange background</div>
<div className="bg-brand-secondary text-brand-secondary-on-container">Yellow background</div>
<div className="bg-brand-tertiary text-white">Pink background</div>

// Container pattern (light backgrounds with proper contrast)
<div className="bg-brand-primary-container text-brand-primary-on-container">
  Light orange background with dark text
</div>
```

### 3. TypeScript Constants (For JavaScript/CSS)

```tsx
import { colors, semanticColors } from '@/lib/colors'

const primaryColor = colors.primary[60] // '#ff7043'
const surfaceColor = semanticColors.surface // '#fafafa'

<div style={{ backgroundColor: primaryColor }}>
  Custom styled element
</div>
```

## Common Patterns

### Buttons

```tsx
// Primary action
<button className="bg-primary text-primary-foreground hover:opacity-90 rounded-lg px-6 py-3">
  Save Recipe
</button>

// Secondary action
<button className="bg-secondary text-secondary-foreground hover:opacity-90 rounded-lg px-6 py-3">
  Add to List
</button>

// Destructive action
<button className="bg-destructive text-destructive-foreground hover:opacity-90 rounded-lg px-6 py-3">
  Delete
</button>
```

### Cards

```tsx
<div className="bg-card border rounded-xl p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-card-foreground">Recipe Title</h3>
  <p className="text-muted-foreground">Recipe description</p>
</div>
```

### Alerts

```tsx
// Error
<div className="bg-brand-error-container text-brand-error-on-container rounded-lg p-4">
  ⚠️ Error message
</div>

// Info
<div className="bg-brand-primary-container text-brand-primary-on-container rounded-lg p-4">
  ℹ️ Info message
</div>

// Success
<div className="bg-brand-secondary-container text-brand-secondary-on-container rounded-lg p-4">
  ✓ Success message
</div>
```

### Badges

```tsx
<span className="bg-brand-secondary text-brand-secondary-on-container rounded-full px-3 py-1 text-sm">
  Vegetarian
</span>
<span className="bg-brand-tertiary text-white rounded-full px-3 py-1 text-sm">
  Featured
</span>
```

## Color Meanings

- **Primary (Orange)**: Main actions, CTAs, brand identity
- **Secondary (Yellow)**: Secondary actions, highlights, categories
- **Tertiary (Pink)**: Accents, favorites, special features
- **Error (Red)**: Errors, warnings, delete actions
- **Muted**: Subtle backgrounds, disabled states
- **Border**: Dividers, outlines, separators

## Visual Reference

Run your dev server and visit:
- `/design-system` - Full interactive color palette
- See `docs/COLOR_PALETTE.md` for complete documentation

## Rules

1. ✅ Always use colors from the palette
2. ✅ Use semantic tokens (`bg-primary`) for theme consistency
3. ✅ Use container pattern for backgrounds with text
4. ✅ Test in both light and dark modes
5. ❌ Never use arbitrary Tailwind colors like `bg-orange-500`
6. ❌ Never use random hex values
