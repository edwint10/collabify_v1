import { NextRequest, NextResponse } from 'next/server'
import { updateBrandProfile } from '@/lib/api/profiles'

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

    const profile = await updateBrandProfile(userId, profileData)

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error: any) {
    console.error('Error in update brand profile API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update brand profile' },
      { status: 500 }
    )
  }
}

