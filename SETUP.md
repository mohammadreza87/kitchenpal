# KitchenPal Setup Guide

## Quick Start (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: KitchenPal
   - **Database Password**: (save this somewhere safe)
   - **Region**: Choose closest to you
4. Click "Create new project" (takes ~2 minutes)

### 2. Get Your Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:

   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Update Environment Variables

Open `kitchenpal/.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Database Migration

1. In Supabase dashboard, go to **SQL Editor** (in sidebar)
2. Click **New Query**
3. Copy the contents of `kitchenpal/supabase/migrations/001_create_profiles.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

### 5. Start Development Server

```bash
cd kitchenpal
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the onboarding screen!

## What the Migration Does

The migration creates:
- `profiles` table linked to auth users
- Row Level Security (RLS) policies
- Automatic profile creation trigger when users sign up

## Testing the Auth Flow

1. Visit `http://localhost:3000`
2. You'll see the onboarding screens
3. Click through to "Let's Go!"
4. Sign up with email/password
5. You'll be redirected to `/home`

## Optional: Enable Google OAuth

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URI:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**

### 2. Configure in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

Now the "Sign in with Gmail" button will work!

## Troubleshooting

### Error: "Invalid supabaseUrl"
- Make sure `.env.local` has valid Supabase URL
- Restart dev server after updating `.env.local`

### Error: "relation 'profiles' does not exist"
- Run the database migration (step 4 above)

### Can't sign up
- Check Supabase dashboard → **Authentication** → **Users** to see if user was created
- Check browser console for errors
- Make sure email confirmation is disabled (or check your email)

### Disable Email Confirmation (for development)

1. Go to **Authentication** → **Providers** → **Email**
2. Uncheck "Confirm email"
3. Click **Save**

This lets you test without checking email every time.

## Project Structure

```
kitchenpal/
├── app/
│   ├── onboarding/          # 3-slide intro
│   ├── login/               # Sign in page
│   ├── signup/              # Create account
│   ├── forgot-password/     # Password reset
│   ├── reset-password/      # Set new password
│   ├── home/                # Main app (protected)
│   └── auth/
│       ├── callback/        # OAuth callback
│       └── signout/         # Sign out handler
├── lib/
│   └── supabase/
│       ├── client.ts        # Client-side Supabase
│       ├── server.ts        # Server-side Supabase
│       └── middleware.ts    # Auth middleware
└── supabase/
    └── migrations/          # Database migrations
```

## Next Steps

1. ✅ Set up Supabase credentials
2. ✅ Run database migration
3. ✅ Test auth flow
4. 🚀 Start building features!

See `docs/AUTH_FLOW.md` for detailed auth documentation.
