import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 60 * 1000 // 1 minute

const attempts = new Map<string, { count: number; firstAttempt: number }>()

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

function isRateLimited(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now()
  const record = attempts.get(ip)

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAttempt: now })
    return { limited: false, retryAfter: 0 }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.firstAttempt + WINDOW_MS - now) / 1000)
    return { limited: true, retryAfter }
  }

  record.count++
  return { limited: false, retryAfter: 0 }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { limited, retryAfter } = isRateLimited(ip)

    if (limited) {
      return NextResponse.json(
        { valid: false, error: `Too many attempts. Try again in ${retryAfter}s.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { key } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Access code is required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
      .from('auth_key')
      .select('id')
      .eq('key', key.trim())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { valid: false, error: 'Invalid access code' },
        { status: 401 }
      )
    }

    // Clear rate limit on success
    attempts.delete(ip)

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json(
      { valid: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
