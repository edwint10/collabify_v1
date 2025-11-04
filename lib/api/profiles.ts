import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export interface CreatorProfileData {
  instagram_handle?: string
  tiktok_handle?: string
  follower_count_ig?: number
  follower_count_tiktok?: number
  bio?: string
  portfolio_items?: any[]
}

export interface BrandProfileData {
  company_name: string
  vertical?: string
  ad_spend_range?: string
  bio?: string
  previous_campaigns?: any[]
}

export async function createCreatorProfile(userId: string, profileData: CreatorProfileData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  // Check if profile already exists
  const existingProfile = await getCreatorProfile(userId)
  
  if (existingProfile) {
    // Update existing profile instead of creating a new one
    return await updateCreatorProfile(userId, profileData)
  }
  
  // Create new profile
  const { data, error } = await supabase
    .from('creator_profiles')
    .insert([{ user_id: userId, ...profileData }])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating creator profile:', error)
    throw new Error(`Failed to create creator profile: ${error.message}`)
  }
  
  return data
}

export async function createBrandProfile(userId: string, profileData: BrandProfileData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  // Check if profile already exists
  const existingProfile = await getBrandProfile(userId)
  
  if (existingProfile) {
    // Update existing profile instead of creating a new one
    return await updateBrandProfile(userId, profileData)
  }
  
  // Create new profile
  const { data, error } = await supabase
    .from('brand_profiles')
    .insert([{ user_id: userId, ...profileData }])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating brand profile:', error)
    throw new Error(`Failed to create brand profile: ${error.message}`)
  }
  
  return data
}

export async function getCreatorProfile(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found
      return null
    }
    console.error('Error fetching creator profile:', error)
    throw new Error(`Failed to fetch creator profile: ${error.message}`)
  }
  
  return data
}

export async function getBrandProfile(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found
      return null
    }
    console.error('Error fetching brand profile:', error)
    throw new Error(`Failed to fetch brand profile: ${error.message}`)
  }
  
  return data
}

export async function updateCreatorProfile(userId: string, profileData: Partial<CreatorProfileData>) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('creator_profiles')
    .update(profileData)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating creator profile:', error)
    throw new Error(`Failed to update creator profile: ${error.message}`)
  }
  
  return data
}

export async function updateBrandProfile(userId: string, profileData: Partial<BrandProfileData>) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('brand_profiles')
    .update(profileData)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating brand profile:', error)
    throw new Error(`Failed to update brand profile: ${error.message}`)
  }
  
  return data
}

