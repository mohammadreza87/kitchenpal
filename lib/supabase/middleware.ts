import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Note: Cannot use lib/env here as middleware runs in Edge runtime
// Environment validation happens at build time via other entry points
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle root path specially
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    if (user) {
      url.pathname = '/home'
    } else {
      url.pathname = '/landingpage'
    }
    return NextResponse.redirect(url)
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/onboarding',
    '/landingpage',
    '/preferences',
    '/cuisine',
    '/allergies',
    '/cooking-skills',
    '/auth/callback',
  ]

  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect to landing page if not authenticated and not on a public route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    const redirectPath = request.nextUrl.pathname
    url.pathname = '/landingpage'
    // Preserve the original path for redirect after login
    if (redirectPath && redirectPath !== '/') {
      url.searchParams.set('redirect', redirectPath)
    }
    return NextResponse.redirect(url)
  }

  // Redirect to home if authenticated and trying to access login/signup/onboarding/landing pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup' || request.nextUrl.pathname === '/onboarding' || request.nextUrl.pathname === '/landingpage')) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
