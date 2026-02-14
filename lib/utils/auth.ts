import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

/**
 * Get the current authenticated user from Supabase Auth session
 */
export async function getCurrentAuthUser() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Get the database user ID from the auth user ID
 */
export async function getUserIdFromAuth(authUserId: string): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()

  if (error || !user) {
    return null
  }

  return user.id
}

/**
 * Get the current user ID from the request headers (fallback for client-side)
 * The client should send userId in the X-User-Id header
 */
export function getCurrentUserId(request: NextRequest): string | null {
  // Try to get userId from headers first (sent by client)
  const userId = request.headers.get('x-user-id')
  
  if (userId) {
    return userId
  }

  // Fallback: try to get from query params (for GET requests)
  const searchParams = request.nextUrl.searchParams
  const queryUserId = searchParams.get('userId')
  
  return queryUserId
}

/**
 * Verify that the current user is authenticated and matches the target userId
 * Returns the authenticated userId or throws an error
 */
export async function verifyUserAuth(
  request: NextRequest,
  targetUserId?: string
): Promise<string> {
  // First try to get from Supabase Auth session
  const authUser = await getCurrentAuthUser()
  
  if (authUser) {
    // Get the database user ID from auth user ID
    const dbUserId = await getUserIdFromAuth(authUser.id)
    
    if (!dbUserId) {
      throw new Error('User profile not found. Please complete your profile setup.')
    }

    // If targetUserId is provided, verify they match
    if (targetUserId && dbUserId !== targetUserId) {
      throw new Error('Unauthorized: You can only access your own resources.')
    }

    return dbUserId
  }

  // Fallback to header-based auth for backward compatibility
  const currentUserId = getCurrentUserId(request)

  if (!currentUserId) {
    throw new Error('Authentication required. Please log in to continue.')
  }

  // If targetUserId is provided, verify they match
  if (targetUserId && currentUserId !== targetUserId) {
    throw new Error('Unauthorized: You can only access your own resources.')
  }

  // Verify user exists in database
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', currentUserId)
    .single()

  if (error || !user) {
    throw new Error('Invalid user. Please log in again.')
  }

  return currentUserId
}

/**
 * Get current user ID from request body (for POST/PUT requests)
 */
export function getUserIdFromBody(body: any): string | null {
  return body?.userId || null
}

