# Authentication Flow

## User Journey

```
/ (root) → /onboarding → /signup or /login → /home
```

## Pages

### 1. Onboarding (`/onboarding`)
- 3 swipeable intro screens
- Skip button (top right)
- Back button (after first slide)
- Next button → advances to next slide
- "Let's Go!" button on last slide → redirects to `/signup`
- Pagination dots show current slide

**Slides:**
1. Welcome to Kitchen Pal - Introduction
2. Ingredient Alchemy - Feature highlight
3. Your Culinary Profile - Final CTA

### 2. Sign Up (`/signup`)
- Name input
- Email input
- Password input (min 6 characters)
- Terms & Conditions checkbox
- Sign Up button
- Google OAuth option
- Link to Sign In page

**Flow:**
- Creates Supabase auth user
- Stores full_name in user metadata
- Redirects to `/home` on success

### 3. Login (`/login`)
- Email input
- Password input
- "Forgot Your password?" link → `/forgot-password`
- Sign In button
- Google OAuth option
- Link to Sign Up page

**Flow:**
- Authenticates with Supabase
- Redirects to `/home` on success

### 4. Forgot Password (`/forgot-password`)
- Email input
- Reset Password button
- Shows success screen with "Check your Email" message
- "Open Email App" button
- Link back to Sign In

**Flow:**
- Sends password reset email via Supabase
- Email contains link to `/reset-password`

### 5. Reset Password (`/reset-password`)
- New password input
- Confirm password input
- Update Password button
- Validates passwords match
- Redirects to `/home` on success

### 6. Home (`/home`)
- Protected route (requires authentication)
- Main app interface
- Sign out button

## Middleware Protection

The middleware (`lib/supabase/middleware.ts`) handles:

1. **Public Routes** (no auth required):
   - `/onboarding`
   - `/login`
   - `/signup`
   - `/forgot-password`
   - `/reset-password`
   - `/auth/callback`

2. **Protected Routes** (auth required):
   - `/home`
   - All other routes

3. **Redirects**:
   - Not authenticated + protected route → `/onboarding`
   - Authenticated + auth pages → `/home`

## Supabase Auth Setup

### Email Configuration

In your Supabase dashboard:

1. Go to Authentication → Email Templates
2. Update "Reset Password" template redirect URL:
   ```
   {{ .SiteURL }}/reset-password
   ```

### OAuth Configuration (Optional)

For Google Sign In:

1. Go to Authentication → Providers
2. Enable Google provider
3. Add OAuth credentials from Google Cloud Console
4. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## Database Setup

The auth flow automatically creates a profile when a user signs up (via trigger in `supabase/migrations/001_create_profiles.sql`).

Profile includes:
- `id` (references auth.users)
- `email`
- `full_name` (from signup form)
- `avatar_url`
- `created_at`
- `updated_at`

## Usage Examples

### Check if user is authenticated (Server Component)

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Protected content</div>
}
```

### Check if user is authenticated (Client Component)

```tsx
'use client'

import { useUser } from '@/hooks/useUser'

export default function MyComponent() {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>

  return <div>Hello {user.email}</div>
}
```

### Sign out

```tsx
<form action="/auth/signout" method="post">
  <button>Sign out</button>
</form>
```

## Styling

All auth pages use:
- KitchenPal color palette (brand-primary, etc.)
- Rounded inputs with icons
- FadeIn animations
- Mobile-first responsive design
- Consistent spacing and typography

## Error Handling

All forms include:
- Error state display (red container with error message)
- Loading states (disabled buttons with loading text)
- Form validation (required fields, min length, etc.)
- Supabase error messages displayed to user

## Next Steps

After authentication is working:
1. Add profile completion flow
2. Add email verification requirement
3. Add social auth providers (Apple, Facebook)
4. Add 2FA support
5. Add session management
