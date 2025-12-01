import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, redirect to home
  // Otherwise, redirect to onboarding
  if (user) {
    redirect('/home')
  } else {
    redirect('/onboarding')
  }
}
