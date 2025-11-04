import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/api/users'
import { getCreatorProfile, getBrandProfile } from '@/lib/api/profiles'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch user
    const user = await getUser(userId)

    // Fetch profile based on role
    let profile = null
    if (user.role === 'creator') {
      profile = await getCreatorProfile(userId)
    } else if (user.role === 'brand') {
      profile = await getBrandProfile(userId)
    }

    return NextResponse.json({ user, profile, role: user.role }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get profile API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

