import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { calculateMatchScore } from '@/lib/services/matching'
import { getCreatorProfile, getBrandProfile } from '@/lib/api/profiles'
import { getUser } from '@/lib/api/users'
import { getOrCreateConversation } from '@/lib/api/conversations'

export interface MatchFilters {
  minReach?: number
  maxReach?: number
  vertical?: string
  verified?: boolean
  adSpendRange?: string
  search?: string
  // New filters for brands viewing creators
  platform?: string
  minFollowersIg?: number
  maxFollowersIg?: number
  minFollowersTiktok?: number
  maxFollowersTiktok?: number
  hasPortfolio?: boolean
  // New filters for creators viewing brands
  hasPreviousCampaigns?: boolean
}

export async function createMatch(
  creatorId: string,
  brandId: string,
  status: 'pending' | 'shortlisted' | 'rejected' = 'pending'
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Calculate match score
  const creator = await getUser(creatorId)
  const brand = await getUser(brandId)
  const creatorProfile = await getCreatorProfile(creatorId)
  const brandProfile = await getBrandProfile(brandId)

  if (!creator || !brand || !creatorProfile || !brandProfile) {
    throw new Error('User or profile not found')
  }

  const matchScore = calculateMatchScore(
    { profile: creatorProfile, user: creator },
    { profile: brandProfile, user: brand }
  )

  // Check if match already exists
  const { data: existingMatch } = await supabase
    .from('matches')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('brand_id', brandId)
    .single()

  if (existingMatch) {
    // Update existing match
    const { data, error } = await supabase
      .from('matches')
      .update({ 
        status,
        match_score: matchScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingMatch.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating match:', error)
      throw new Error(`Failed to update match: ${error.message}`)
    }

    // Auto-create conversation if shortlisted
    if (status === 'shortlisted') {
      try {
        await getOrCreateConversation(data.id)
      } catch (convError) {
        console.error('Error creating conversation:', convError)
        // Don't fail the match creation if conversation creation fails
      }
    }

    return data
  }

  // Create new match
  const { data, error } = await supabase
    .from('matches')
    .insert([{
      creator_id: creatorId,
      brand_id: brandId,
      match_score: matchScore,
      status
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating match:', error)
    throw new Error(`Failed to create match: ${error.message}`)
  }

  // Auto-create conversation if shortlisted
  if (status === 'shortlisted') {
    try {
      await getOrCreateConversation(data.id)
    } catch (convError) {
      console.error('Error creating conversation:', convError)
      // Don't fail the match creation if conversation creation fails
    }
  }

  return data
}

export async function updateMatchStatus(
  matchId: string,
  status: 'pending' | 'shortlisted' | 'rejected' | 'matched'
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', matchId)
    .select()
    .single()

  if (error) {
    console.error('Error updating match status:', error)
    throw new Error(`Failed to update match status: ${error.message}`)
  }

  return data
}

export async function getShortlistedMatches(userId: string, role: 'creator' | 'brand') {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const column = role === 'creator' ? 'creator_id' : 'brand_id'
  const oppositeColumn = role === 'creator' ? 'brand_id' : 'creator_id'

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq(column, userId)
    .eq('status', 'shortlisted')
    .order('match_score', { ascending: false })

  if (error) {
    console.error('Error fetching shortlisted matches:', error)
    throw new Error(`Failed to fetch shortlisted matches: ${error.message}`)
  }

  return data || []
}

export async function getRejectedMatches(userId: string, role: 'creator' | 'brand') {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const column = role === 'creator' ? 'creator_id' : 'brand_id'

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq(column, userId)
    .eq('status', 'rejected')

  if (error) {
    console.error('Error fetching rejected matches:', error)
    throw new Error(`Failed to fetch rejected matches: ${error.message}`)
  }

  return data || []
}

