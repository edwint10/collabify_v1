/**
 * TikTok Business API Integration
 * Documentation: https://developers.tiktok.com/doc/
 */

export interface TikTokBusinessConfig {
  clientKey: string
  clientSecret: string
  redirectUri: string
}

export interface TikTokBusinessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  refresh_expires_in: number
  scope: string
}

export interface TikTokBusinessAdvertiser {
  advertiser_id: string
  advertiser_name: string
  currency: string
  timezone: string
}

export interface TikTokBusinessVideo {
  video_id: string
  video_url: string
  title: string
  cover_image_url: string
  duration: number
  like_count: number
  comment_count: number
  share_count: number
  view_count: number
  create_time: number
}

export class TikTokBusinessAPI {
  private clientKey: string
  private clientSecret: string
  private redirectUri: string
  private baseUrl = 'https://www.tiktok.com'
  private apiUrl = 'https://business-api.tiktok.com'

  constructor(config: TikTokBusinessConfig) {
    this.clientKey = config.clientKey
    this.clientSecret = config.clientSecret
    this.redirectUri = config.redirectUri
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      redirect_uri: this.redirectUri,
      scope: 'user.info.basic,video.list,advertiser.info.basic',
      response_type: 'code',
      ...(state && { state }),
    })

    return `${this.baseUrl}/v2/auth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TikTokBusinessTokenResponse> {
    const response = await fetch(`${this.apiUrl}/open_api/v1/oauth2/access_token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`TikTok Business API error: ${error.error_description || 'Failed to exchange code'}`)
    }

    return response.json()
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TikTokBusinessTokenResponse> {
    const response = await fetch(`${this.apiUrl}/open_api/v1/oauth2/refresh_token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`TikTok Business API error: ${error.error_description || 'Failed to refresh token'}`)
    }

    return response.json()
  }

  /**
   * Get advertiser information
   */
  async getAdvertiserInfo(accessToken: string): Promise<{ data: { list: TikTokBusinessAdvertiser[] } }> {
    const response = await fetch(`${this.apiUrl}/open_api/v1/advertiser/info/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`TikTok Business API error: ${error.error_description || 'Failed to get advertiser info'}`)
    }

    return response.json()
  }

  /**
   * Get video analytics
   */
  async getVideoAnalytics(accessToken: string, advertiserId: string, videoIds: string[]): Promise<any> {
    const response = await fetch(`${this.apiUrl}/open_api/v1/video/analytics/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        advertiser_id: advertiserId,
        video_ids: videoIds,
        metrics: ['video_views', 'likes', 'comments', 'shares'],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`TikTok Business API error: ${error.error_description || 'Failed to get video analytics'}`)
    }

    return response.json()
  }
}


