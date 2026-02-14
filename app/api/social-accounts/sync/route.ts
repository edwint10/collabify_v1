import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { verifyUserAuth } from '@/lib/utils/auth'
import { getSocialMediaManager } from '@/lib/services/social-media'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, accountId } = body

    if (!userId || !accountId) {
      return NextResponse.json(
        { error: 'User ID and Account ID are required' },
        { status: 400 }
      )
    }

    // Verify authentication
    await verifyUserAuth(request, userId)

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get social account
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    if (!account.is_active) {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 400 }
      )
    }

    // Check if token is expired and refresh if needed
    let accessToken = account.access_token
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      if (!account.refresh_token) {
        return NextResponse.json(
          { error: 'Token expired and no refresh token available' },
          { status: 400 }
        )
      }

      // Refresh token
      const manager = getSocialMediaManager()
      const api = manager.getAPI(account.platform as any)
      
      if (!api) {
        return NextResponse.json(
          { error: 'Platform API not configured' },
          { status: 500 }
        )
      }

      try {
        const tokenResponse = await (api as any).refreshToken(account.refresh_token)
        accessToken = tokenResponse.access_token

        // Update token in database
        const expiresIn = tokenResponse.expires_in || 3600
        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000)

        await supabase
          .from('social_accounts')
          .update({
            access_token: accessToken,
            refresh_token: tokenResponse.refresh_token || account.refresh_token,
            token_expires_at: tokenExpiresAt.toISOString(),
          })
          .eq('id', accountId)
      } catch (refreshError: any) {
        console.error('Error refreshing token:', refreshError)
        return NextResponse.json(
          { error: 'Failed to refresh token. Please reconnect your account.' },
          { status: 401 }
        )
      }
    }

    // Fetch metrics from platform
    const manager = getSocialMediaManager()
    const api = manager.getAPI(account.platform as any)
    
    if (!api) {
      return NextResponse.json(
        { error: 'Platform API not configured' },
        { status: 500 }
      )
    }

    let metrics: any = {}
    const today = new Date().toISOString().split('T')[0]

    try {
      if (account.platform === 'instagram') {
        const user = await (api as any).getUserProfile(accessToken)
        const media = await (api as any).getUserMedia(accessToken, 10)
        
        const totalLikes = media.data?.reduce((sum: number, m: any) => sum + (m.like_count || 0), 0) || 0
        const totalComments = media.data?.reduce((sum: number, m: any) => sum + (m.comments_count || 0), 0) || 0
        
        metrics = {
          followers: 0, // Instagram Graph API doesn't provide follower count directly
          posts_count: user.media_count || 0,
          likes_count: totalLikes,
          comments_count: totalComments,
          engagement_rate: media.data?.length > 0 ? ((totalLikes + totalComments) / (media.data.length * 100)) * 100 : 0,
        }
      } else if (account.platform === 'tiktok') {
        const userInfo = await (api as any).getUserInfo(accessToken)
        const videos = await (api as any).getUserVideos(accessToken, 10)
        
        const totalViews = videos.data?.videos?.reduce((sum: number, v: any) => sum + (v.view_count || 0), 0) || 0
        const totalLikes = videos.data?.videos?.reduce((sum: number, v: any) => sum + (v.like_count || 0), 0) || 0
        const totalComments = videos.data?.videos?.reduce((sum: number, v: any) => sum + (v.comment_count || 0), 0) || 0
        const totalShares = videos.data?.videos?.reduce((sum: number, v: any) => sum + (v.share_count || 0), 0) || 0
        
        metrics = {
          followers: 0, // TikTok API doesn't provide follower count in basic scope
          posts_count: videos.data?.videos?.length || 0,
          views_count: totalViews,
          likes_count: totalLikes,
          comments_count: totalComments,
          shares_count: totalShares,
          engagement_rate: totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 : 0,
        }
      } else if (account.platform === 'youtube') {
        const channel = await (api as any).getChannelInfo(accessToken)
        
        if (channel.items && channel.items.length > 0) {
          const channelData = channel.items[0]
          metrics = {
            followers: parseInt(channelData.statistics.subscriberCount) || 0,
            posts_count: parseInt(channelData.statistics.videoCount) || 0,
            views_count: parseInt(channelData.statistics.viewCount) || 0,
          }
        }
      } else if (account.platform === 'twitter') {
        const userInfo = await (api as any).getUserInfo(accessToken)
        
        metrics = {
          followers: userInfo.data.public_metrics?.followers_count || 0,
          following: userInfo.data.public_metrics?.following_count || 0,
          posts_count: userInfo.data.public_metrics?.tweet_count || 0,
        }
      }
    } catch (syncError: any) {
      console.error('Error syncing metrics:', syncError)
      return NextResponse.json(
        { error: `Failed to sync metrics: ${syncError.message}` },
        { status: 500 }
      )
    }

    // Save metrics to database
    const { data: existingMetric } = await supabase
      .from('social_metrics')
      .select('id')
      .eq('social_account_id', accountId)
      .eq('date', today)
      .single()

    const metricData = {
      social_account_id: accountId,
      date: today,
      followers: metrics.followers || 0,
      following: metrics.following || 0,
      posts_count: metrics.posts_count || 0,
      likes_count: metrics.likes_count || 0,
      comments_count: metrics.comments_count || 0,
      shares_count: metrics.shares_count || 0,
      views_count: metrics.views_count || 0,
      engagement_rate: metrics.engagement_rate || 0,
      metadata: metrics,
    }

    if (existingMetric) {
      await supabase
        .from('social_metrics')
        .update(metricData)
        .eq('id', existingMetric.id)
    } else {
      await supabase
        .from('social_metrics')
        .insert([metricData])
    }

    return NextResponse.json({ success: true, metrics })
  } catch (error: any) {
    console.error('Error in sync social account API:', error)
    
    if (error.message.includes('Authentication required') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid user')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to sync social account' },
      { status: 500 }
    )
  }
}


