import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export interface CampaignData {
  title: string
  deliverables: string[]
  kpis: string[]
  budget?: number
  timeline?: string
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
}

export async function createCampaign(brandId: string, campaignData: CampaignData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('campaigns')
    .insert([{
      brand_id: brandId,
      title: campaignData.title,
      deliverables: campaignData.deliverables || [],
      kpis: campaignData.kpis || [],
      budget: campaignData.budget || null,
      timeline: campaignData.timeline || null,
      status: campaignData.status || 'draft'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating campaign:', error)
    throw new Error(`Failed to create campaign: ${error.message}`)
  }

  return data
}

export async function getCampaign(campaignId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (error) {
    console.error('Error fetching campaign:', error)
    throw new Error(`Failed to fetch campaign: ${error.message}`)
  }

  return data
}

export async function getCampaignsForBrand(brandId: string, status?: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching campaigns:', error)
    throw new Error(`Failed to fetch campaigns: ${error.message}`)
  }

  return data || []
}

export async function updateCampaign(campaignId: string, campaignData: Partial<CampaignData>) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  if (campaignData.title !== undefined) updateData.title = campaignData.title
  if (campaignData.deliverables !== undefined) updateData.deliverables = campaignData.deliverables
  if (campaignData.kpis !== undefined) updateData.kpis = campaignData.kpis
  if (campaignData.budget !== undefined) updateData.budget = campaignData.budget
  if (campaignData.timeline !== undefined) updateData.timeline = campaignData.timeline
  if (campaignData.status !== undefined) updateData.status = campaignData.status

  const { data, error } = await supabase
    .from('campaigns')
    .update(updateData)
    .eq('id', campaignId)
    .select()
    .single()

  if (error) {
    console.error('Error updating campaign:', error)
    throw new Error(`Failed to update campaign: ${error.message}`)
  }

  return data
}

export async function deleteCampaign(campaignId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId)

  if (error) {
    console.error('Error deleting campaign:', error)
    throw new Error(`Failed to delete campaign: ${error.message}`)
  }

  return { success: true }
}


