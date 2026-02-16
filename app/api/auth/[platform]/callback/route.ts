import { NextRequest, NextResponse } from 'next/server'
import { getSocialMediaManager } from '@/lib/services/social-media'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { verifyUserAuth } from '@/lib/utils/auth'

type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'tiktok_business'

// Map URL platform names to internal platform names
const platformMap: Record<string, string> = {
  'tiktok-business': 'tiktok_business',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const urlPlatform = params.platform
    const platform = (platformMap[urlPlatform] || urlPlatform) as Platform
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_code_or_state', request.url)
      )
    }

    // Decode state to get userId and any additional data
    let userId: string
    let codeVerifier: string | undefined
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString())
      userId = decodedState.userId
      codeVerifier = decodedState.codeVerifier
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_state', request.url)
      )
    }

    // Verify authentication
    await verifyUserAuth(request, userId)

    // Exchange code for token
    const manager = getSocialMediaManager()
    const api = manager.getAPI(platform)
    
    // For Twitter, pass code_verifier for PKCE
    let tokenResponse: any
    if (platform === 'twitter' && api && codeVerifier) {
      tokenResponse = await (api as any).exchangeCodeForToken(code, codeVerifier)
    } else {
      tokenResponse = await manager.exchangeCodeForToken(platform, code)
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get user info from platform
    let platformUserId: string
    let username: string | undefined
    let metadata: any = {}

    try {
      if (platform === 'instagram' && api) {
        const user = await (api as any).getUserProfile(tokenResponse.access_token)
        platformUserId = user.id
        username = user.username
        metadata = { account_type: user.account_type, media_count: user.media_count }
      } else if (platform === 'tiktok' && api) {
        const response = await (api as any).getUserInfo(tokenResponse.access_token)
        platformUserId = response.data.user.open_id
        username = response.data.user.username || response.data.user.display_name
        metadata = { avatar_url: response.data.user.avatar_url }
      } else if (platform === 'youtube' && api) {
        const response = await (api as any).getChannelInfo(tokenResponse.access_token)
        if (response.items && response.items.length > 0) {
          platformUserId = response.items[0].id
          username = response.items[0].snippet.customUrl || response.items[0].snippet.title
          metadata = {
            title: response.items[0].snippet.title,
            subscriber_count: response.items[0].statistics.subscriberCount,
            video_count: response.items[0].statistics.videoCount,
          }
        } else {
          throw new Error('No channel found')
        }
      } else if (platform === 'twitter' && api) {
        const response = await (api as any).getUserInfo(tokenResponse.access_token)
        platformUserId = response.data.id
        username = response.data.username
        metadata = {
          name: response.data.name,
          followers_count: response.data.public_metrics?.followers_count,
          following_count: response.data.public_metrics?.following_count,
        }
      } else if (platform === 'tiktok_business' && api) {
        const response = await (api as any).getAdvertiserInfo(tokenResponse.access_token)
        if (response.data && response.data.list && response.data.list.length > 0) {
          platformUserId = response.data.list[0].advertiser_id
          username = response.data.list[0].advertiser_name
          metadata = {
            advertiser_name: response.data.list[0].advertiser_name,
            currency: response.data.list[0].currency,
          }
        } else {
          throw new Error('No advertiser found')
        }
      } else {
        throw new Error('Platform API not available')
      }
    } catch (err: any) {
      console.error('Error fetching user info:', err)
      // Still save the account even if we can't fetch user info
      platformUserId = 'unknown'
    }

    // Calculate token expiration
    const expiresIn = tokenResponse.expires_in || 3600
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000)

    // Save or update social account
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single()

    const accountData = {
      user_id: userId,
      platform,
      platform_user_id: platformUserId,
      username,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token || null,
      token_expires_at: tokenExpiresAt.toISOString(),
      scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : [],
      metadata,
      is_active: true,
    }

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await supabase
        .from('social_accounts')
        .update(accountData)
        .eq('id', existingAccount.id)

      if (updateError) throw updateError
    } else {
      // Create new account
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert([accountData])

      if (insertError) throw insertError
    }

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL(`/dashboard?connected=${platform}`, request.url)
    )
  } catch (error: any) {
    console.error('Error in OAuth callback:', error)
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error.message || 'OAuth failed')}`, request.url)
    )
  }
}

