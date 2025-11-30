import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to onboarding - middleware will handle auth checks
  redirect('/onboarding')
}
