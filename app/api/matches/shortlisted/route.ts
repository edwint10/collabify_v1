import { NextRequest, NextResponse } from 'next/server'
import { getShortlistedMatches } from '@/lib/api/matches'
import { getUser } from '@/lib/api/users'
import { getCreatorProfile, getBrandProfile } from '@/lib/api/profiles'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') as 'creator' | 'brand'

    if (!userId || !role || (role !== 'creator' && role !== 'brand')) {
      return NextResponse.json(
        { error: 'User ID and valid role (creator or brand) are required' },
        { status: 400 }
      )
    }

    const matches = await getShortlistedMatches(userId, role)

    // Enrich matches with profile data
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        const oppositeUserId = role === 'creator' ? match.brand_id : match.creator_id
        const oppositeUser = await getUser(oppositeUserId)
        const oppositeProfile = role === 'creator'
          ? await getBrandProfile(oppositeUserId)
          : await getCreatorProfile(oppositeUserId)

        return {
          ...match,
          user: oppositeUser,
          profile: oppositeProfile
        }
      })
    )

    return NextResponse.json({ matches: enrichedMatches }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get shortlisted matches API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shortlisted matches' },
      { status: 500 }
    )
  }
}

