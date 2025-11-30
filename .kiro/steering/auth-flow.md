---
title: KitchenPal Auth Flow Standards
inclusion: always
---

# Auth Flow Standards

## User Journey

```
Root (/) → Onboarding → Signup/Login → Home
```

## Protected Routes

All routes except these require authentication:
- `/onboarding`
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/auth/callback`

## Redirects

- **Not authenticated** → `/onboarding`
- **Authenticated + on auth pages** → `/home`
- **Sign out** → `/onboarding`

## Auth Pages Design

All auth pages follow this pattern:

```tsx
'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { Mail, Lock } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-8">
      <FadeIn direction="up">
        {/* Title */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Title</h1>
          <p className="text-muted-foreground">Subtitle</p>
        </div>

        {/* Form with rounded inputs */}
        <form className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* Rounded button */}
          <button className="w-full rounded-full bg-brand-primary py-4 font-medium text-white">
            Submit
          </button>
        </form>
      </FadeIn>
    </div>
  )
}
```

## Key Components

- Use `FadeIn` for page entrance animations
- Use Lucide icons in inputs
- Use rounded-2xl for inputs
- Use rounded-full for buttons
- Use brand-primary for primary actions
- Show errors in brand-error-container

## Checking Auth

### Server Component
```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Client Component
```tsx
import { useUser } from '@/hooks/useUser'

const { user, loading } = useUser()
```

## Documentation

See `docs/AUTH_FLOW.md` for complete flow documentation.
