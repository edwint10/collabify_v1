/**
 * YouTube Data API Integration
 * Documentation: https://developers.google.com/youtube/v3
 */

export interface YouTubeConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  apiKey?: string
}

export interface YouTubeTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export interface YouTubeChannel {
  id: string
  snippet: {
    title: string
    description: string
    customUrl?: string
    publishedAt: string
    thumbnails: {
      default?: { url: string }
      medium?: { url: string }
      high?: { url: string }
    }
  }
  statistics: {
    viewCount: string
    subscriberCount: string
    videoCount: string
    hiddenSubscriberCount?: boolean
  }
}

export interface YouTubeVideo {
  id: string
  snippet: {
    title: string
    description: string
    publishedAt: string
    thumbnails: {
      default?: { url: string }
      medium?: { url: string }
      high?: { url: string }
    }
  }
  statistics: {
    viewCount: string
    likeCount: string
    commentCount: string
  }
}

export class YouTubeAPI {
  private clientId: string
  private clientSecret: string
  private redirectUri: string
  private apiKey?: string
  private authUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  private tokenUrl = 'https://oauth2.googleapis.com/token'
  private apiUrl = 'https://www.googleapis.com/youtube/v3'

  constructor(config: YouTubeConfig) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.redirectUri = config.redirectUri
    this.apiKey = config.apiKey
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state }),
    })

    return `${this.authUrl}?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<YouTubeTokenResponse> {
    const response = await fetch(this.tokenUrl, {
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
      throw new Error(`YouTube API error: ${error.error_description || 'Failed to exchange code'}`)
    }

    return response.json()
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<Omit<YouTubeTokenResponse, 'refresh_token'>> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`YouTube API error: ${error.error_description || 'Failed to refresh token'}`)
    }

    return response.json()
  }

  /**
   * Get channel information
   */
  async getChannelInfo(accessToken: string, channelId?: string): Promise<{ items: YouTubeChannel[] }> {
    const part = 'snippet,statistics'
    const url = channelId
      ? `${this.apiUrl}/channels?part=${part}&id=${channelId}&access_token=${accessToken}`
      : `${this.apiUrl}/channels?part=${part}&mine=true&access_token=${accessToken}`

    const response = await fetch(url, {
      method: 'GET',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`YouTube API error: ${error.error?.message || 'Failed to get channel info'}`)
    }

    return response.json()
  }

  /**
   * Get channel videos
   */
  async getChannelVideos(accessToken: string, channelId: string, maxResults: number = 25): Promise<{ items: YouTubeVideo[] }> {
    const response = await fetch(
      `${this.apiUrl}/search?part=snippet&channelId=${channelId}&type=video&maxResults=${maxResults}&order=date&access_token=${accessToken}`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`YouTube API error: ${error.error?.message || 'Failed to get channel videos'}`)
    }

    const searchResult = await response.json()

    // Get detailed video statistics
    if (searchResult.items && searchResult.items.length > 0) {
      const videoIds = searchResult.items.map((item: any) => item.id.videoId).join(',')
      const statsResponse = await fetch(
        `${this.apiUrl}/videos?part=snippet,statistics&id=${videoIds}&access_token=${accessToken}`,
        {
          method: 'GET',
        }
      )

      if (statsResponse.ok) {
        return statsResponse.json()
      }
    }

    return { items: [] }
  }
}


