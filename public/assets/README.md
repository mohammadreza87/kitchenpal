# Assets Organization

This folder contains all static assets for the KitchenPal application, organized by category for easy maintenance and scalability.

## Folder Structure

```
assets/
├── backgrounds/          # Background shapes and patterns
│   └── Backgroud Shape.svg
│
├── icons/               # Icon sets and icon-related assets
│   ├── Icons.svg
│   └── Elements-icons.svg
│
└── illustrations/       # All illustration assets
    ├── onboarding/     # Onboarding screen illustrations
    │   ├── Onboarding1.svg
    │   ├── Onboarding2.svg
    │   └── Onboarding3.svg
    │
    ├── auth/           # Authentication-related illustrations
    │   ├── Profile.svg
    │   ├── Mailbox.svg
    │   ├── Delete Account.svg
    │   ├── Failed Search.svg
    │   └── Is Typing.svg
    │
    ├── food/           # Food and cuisine illustrations
    │   ├── cuisines/   # Regional cuisines
    │   │   ├── Chinese Food.svg
    │   │   ├── French Cuisine.svg
    │   │   ├── Indian Food.svg
    │   │   ├── Italian Cuisine.svg
    │   │   ├── Japanese Dishes.svg
    │   │   ├── Mediterranean Food.svg
    │   │   ├── Mexican Delights.svg
    │   │   ├── Middle Eastern Cuisine.svg
    │   │   ├── Spanish Tapas.svg
    │   │   └── Thai Food.svg
    │   │
    │   └── diets/      # Diet-specific dishes
    │       ├── Dairy-Free Diet Dish.svg
    │       ├── Gluten-Free Diet Dish.svg
    │       ├── Keto Diet Dish.svg
    │       ├── Low-Carb Diet Dish.svg
    │       ├── Low-Fat Diet Dish.svg
    │       ├── Mediterranean Diet Dish.svg
    │       ├── Paleo Diet Dish.svg
    │       └── Vegan Diet Dish.svg
    │
    └── ui-components/  # UI component design references
        ├── Alerts.svg
        ├── Buttons.svg
        ├── Cards.svg
        ├── Checkboxes.svg
        ├── Chips.svg
        ├── Dialog.svg
        ├── Dividers.svg
        ├── FAB.svg
        ├── Icon Button.svg
        ├── Lists.svg
        ├── Navigation Bars.svg
        ├── Navigation Drawer.svg
        ├── Progress.svg
        ├── Radio Buttons.svg
        ├── Search.svg
        ├── Snackbars.svg
        ├── Switch.svg
        ├── Tabs.svg
        ├── Text Fields.svg
        ├── Top App Bar.svg
        ├── Typography.svg
        ├── Color Palette.svg
        ├── Elements.svg
        ├── User Images.svg
        └── Bone.svg
```

## Usage Guidelines

### Importing Assets

Always use absolute paths from the public folder:

```tsx
// ✅ Correct
<img src="/assets/illustrations/onboarding/Onboarding1.svg" alt="..." />

// ❌ Wrong
<img src="../assets/Onboarding1.svg" alt="..." />
```

### Naming Conventions

- Use PascalCase for file names: `ProfileImage.svg`
- Use descriptive names: `ChineseFood.svg` not `food1.svg`
- Include category in name when helpful: `DietKeto.svg`

### Adding New Assets

1. Determine the correct category folder
2. Use consistent naming with existing files
3. Optimize SVGs before adding (remove unnecessary metadata)
4. Update this README if adding new categories

### Categories

**backgrounds/** - Decorative backgrounds, shapes, patterns
- Used for: Page backgrounds, section dividers

**icons/** - Icon sets and individual icons
- Used for: UI elements, buttons, navigation

**illustrations/onboarding/** - Onboarding flow illustrations
- Used for: Welcome screens, tutorial steps

**illustrations/auth/** - Authentication flow illustrations
- Used for: Login, signup, password reset screens

**illustrations/food/** - Food-related illustrations
- Subcategories: cuisines, diets
- Used for: Recipe cards, category pages, diet filters

**illustrations/ui-components/** - Design system references
- Used for: Component library, design documentation
- Note: These are reference files, not typically used in production

## Optimization

All SVG files should be optimized before committing:
- Remove unnecessary metadata
- Simplify paths where possible
- Use SVGO or similar tools

## Best Practices

1. **Keep it organized** - Always place files in the correct category
2. **No duplicates** - Check if an asset exists before adding
3. **Consistent naming** - Follow the established naming pattern
4. **Optimize first** - Compress/optimize before adding
5. **Document usage** - Update README when adding new categories
