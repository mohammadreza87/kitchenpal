# Profile System Architecture

## Overview

The profile system is built with a modular, scalable architecture following best practices for separation of concerns and low coupling.

## Database Schema

Run the migration to set up the database:

```bash
# In Supabase dashboard or via CLI
supabase db push
```

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Core user data (name, email, phone, location, bio, avatar) |
| `user_social_links` | Social media links (website, instagram, youtube, tiktok) |
| `user_preferences` | Food preferences (dietary, cuisine, allergies, cooking skill) |
| `user_notification_settings` | Push and email notification preferences |
| `user_security_settings` | Security toggles (2FA, biometric, privacy) |
| `user_sessions` | Device/session management |

All tables have Row Level Security (RLS) enabled - users can only access their own data.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Pages (UI)                           │
│  profile/page.tsx, personal-info/page.tsx, etc.            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Custom Hooks                            │
│  useProfile, usePreferences, useNotificationSettings, etc. │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  ProfileService, PreferencesService, SecurityService, etc. │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Client                           │
└─────────────────────────────────────────────────────────────┘
```

## Services

Located in `lib/services/`:

- `profile.service.ts` - Profile CRUD, avatar upload, social links
- `preferences.service.ts` - Food preferences management
- `notifications.service.ts` - Notification settings
- `security.service.ts` - Security settings, sessions, password

## Hooks

Located in `hooks/`:

- `useProfile()` - Profile data + social links
- `usePreferences()` - Food preferences
- `useNotificationSettings()` - Notification toggles
- `useSecuritySettings()` - Security + sessions

### Usage Example

```tsx
import { useProfile } from '@/hooks/useProfile'

function MyComponent() {
  const { profile, loading, updateProfile } = useProfile()

  if (loading) return <Skeleton />

  return <div>{profile?.full_name}</div>
}
```

## Components

Located in `components/profile/`:

- `ProfileMenuItem` - Navigation item
- `InfoItem` - Display-only info row
- `EditableInfoItem` - Editable info row
- `SocialItem` - Social link with edit button
- `DeviceCard` - Session/device card
- `PreferenceChip` - Preference tag
- `ProfileSkeleton` - Loading states
- `modals/AboutYouModal` - Bio editor
- `modals/SocialEditModal` - Social link editor

## Storage

Avatar images are stored in Supabase Storage bucket `avatars`.

To enable avatar uploads, create the bucket in Supabase dashboard:

1. Go to Storage
2. Create bucket named `avatars`
3. Set to public
4. Add policy for authenticated users to upload

## Features

### Profile Page
- View profile summary
- Navigate to settings sections
- Sign out

### Personal Information
- View/edit name, email, phone, location
- Upload avatar
- Edit bio
- Manage social links
- Delete account

### Notifications
- Toggle push notifications
- Toggle email notifications
- Unsubscribe all

### Security & Privacy
- Two-factor authentication toggle
- Login alerts
- Biometric lock
- Privacy controls
- Session management
- Data export/deletion requests

### Preferences
- View dietary preferences
- View cuisine preferences
- View allergies
- View cooking skill level

### Feedback
- Rate overall experience (1-5 emoji scale)
- Select feedback category (Bug, Feature, Improvement, Other)
- Select related topics (Recipes, Search, UI, Performance, Account, Notifications)
- Detailed feedback message
- Optional email for follow-up
- Linked to user profile when authenticated
- Feedback history viewable in profile

## Feedback System

### Database Schema

```sql
user_feedback
├── id (uuid, PK)
├── user_id (uuid, FK → profiles, nullable for anonymous)
├── rating (1-5)
├── category (bug, feature, improvement, other)
├── message (text)
├── email (optional)
├── status (pending, reviewed, in_progress, resolved, closed)
├── admin_notes (for internal use)
├── created_at
└── updated_at

feedback_attachments
├── id (uuid, PK)
├── feedback_id (uuid, FK → user_feedback)
├── file_url
├── file_name
├── file_type
├── file_size
└── created_at
```

### Service: `feedback.service.ts`
- `submitFeedback()` - Create new feedback
- `getUserFeedback()` - Get user's feedback history
- `uploadAttachment()` - Attach screenshots/files

### Hook: `useFeedback()`
- `submitFeedback()` - Submit with loading state
- `submitting` - Loading state
- `isAuthenticated` - Check if user is logged in
- `userEmail` - Pre-fill email from profile
