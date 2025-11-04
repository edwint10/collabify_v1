import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getUser } from '@/lib/api/users'
import { getCreatorProfile, getBrandProfile } from '@/lib/api/profiles'
import { rankMatches } from '@/lib/services/matching'
import { getRejectedMatches } from '@/lib/api/matches'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') as 'creator' | 'brand'
    const minReach = searchParams.get('minReach') ? parseInt(searchParams.get('minReach')!) : undefined
    const maxReach = searchParams.get('maxReach') ? parseInt(searchParams.get('maxReach')!) : undefined
    const vertical = searchParams.get('vertical') || undefined
    const verified = searchParams.get('verified') === 'true' ? true : undefined
    const adSpendRange = searchParams.get('adSpendRange') || undefined
    const search = searchParams.get('search') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    if (!userId || !role || (role !== 'creator' && role !== 'brand')) {
      return NextResponse.json(
        { error: 'User ID and valid role (creator or brand) are required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get current user and profile
    const currentUser = await getUser(userId)
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentProfile = role === 'creator'
      ? await getCreatorProfile(userId)
      : await getBrandProfile(userId)

    if (!currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get rejected matches to exclude
    const rejectedMatches = await getRejectedMatches(userId, role)
    const rejectedUserIds = rejectedMatches.map(m => 
      role === 'creator' ? m.brand_id : m.creator_id
    )

    // Get all existing matches to exclude
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('creator_id, brand_id')
      .eq(role === 'creator' ? 'creator_id' : 'brand_id', userId)

    const existingUserIds = existingMatches?.map(m => 
      role === 'creator' ? m.brand_id : m.creator_id
    ) || []

    // Combine rejected and existing user IDs to exclude
    const excludeUserIds = [...new Set([...rejectedUserIds, ...existingUserIds])]

    // Fetch all users of opposite role with profiles
    const oppositeRole = role === 'creator' ? 'brand' : 'creator'
    
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', oppositeRole)

    // Apply verification filter
    if (verified !== undefined) {
      query = query.eq('verified', verified)
    }

    const { data: oppositeUsers, error: usersError } = await query

    // Filter out excluded users in JavaScript (more reliable than Supabase query)
    const filteredUsers = oppositeUsers?.filter(user => !excludeUserIds.includes(user.id)) || []

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!filteredUsers || filteredUsers.length === 0) {
      return NextResponse.json({ matches: [] }, { status: 200 })
    }

    // Fetch profiles for all opposite role users
    const profilePromises = filteredUsers.map(user =>
      oppositeRole === 'creator'
        ? getCreatorProfile(user.id)
        : getBrandProfile(user.id)
    )

    const profiles = await Promise.all(profilePromises)

    // Combine users with their profiles
    const potentialMatches = filteredUsers
      .map((user, index) => ({
        user,
        profile: profiles[index]
      }))
      .filter(match => match.profile !== null) // Only include users with profiles

    // Apply filters
    let filteredMatches = potentialMatches

    if (minReach !== undefined || maxReach !== undefined) {
      filteredMatches = filteredMatches.filter(match => {
        if (oppositeRole === 'creator' && match.profile && 'follower_count_ig' in match.profile) {
          const reach = (match.profile.follower_count_ig || 0) + (match.profile.follower_count_tiktok || 0)
          if (minReach !== undefined && reach < minReach) return false
          if (maxReach !== undefined && reach > maxReach) return false
          return true
        }
        return false
      })
    }

    if (vertical) {
      filteredMatches = filteredMatches.filter(match => {
        if (oppositeRole === 'brand' && match.profile && 'vertical' in match.profile) {
          return (match.profile as any).vertical === vertical
        }
        return false
      })
    }

    if (adSpendRange) {
      filteredMatches = filteredMatches.filter(match => {
        if (oppositeRole === 'brand' && match.profile && 'ad_spend_range' in match.profile) {
          return (match.profile as any).ad_spend_range === adSpendRange
        }
        return false
      })
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredMatches = filteredMatches.filter(match => {
        if (oppositeRole === 'brand' && match.profile && 'company_name' in match.profile) {
          return (match.profile as any).company_name?.toLowerCase().includes(searchLower)
        }
        if (oppositeRole === 'creator' && match.profile) {
          const profile = match.profile as any
          return profile.instagram_handle?.toLowerCase().includes(searchLower) ||
                 profile.tiktok_handle?.toLowerCase().includes(searchLower) ||
                 profile.bio?.toLowerCase().includes(searchLower)
        }
        return false
      })
    }

    // Calculate match scores and rank
    const rankedMatches = await rankMatches(
      currentUser,
      currentProfile,
      filteredMatches,
      role
    )

    // Apply pagination
    const paginatedMatches = rankedMatches.slice(offset, offset + limit)

    return NextResponse.json({
      matches: paginatedMatches || [],
      total: rankedMatches.length || 0,
      limit,
      offset: offset || 0
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get matches API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { creatorId, brandId, status } = body

    if (!creatorId || !brandId) {
      return NextResponse.json(
        { error: 'Creator ID and Brand ID are required' },
        { status: 400 }
      )
    }

    const { createMatch } = await import('@/lib/api/matches')
    const match = await createMatch(
      creatorId,
      brandId,
      status || 'pending'
    )

    return NextResponse.json({ match }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create match API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create match' },
      { status: 500 }
    )
  }
}

