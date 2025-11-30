---
title: KitchenPal Color Palette Standards
inclusion: always
---

# Color Palette Standards

## Always Use These Colors

When building features for KitchenPal, ALWAYS use colors from our defined palette. Never use arbitrary colors.

### Primary Colors (Orange)
- Main: `#ff7043` or `bg-primary` / `text-primary`
- Use for: Primary buttons, CTAs, key actions, main brand elements

### Secondary Colors (Yellow)
- Main: `#ffd54f` or `bg-secondary` / `text-secondary`
- Use for: Secondary actions, highlights, tags, badges

### Tertiary Colors (Pink)
- Main: `#ff4081` or `bg-accent` / `text-accent`
- Use for: Accents, special features, playful elements

### Error Colors (Red)
- Main: `#e33338` or `bg-destructive` / `text-destructive`
- Use for: Error states, destructive actions, warnings

### Neutral Colors
- Use `bg-background`, `bg-card`, `bg-muted` for backgrounds
- Use `text-foreground`, `text-muted-foreground` for text
- Use `border` for borders

## Quick Reference

```tsx
// ✅ CORRECT - Using semantic tokens
<button className="bg-primary text-primary-foreground">Click me</button>
<div className="bg-card border rounded-lg p-4">Card content</div>

// ✅ CORRECT - Using brand colors for specific tones
<div className="bg-brand-primary-container text-brand-primary-on-container">
  Light background with proper contrast
</div>

// ❌ WRONG - Don't use arbitrary colors
<button className="bg-orange-500">Click me</button>
<div className="bg-yellow-100">Content</div>
```

## Container Pattern

Always use the container pattern for backgrounds with text:

```tsx
<div className="bg-brand-primary-container text-brand-primary-on-container">
  This ensures proper contrast and accessibility
</div>
```

## Dark Mode

All colors automatically adjust for dark mode. No need to add dark: variants manually for semantic tokens.

## Full Documentation

- Interactive palette: `/design-system`
- Complete docs: `docs/COLOR_PALETTE.md`
- TypeScript constants: `lib/colors.ts`
