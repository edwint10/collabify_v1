"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, Target, Eye, MousePointerClick, Users, BarChart3, TrendingDown } from "lucide-react"

interface BrandPerformanceData {
  totalSpent: number
  totalRevenue: number
  totalROI: number
  totalReach: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  averageEngagementRate: number
  averageConversionRate: number
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  metricsByDate: Array<{
    date: string
    reach: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
  }>
  campaignsBreakdown: Array<{
    campaignId: string
    campaignTitle: string
    status: string
    budget: number
    spent: number
    revenue: number
    roi: number
    reach: number
    impressions: number
    clicks: number
    conversions: number
    conversionRate: number
    engagementRate: number
    creatorsCount: number
  }>
}

interface BrandPerformanceTrackerProps {
  brandId: string
}

export default function BrandPerformanceTracker({ brandId }: BrandPerformanceTrackerProps) {
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BrandPerformanceData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true)
      setError(null)

      try {
        const userId = localStorage.getItem('userId')
        const response = await fetch(`/api/brands/performance?brandId=${brandId}&period=${period}`, {
          headers: {
            'X-User-Id': userId || '',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch performance data')
        }

        const performanceData = await response.json()
        setData(performanceData)
      } catch (err: any) {
        console.error('Error fetching performance:', err)
        setError(err.message || 'Failed to load performance data')
      } finally {
        setLoading(false)
      }
    }

    if (brandId) {
      fetchPerformance()
    }
  }, [brandId, period])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">Loading performance data...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-destructive py-8">
            {error || 'No performance data available'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Calculate max values for charts
  const maxReach = Math.max(...data.metricsByDate.map(m => m.reach), 1)
  const maxRevenue = Math.max(...data.metricsByDate.map(m => m.revenue), 1)

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <p className="text-gray-600">Track ROI, KPIs, and campaign performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key ROI & Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ROI</CardTitle>
            {data.totalROI >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.totalROI >= 0 ? '+' : ''}{data.totalROI.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Generated from campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Campaign budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(data.totalRevenue - data.totalSpent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.totalRevenue - data.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue - Spent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.activeCampaigns} active, {data.completedCampaigns} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.averageConversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.averageEngagementRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Reach & Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(data.totalReach)}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique users reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(data.totalImpressions)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(data.totalClicks)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(data.totalConversions)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reach Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reach Over Time
            </CardTitle>
            <CardDescription>Daily reach for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.metricsByDate.length > 0 ? (
                data.metricsByDate.map((metric, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors"
                        style={{
                          height: `${(metric.reach / maxReach) * 100}%`,
                          minHeight: metric.reach > 0 ? '4px' : '0',
                        }}
                        title={`${formatNumber(metric.reach)} reach on ${new Date(metric.date).toLocaleDateString()}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                      {new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 w-full">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Over Time
            </CardTitle>
            <CardDescription>Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.metricsByDate.length > 0 ? (
                data.metricsByDate.map((metric, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                        style={{
                          height: `${(metric.revenue / maxRevenue) * 100}%`,
                          minHeight: metric.revenue > 0 ? '4px' : '0',
                        }}
                        title={`${formatCurrency(metric.revenue)} on ${new Date(metric.date).toLocaleDateString()}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                      {new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 w-full">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Breakdown with ROI */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Breakdown</CardTitle>
          <CardDescription>ROI, KPIs, and metrics by campaign</CardDescription>
        </CardHeader>
        <CardContent>
          {data.campaignsBreakdown.length > 0 ? (
            <div className="space-y-4">
              {data.campaignsBreakdown.map((campaign, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{campaign.campaignTitle}</h4>
                      <p className="text-sm text-gray-500">
                        {campaign.creatorsCount} creator{campaign.creatorsCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${campaign.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {campaign.roi >= 0 ? '+' : ''}{campaign.roi.toFixed(1)}% ROI
                        </div>
                        <p className="text-xs text-gray-500">Return on investment</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-semibold">{formatCurrency(campaign.budget)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-semibold">{formatCurrency(campaign.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reach</p>
                      <p className="font-semibold">{formatNumber(campaign.reach)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conversions</p>
                      <p className="font-semibold">{formatNumber(campaign.conversions)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Impressions</p>
                      <p className="font-semibold">{formatNumber(campaign.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Clicks</p>
                      <p className="font-semibold">{formatNumber(campaign.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Engagement Rate</p>
                      <p className="font-semibold">{campaign.engagementRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conversion Rate</p>
                      <p className="font-semibold">{campaign.conversionRate.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No campaign data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


