import { NextRequest, NextResponse } from 'next/server'
import { createBrandProfile } from '@/lib/api/profiles'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const profile = await createBrandProfile(userId, profileData)

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create brand profile API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create brand profile' },
      { status: 500 }
    )
  }
}

