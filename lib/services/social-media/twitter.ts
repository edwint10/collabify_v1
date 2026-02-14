/**
 * Twitter/X API Integration
 * Documentation: https://developer.twitter.com/en/docs
 */

export interface TwitterConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface TwitterTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
  description?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
}

export interface TwitterTweet {
  id: string
  text: string
  created_at: string
  public_metrics?: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
}

export class TwitterAPI {
  private clientId: string
  private clientSecret: string
  private redirectUri: string
  private authUrl = 'https://twitter.com/i/oauth2/authorize'
  private tokenUrl = 'https://api.twitter.com/2/oauth2/token'
  private apiUrl = 'https://api.twitter.com/2'

  constructor(config: TwitterConfig) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.redirectUri = config.redirectUri
  }

  /**
   * Generate OAuth authorization URL
   * Twitter uses PKCE, but for simplicity we'll use plain code_challenge
   * @param state - OAuth state parameter
   * @param codeVerifier - Optional code verifier (if not provided, generates one)
   * @returns Authorization URL and code verifier (if generated)
   */
  getAuthorizationUrl(state?: string, codeVerifier?: string): string {
    // Generate a simple code verifier if not provided (in production, use crypto.randomBytes)
    const verifier = codeVerifier || (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'tweet.read users.read offline.access',
      state: state || Math.random().toString(36).substring(7),
      code_challenge: verifier,
      code_challenge_method: 'plain',
    })

    return `${this.authUrl}?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, codeVerifier?: string): Promise<TwitterTokenResponse> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const bodyParams: Record<string, string> = {
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    }
    
    // Twitter requires code_verifier for PKCE
    if (codeVerifier) {
      bodyParams.code_verifier = codeVerifier
    }

    const body = new URLSearchParams(bodyParams)

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Twitter API error: ${error.error_description || 'Failed to exchange code'}`)
    }

    return response.json()
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<Omit<TwitterTokenResponse, 'refresh_token'>> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Twitter API error: ${error.error_description || 'Failed to refresh token'}`)
    }

    return response.json()
  }

  /**
   * Get user information
   */
  async getUserInfo(accessToken: string, userId?: string): Promise<{ data: TwitterUser }> {
    const url = userId
      ? `${this.apiUrl}/users/${userId}?user.fields=public_metrics,profile_image_url,description`
      : `${this.apiUrl}/users/me?user.fields=public_metrics,profile_image_url,description`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Twitter API error: ${error.title || 'Failed to get user info'}`)
    }

    return response.json()
  }

  /**
   * Get user tweets
   */
  async getUserTweets(accessToken: string, userId: string, maxResults: number = 10): Promise<{ data: TwitterTweet[] }> {
    const response = await fetch(
      `${this.apiUrl}/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Twitter API error: ${error.title || 'Failed to get user tweets'}`)
    }

    return response.json()
  }
}

