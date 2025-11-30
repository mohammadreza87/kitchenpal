# KitchenPal

A Next.js 14 application with Supabase authentication and database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `.env.local` with your credentials

3. Run the database migration:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and run the SQL from `supabase/migrations/001_create_profiles.sql`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
kitchenpal/
├── app/                    # Next.js App Router
│   ├── auth/              # Auth routes (callback, signout)
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── page.tsx           # Home page (protected)
├── components/            # React components
│   ├── auth/             # Auth-related components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configs
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Helper functions
├── types/                # TypeScript types
│   └── database.ts       # Database types
└── supabase/             # Database migrations
    └── migrations/
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database + Storage)
- shadcn/ui

## Features

- ✅ Authentication (login/signup)
- ✅ Protected routes
- ✅ User profiles with RLS
- ✅ Server and client Supabase clients
- ✅ Type-safe database schema
- ✅ Complete color palette system (Material Design 3 inspired)
- ✅ Dark mode support
- ✅ GSAP animations with pre-built components

## Color Palette

KitchenPal uses a comprehensive color system with warm, food-friendly tones:

- **Primary (Orange)**: `#ff7043` - Main brand color for CTAs and key actions
- **Secondary (Yellow)**: `#ffd54f` - Secondary actions and highlights
- **Tertiary (Pink)**: `#ff4081` - Accents and special features
- **Error (Red)**: `#e33338` - Error states and destructive actions

### Usage

```tsx
// Use semantic tokens (recommended)
<button className="bg-primary text-primary-foreground">Primary</button>

// Use brand colors for specific tones
<div className="bg-brand-primary-container text-brand-primary-on-container">
  Container with proper contrast
</div>
```

### Visual Guide

Visit `/design-system` to see the full interactive color palette with all tones and usage examples.

See `docs/COLOR_PALETTE.md` for complete documentation.

## Animations

KitchenPal uses GSAP for smooth, performant animations:

```tsx
import { FadeIn } from '@/components/animations/FadeIn'

<FadeIn direction="up" delay={0.2}>
  <div>Animated content</div>
</FadeIn>
```

### Available Components

- `FadeIn` - Fade in from any direction
- `StaggerChildren` - Stagger animation for lists
- `ScrollReveal` - Reveal on scroll

### Custom Animations

```tsx
'use client'
import { useGsap } from '@/hooks/useGsap'

const container = useGsap((ctx) => {
  ctx.from('.box', { opacity: 0, y: 50 })
})
```

Visit `/animations` for interactive examples. See `docs/ANIMATIONS.md` for complete guide.

## Authentication Flow

Complete onboarding and auth flow:

- `/onboarding` - 3-slide intro with animations
- `/signup` - Create account with email or Google
- `/login` - Sign in with email or Google
- `/forgot-password` - Password reset flow
- `/home` - Protected main app

See `docs/AUTH_FLOW.md` for complete documentation.

Ready to build your features!
