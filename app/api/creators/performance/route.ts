import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { verifyUserAuth } from '@/lib/utils/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const creatorId = searchParams.get('creatorId')
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, all

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      )
    }

    // Verify authentication
    await verifyUserAuth(request, creatorId)

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

    // Get campaign creators for this creator
    let campaignCreatorsQuery = supabase
      .from('campaign_creators')
      .select('id, campaign_id, status, earnings, created_at')
      .eq('creator_id', creatorId)

    if (startDate) {
      campaignCreatorsQuery = campaignCreatorsQuery.gte('created_at', startDate.toISOString())
    }

    const { data: campaignCreators, error: ccError } = await campaignCreatorsQuery

    if (ccError) {
      throw new Error(`Failed to fetch campaign creators: ${ccError.message}`)
    }

    if (!campaignCreators || campaignCreators.length === 0) {
      return NextResponse.json({
        totalEarnings: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        averageEngagementRate: 0,
        averageConversionRate: 0,
        totalRevenue: 0,
        campaigns: [],
        metricsByDate: [],
        campaignsBreakdown: []
      })
    }

    const campaignCreatorIds = campaignCreators.map(cc => cc.id)

    // Get performance metrics
    let metricsQuery = supabase
      .from('performance_metrics')
      .select('*')
      .in('campaign_creator_id', campaignCreatorIds)

    if (startDate) {
      const dateString = startDate.toISOString().split('T')[0]
      metricsQuery = metricsQuery.gte('date', dateString)
    }

    const { data: metrics, error: metricsError } = await metricsQuery.order('date', { ascending: true })

    if (metricsError) {
      throw new Error(`Failed to fetch metrics: ${metricsError.message}`)
    }

    // Get campaign details
    const campaignIds = [...new Set(campaignCreators.map(cc => cc.campaign_id))]
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, budget, status, created_at')
      .in('id', campaignIds)

    if (campaignsError) {
      throw new Error(`Failed to fetch campaigns: ${campaignsError.message}`)
    }

    // Calculate totals
    const totalEarnings = campaignCreators.reduce((sum, cc) => sum + (parseFloat(cc.earnings) || 0), 0)
    const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0
    const totalClicks = metrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0
    const totalConversions = metrics?.reduce((sum, m) => sum + (m.conversions || 0), 0) || 0
    const totalRevenue = metrics?.reduce((sum, m) => sum + (parseFloat(m.revenue) || 0), 0) || 0

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
        existing.impressions += metric.impressions || 0
        existing.clicks += metric.clicks || 0
        existing.conversions += metric.conversions || 0
        existing.revenue += parseFloat(metric.revenue) || 0
      } else {
        acc.push({
          date,
          impressions: metric.impressions || 0,
          clicks: metric.clicks || 0,
          conversions: metric.conversions || 0,
          revenue: parseFloat(metric.revenue) || 0
        })
      }
      
      return acc
    }, [])

    // Campaign breakdown
    const campaignsBreakdown = campaignCreators.map(cc => {
      const campaign = campaigns?.find(c => c.id === cc.campaign_id)
      const campaignMetrics = metrics?.filter(m => m.campaign_creator_id === cc.id) || []
      
      const campaignImpressions = campaignMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0)
      const campaignClicks = campaignMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0)
      const campaignConversions = campaignMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0)
      const campaignRevenue = campaignMetrics.reduce((sum, m) => sum + (parseFloat(m.revenue) || 0), 0)
      
      return {
        campaignId: cc.campaign_id,
        campaignTitle: campaign?.title || 'Unknown Campaign',
        status: cc.status,
        earnings: parseFloat(cc.earnings) || 0,
        impressions: campaignImpressions,
        clicks: campaignClicks,
        conversions: campaignConversions,
        revenue: campaignRevenue,
        conversionRate: campaignClicks > 0 ? (campaignConversions / campaignClicks) * 100 : 0,
        engagementRate: campaignImpressions > 0 ? (campaignClicks / campaignImpressions) * 100 : 0
      }
    })

    return NextResponse.json({
      totalEarnings,
      totalImpressions,
      totalClicks,
      totalConversions,
      averageEngagementRate: parseFloat(averageEngagementRate.toFixed(2)),
      averageConversionRate: parseFloat(averageConversionRate.toFixed(2)),
      totalRevenue,
      campaigns: campaigns || [],
      metricsByDate,
      campaignsBreakdown
    })
  } catch (error: any) {
    console.error('Error in get creator performance API:', error)
    
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

