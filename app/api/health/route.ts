/**
 * Health Check API Route
 * GET /api/health - Check status of all API services
 * Returns status of Gemini, Supabase, and ElevenLabs APIs
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type ServiceStatus = {
  status: 'ok' | 'error' | 'not_configured'
  message?: string
  latency?: number
}

type HealthResponse = {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    gemini: ServiceStatus
    supabase: ServiceStatus
    elevenlabs: ServiceStatus
  }
}

async function checkGemini(): Promise<ServiceStatus> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    return { status: 'not_configured', message: 'GEMINI_API_KEY not set' }
  }

  const start = Date.now()
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { method: 'GET' }
    )
    const latency = Date.now() - start

    if (response.ok) {
      return { status: 'ok', latency }
    }

    const error = await response.json().catch(() => ({}))
    return {
      status: 'error',
      message: error.error?.message || `HTTP ${response.status}`,
      latency,
    }
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Connection failed',
      latency: Date.now() - start,
    }
  }
}

async function checkSupabase(): Promise<ServiceStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || url === 'your_supabase_url' || !key || key === 'your_supabase_anon_key') {
    return { status: 'not_configured', message: 'Supabase credentials not set' }
  }

  const start = Date.now()
  try {
    const supabase = createClient(url, key)
    // Simple health check - try to get auth session (doesn't require auth)
    const { error } = await supabase.auth.getSession()
    const latency = Date.now() - start

    if (error) {
      return { status: 'error', message: error.message, latency }
    }

    return { status: 'ok', latency }
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Connection failed',
      latency: Date.now() - start,
    }
  }
}

async function checkElevenLabs(): Promise<ServiceStatus> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey || apiKey === 'your_elevenlabs_api_key') {
    return { status: 'not_configured', message: 'ELEVENLABS_API_KEY not set' }
  }

  const start = Date.now()
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    })
    const latency = Date.now() - start

    if (response.ok) {
      return { status: 'ok', latency }
    }

    return {
      status: 'error',
      message: `HTTP ${response.status}: ${response.statusText}`,
      latency,
    }
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Connection failed',
      latency: Date.now() - start,
    }
  }
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const [gemini, supabase, elevenlabs] = await Promise.all([
    checkGemini(),
    checkSupabase(),
    checkElevenLabs(),
  ])

  const services = { gemini, supabase, elevenlabs }

  // Determine overall health
  const criticalServices = [gemini] // Gemini is critical
  const hasError = criticalServices.some((s) => s.status === 'error')
  const hasDegraded = Object.values(services).some(
    (s) => s.status === 'error' || s.status === 'not_configured'
  )

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  if (hasError) {
    status = 'unhealthy'
  } else if (hasDegraded) {
    status = 'degraded'
  }

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    services,
  }

  // Return 500 if unhealthy (triggers uptime monitor alerts)
  const httpStatus = status === 'unhealthy' ? 500 : 200
  return NextResponse.json(response, { status: httpStatus })
}
