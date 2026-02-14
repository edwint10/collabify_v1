import { NextRequest, NextResponse } from 'next/server'
import { updateBrandProfile } from '@/lib/api/profiles'
import { verifyUserAuth } from '@/lib/utils/auth'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify authentication - user can only update their own profile
    await verifyUserAuth(request, userId)

    const profile = await updateBrandProfile(userId, profileData)

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error: any) {
    console.error('Error in update brand profile API:', error)
    
    // Return 401 for authentication errors
    if (error.message.includes('Authentication required') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid user')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update brand profile' },
      { status: 500 }
    )
  }
}

