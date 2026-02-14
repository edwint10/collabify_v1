import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { verifyUserAuth } from '@/lib/utils/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandId = searchParams.get('brandId')
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, all

    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    // Verify authentication
    await verifyUserAuth(request, brandId)

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date | null = null
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = null
        break
    }

    // Get all campaigns for this brand
    let campaignsQuery = supabase
      .from('campaigns')
      .select('id, title, budget, status, created_at')
      .eq('brand_id', brandId)

    if (startDate) {
      campaignsQuery = campaignsQuery.gte('created_at', startDate.toISOString())
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery

    if (campaignsError) {
      throw new Error(`Failed to fetch campaigns: ${campaignsError.message}`)
    }

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        totalSpent: 0,
        totalRevenue: 0,
        totalROI: 0,
        totalReach: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        averageEngagementRate: 0,
        averageConversionRate: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        campaigns: [],
        metricsByDate: [],
        campaignsBreakdown: []
      })
    }

    const campaignIds = campaigns.map(c => c.id)

    // Get campaign creators (to link to performance metrics)
    const { data: campaignCreators, error: ccError } = await supabase
      .from('campaign_creators')
      .select('id, campaign_id, creator_id, status, earnings')
      .in('campaign_id', campaignIds)

    if (ccError) {
      throw new Error(`Failed to fetch campaign creators: ${ccError.message}`)
    }

    const campaignCreatorIds = campaignCreators?.map(cc => cc.id) || []

    // Get performance metrics
    let metricsQuery = supabase
      .from('performance_metrics')
      .select('*')
      .in('campaign_creator_id', campaignCreatorIds)

    if (startDate && campaignCreatorIds.length > 0) {
      const dateString = startDate.toISOString().split('T')[0]
      metricsQuery = metricsQuery.gte('date', dateString)
    }

    const { data: metrics, error: metricsError } = await metricsQuery.order('date', { ascending: true })

    if (metricsError) {
      throw new Error(`Failed to fetch metrics: ${metricsError.message}`)
    }

    // Calculate totals
    const totalSpent = campaigns.reduce((sum, c) => {
      const budget = typeof c.budget === 'string' ? parseFloat(c.budget) : (c.budget || 0)
      return sum + budget
    }, 0)
    const totalEarnings = campaignCreators?.reduce((sum, cc) => sum + (parseFloat(cc.earnings) || 0), 0) || 0
    const totalRevenue = metrics?.reduce((sum, m) => sum + (parseFloat(m.revenue) || 0), 0) || 0
    const totalReach = metrics?.reduce((sum, m) => sum + (m.reach || 0), 0) || 0
    const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0
    const totalClicks = metrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0
    const totalConversions = metrics?.reduce((sum, m) => sum + (m.conversions || 0), 0) || 0

    // Calculate ROI: ((Revenue - Spent) / Spent) * 100
    const totalROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0

    // Calculate averages
    const validMetrics = metrics?.filter(m => m.impressions > 0) || []
    const averageEngagementRate = validMetrics.length > 0
      ? validMetrics.reduce((sum, m) => sum + (parseFloat(m.engagement_rate) || 0), 0) / validMetrics.length
      : 0
    const averageConversionRate = validMetrics.length > 0
      ? validMetrics.reduce((sum, m) => sum + (parseFloat(m.conversion_rate) || 0), 0) / validMetrics.length
      : 0

    // Group metrics by date
    const metricsByDate = (metrics || []).reduce((acc: any[], metric) => {
      const date = metric.date
      const existing = acc.find(m => m.date === date)
      
      if (existing) {
        existing.reach += metric.reach || 0
        existing.impressions += metric.impressions || 0
        existing.clicks += metric.clicks || 0
        existing.conversions += metric.conversions || 0
        existing.revenue += parseFloat(metric.revenue) || 0
      } else {
        acc.push({
          date,
          reach: metric.reach || 0,
          impressions: metric.impressions || 0,
          clicks: metric.clicks || 0,
          conversions: metric.conversions || 0,
          revenue: parseFloat(metric.revenue) || 0
        })
      }
      
      return acc
    }, [])

    // Campaign breakdown with ROI
    const campaignsBreakdown = campaigns.map(campaign => {
      const campaignCCs = campaignCreators?.filter(cc => cc.campaign_id === campaign.id) || []
      const campaignCreatorIds = campaignCCs.map(cc => cc.id)
      const campaignMetrics = metrics?.filter(m => campaignCreatorIds.includes(m.campaign_creator_id)) || []
      
      const campaignSpent = typeof campaign.budget === 'string' ? parseFloat(campaign.budget) : (campaign.budget || 0)
      const campaignEarnings = campaignCCs.reduce((sum, cc) => sum + (parseFloat(cc.earnings) || 0), 0)
      const campaignRevenue = campaignMetrics.reduce((sum, m) => sum + (parseFloat(m.revenue) || 0), 0)
      const campaignReach = campaignMetrics.reduce((sum, m) => sum + (m.reach || 0), 0)
      const campaignImpressions = campaignMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0)
      const campaignClicks = campaignMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0)
      const campaignConversions = campaignMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0)
      
      const campaignROI = campaignSpent > 0 ? ((campaignRevenue - campaignSpent) / campaignSpent) * 100 : 0
      const campaignConversionRate = campaignClicks > 0 ? (campaignConversions / campaignClicks) * 100 : 0
      const campaignEngagementRate = campaignImpressions > 0 ? (campaignClicks / campaignImpressions) * 100 : 0
      
      return {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        status: campaign.status,
        budget: campaignSpent,
        spent: campaignEarnings,
        revenue: campaignRevenue,
        roi: campaignROI,
        reach: campaignReach,
        impressions: campaignImpressions,
        clicks: campaignClicks,
        conversions: campaignConversions,
        conversionRate: campaignConversionRate,
        engagementRate: campaignEngagementRate,
        creatorsCount: campaignCCs.length,
      }
    })

    const activeCampaigns = campaigns.filter(c => c.status === 'active').length
    const completedCampaigns = campaigns.filter(c => c.status === 'completed').length

    return NextResponse.json({
      totalSpent,
      totalRevenue,
      totalROI: parseFloat(totalROI.toFixed(2)),
      totalReach,
      totalImpressions,
      totalClicks,
      totalConversions,
      averageEngagementRate: parseFloat(averageEngagementRate.toFixed(2)),
      averageConversionRate: parseFloat(averageConversionRate.toFixed(2)),
      totalCampaigns: campaigns.length,
      activeCampaigns,
      completedCampaigns,
      campaigns: campaigns || [],
      metricsByDate,
      campaignsBreakdown
    })
  } catch (error: any) {
    console.error('Error in get brand performance API:', error)
    
    if (error.message.includes('Authentication required') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid user')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}

