import { getCreatorProfile } from '@/lib/api/profiles'
import { getBrandProfile } from '@/lib/api/profiles'
import { getUser } from '@/lib/api/users'

export interface MatchResult {
  userId: string
  role: 'creator' | 'brand'
  profile: any
  matchScore: number
}

export interface CreatorProfile {
  user_id: string
  instagram_handle?: string
  tiktok_handle?: string
  follower_count_ig?: number
  follower_count_tiktok?: number
  bio?: string
}

export interface BrandProfile {
  user_id: string
  company_name: string
  vertical?: string
  ad_spend_range?: string
  bio?: string
}

/**
 * Calculate match score between a creator and brand
 * Scoring weights:
 * - Vertical match: 30%
 * - Reach/budget match: 25%
 * - Verification: 15%
 * - Profile completeness: 10%
 * - Bio/keyword match: 20% (optional)
 */
export function calculateMatchScore(
  creator: { profile: CreatorProfile | null; user: any },
  brand: { profile: BrandProfile | null; user: any }
): number {
  if (!creator.profile || !brand.profile) {
    return 0
  }

  let score = 0
  let maxScore = 100

  // Vertical match (30%)
  // For MVP, we'll do simple vertical matching
  // In future, this could match creator's niche/vertical from bio or tags
  if (brand.profile.vertical) {
    score += 30 // Full points if brand has vertical set
  }

  // Reach/budget match (25%)
  const creatorReach = (creator.profile.follower_count_ig || 0) + (creator.profile.follower_count_tiktok || 0)
  const brandBudget = getBudgetRangeValue(brand.profile.ad_spend_range)
  
  if (creatorReach > 0 && brandBudget > 0) {
    // Simple matching: larger reach = higher budget needed
    // Scale: reach 0-100k = budget 0-10k, reach 100k-500k = budget 10k-50k, etc.
    const reachRatio = Math.min(1, creatorReach / 500000) // Normalize to 0-1
    const budgetRatio = Math.min(1, brandBudget / 100000) // Normalize to 0-1
    // Score based on how well they match (closer ratios = higher score)
    const matchRatio = 1 - Math.abs(reachRatio - budgetRatio)
    score += (matchRatio * 25)
  } else {
    score += 12.5 // Half points if one is missing
  }

  // Verification (15%)
  if (creator.user.verified && brand.user.verified) {
    score += 15
  } else if (creator.user.verified || brand.user.verified) {
    score += 7.5
  }

  // Profile completeness (10%)
  const creatorCompleteness = calculateProfileCompleteness(creator.profile)
  const brandCompleteness = calculateProfileCompleteness(brand.profile)
  const avgCompleteness = (creatorCompleteness + brandCompleteness) / 2
  score += (avgCompleteness * 0.1)

  // Bio/keyword match (20%) - Basic implementation
  if (creator.profile.bio && brand.profile.bio) {
    const bioMatch = calculateBioMatch(creator.profile.bio, brand.profile.bio)
    score += (bioMatch * 0.2)
  } else {
    score += 10 // Half points if one is missing
  }

  return Math.round(score * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert ad spend range string to numeric value for comparison
 */
function getBudgetRangeValue(range: string | undefined): number {
  if (!range) return 0
  
  const ranges: Record<string, number> = {
    'under-1k': 500,
    '1k-5k': 3000,
    '5k-10k': 7500,
    '10k-25k': 17500,
    '25k-50k': 37500,
    '50k-100k': 75000,
    'over-100k': 150000,
  }
  
  return ranges[range] || 0
}

/**
 * Calculate profile completeness percentage
 */
function calculateProfileCompleteness(profile: CreatorProfile | BrandProfile): number {
  let filled = 0
  let total = 0

  if ('instagram_handle' in profile || 'tiktok_handle' in profile) {
    // Creator profile
    const creatorProfile = profile as CreatorProfile
    total = 5
    if (creatorProfile.instagram_handle) filled++
    if (creatorProfile.tiktok_handle) filled++
    if (creatorProfile.follower_count_ig && creatorProfile.follower_count_ig > 0) filled++
    if (creatorProfile.follower_count_tiktok && creatorProfile.follower_count_tiktok > 0) filled++
    if (creatorProfile.bio) filled++
  } else {
    // Brand profile
    const brandProfile = profile as BrandProfile
    total = 4
    if (brandProfile.company_name) filled++
    if (brandProfile.vertical) filled++
    if (brandProfile.ad_spend_range) filled++
    if (brandProfile.bio) filled++
  }

  return (filled / total) * 100
}

/**
 * Basic bio keyword matching
 */
function calculateBioMatch(creatorBio: string, brandBio: string): number {
  const creatorWords = creatorBio.toLowerCase().split(/\s+/)
  const brandWords = brandBio.toLowerCase().split(/\s+/)
  
  const commonWords = creatorWords.filter(word => 
    word.length > 3 && brandWords.includes(word)
  )
  
  // Simple scoring based on common words
  const matchPercentage = Math.min(100, (commonWords.length / Math.max(creatorWords.length, brandWords.length)) * 100)
  return matchPercentage
}

/**
 * Find and rank potential matches for a user
 * Note: This is a helper function. Actual database queries will be done in API routes
 */
export async function rankMatches(
  currentUser: any,
  currentProfile: CreatorProfile | BrandProfile | null,
  potentialMatches: Array<{ user: any; profile: CreatorProfile | BrandProfile | null }>,
  role: 'creator' | 'brand'
): Promise<MatchResult[]> {
  if (!currentProfile) {
    return []
  }

  const matchResults: MatchResult[] = []

  for (const match of potentialMatches) {
    if (!match.profile) continue

    let score = 0
    if (role === 'creator') {
      // Creator viewing brands
      score = calculateMatchScore(
        { profile: currentProfile as CreatorProfile, user: currentUser },
        { profile: match.profile as BrandProfile, user: match.user }
      )
    } else {
      // Brand viewing creators
      score = calculateMatchScore(
        { profile: match.profile as CreatorProfile, user: match.user },
        { profile: currentProfile as BrandProfile, user: currentUser }
      )
    }

    matchResults.push({
      userId: match.user.id,
      role: role === 'creator' ? 'brand' : 'creator',
      profile: match.profile,
      matchScore: score
    })
  }

  // Sort by match score (highest first)
  return matchResults.sort((a, b) => b.matchScore - a.matchScore)
}

