/**
 * TikTok API Integration
 * Documentation: https://developers.tiktok.com/
 */

export interface TikTokConfig {
  clientKey: string
  clientSecret: string
  redirectUri: string
}

export interface TikTokTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  refresh_expires_in: number
  scope: string
}

export interface TikTokUser {
  open_id: string
  union_id?: string
  avatar_url?: string
  display_name?: string
  username?: string
  profile_deep_link?: string
}

export interface TikTokVideo {
  video_id: string
  title: string
  video_description: string
  duration: number
  cover_image_url: string
  embed_url: string
  like_count: number
  comment_count: number
  share_count: number
  view_count: number
  create_time: number
}

export class TikTokAPI {
  private clientKey: string
  private clientSecret: string
  private redirectUri: string
  private baseUrl = 'https://www.tiktok.com'
  private apiUrl = 'https://open.tiktokapis.com'

  constructor(config: TikTokConfig) {
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
      scope: 'user.info.basic,video.list',
      response_type: 'code',
      ...(state && { state }),
    })

    return `${this.baseUrl}/v2/auth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TikTokTokenResponse> {
    const response = await fetch(`${this.apiUrl}/v2/oauth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`TikTok API error: ${error.error_description || 'Failed to exchange code'}`)
    }

    return response.json()
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TikTokTokenResponse> {
    const response = await fetch(`${this.apiUrl}/v2/oauth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`TikTok API error: ${error.error_description || 'Failed to refresh token'}`)
    }

    return response.json()
  }

  /**
   * Get user info
   */
  async getUserInfo(accessToken: string): Promise<{ data: { user: TikTokUser } }> {
    const response = await fetch(`${this.apiUrl}/v2/user/info/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`TikTok API error: ${error.error_description || 'Failed to get user info'}`)
    }

    return response.json()
  }

  /**
   * Get user videos
   */
  async getUserVideos(accessToken: string, maxCount: number = 20): Promise<{ data: { videos: TikTokVideo[] } }> {
    const response = await fetch(`${this.apiUrl}/v2/video/list/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_count: maxCount,
        fields: ['id', 'title', 'video_description', 'duration', 'cover_image_url', 'embed_url', 'like_count', 'comment_count', 'share_count', 'view_count', 'create_time'],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`TikTok API error: ${error.error_description || 'Failed to get user videos'}`)
    }

    return response.json()
  }
}


