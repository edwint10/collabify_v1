/**
 * Instagram Graph API Integration
 * Documentation: https://developers.facebook.com/docs/instagram-api
 */

export interface InstagramConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface InstagramTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

export interface InstagramUser {
  id: string
  username: string
  account_type: string
  media_count?: number
}

export interface InstagramMedia {
  id: string
  caption?: string
  like_count?: number
  comments_count?: number
  timestamp: string
  media_type: string
  permalink: string
}

export class InstagramAPI {
  private clientId: string
  private clientSecret: string
  private redirectUri: string
  private baseUrl = 'https://api.instagram.com'
  private graphUrl = 'https://graph.instagram.com'

  constructor(config: InstagramConfig) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.redirectUri = config.redirectUri
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code',
      ...(state && { state }),
    })

    return `${this.baseUrl}/oauth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram API error: ${error.error?.message || 'Failed to exchange code'}`)
    }

    return response.json()
  }

  /**
   * Get long-lived access token (valid for 60 days)
   */
  async getLongLivedToken(shortLivedToken: string): Promise<InstagramTokenResponse> {
    const response = await fetch(
      `${this.graphUrl}/access_token?grant_type=ig_exchange_token&client_secret=${this.clientSecret}&access_token=${shortLivedToken}`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram API error: ${error.error?.message || 'Failed to get long-lived token'}`)
    }

    return response.json()
  }

  /**
   * Refresh long-lived token
   */
  async refreshToken(accessToken: string): Promise<InstagramTokenResponse> {
    const response = await fetch(
      `${this.graphUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram API error: ${error.error?.message || 'Failed to refresh token'}`)
    }

    return response.json()
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<InstagramUser> {
    const response = await fetch(
      `${this.graphUrl}/me?fields=id,username,account_type,media_count&access_token=${accessToken}`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram API error: ${error.error?.message || 'Failed to get user profile'}`)
    }

    return response.json()
  }

  /**
   * Get user media
   */
  async getUserMedia(accessToken: string, limit: number = 25): Promise<{ data: InstagramMedia[] }> {
    const response = await fetch(
      `${this.graphUrl}/me/media?fields=id,caption,like_count,comments_count,timestamp,media_type,permalink&limit=${limit}&access_token=${accessToken}`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram API error: ${error.error?.message || 'Failed to get user media'}`)
    }

    return response.json()
  }

  /**
   * Get insights/metrics for a media post
   */
  async getMediaInsights(accessToken: string, mediaId: string): Promise<any> {
    const response = await fetch(
      `${this.graphUrl}/${mediaId}/insights?metric=impressions,reach,engagement&access_token=${accessToken}`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram API error: ${error.error?.message || 'Failed to get media insights'}`)
    }

    return response.json()
  }
}


