/**
 * Social Media API Integration Manager
 * Centralized service for managing all social media platform integrations
 */

import { InstagramAPI, InstagramConfig } from './instagram'
import { TikTokAPI, TikTokConfig } from './tiktok'
import { YouTubeAPI, YouTubeConfig } from './youtube'
import { TwitterAPI, TwitterConfig } from './twitter'
import { TikTokBusinessAPI, TikTokBusinessConfig } from './tiktok-business'

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'tiktok_business'

export interface SocialMediaConfig {
  instagram?: InstagramConfig
  tiktok?: TikTokConfig
  youtube?: YouTubeConfig
  twitter?: TwitterConfig
  tiktok_business?: TikTokBusinessConfig
}

export class SocialMediaManager {
  private config: SocialMediaConfig
  private instagram?: InstagramAPI
  private tiktok?: TikTokAPI
  private youtube?: YouTubeAPI
  private twitter?: TwitterAPI
  private tiktokBusiness?: TikTokBusinessAPI

  constructor(config: SocialMediaConfig) {
    this.config = config

    if (config.instagram) {
      this.instagram = new InstagramAPI(config.instagram)
    }
    if (config.tiktok) {
      this.tiktok = new TikTokAPI(config.tiktok)
    }
    if (config.youtube) {
      this.youtube = new YouTubeAPI(config.youtube)
    }
    if (config.twitter) {
      this.twitter = new TwitterAPI(config.twitter)
    }
    if (config.tiktok_business) {
      this.tiktokBusiness = new TikTokBusinessAPI(config.tiktok_business)
    }
  }

  /**
   * Get authorization URL for a platform
   */
  getAuthorizationUrl(platform: SocialPlatform, state?: string): string {
    switch (platform) {
      case 'instagram':
        if (!this.instagram) throw new Error('Instagram API not configured')
        return this.instagram.getAuthorizationUrl(state)
      case 'tiktok':
        if (!this.tiktok) throw new Error('TikTok API not configured')
        return this.tiktok.getAuthorizationUrl(state)
      case 'youtube':
        if (!this.youtube) throw new Error('YouTube API not configured')
        return this.youtube.getAuthorizationUrl(state)
      case 'twitter':
        if (!this.twitter) throw new Error('Twitter API not configured')
        return this.twitter.getAuthorizationUrl(state)
      case 'tiktok_business':
        if (!this.tiktokBusiness) throw new Error('TikTok Business API not configured')
        return this.tiktokBusiness.getAuthorizationUrl(state)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * Exchange code for token
   */
  async exchangeCodeForToken(platform: SocialPlatform, code: string): Promise<any> {
    switch (platform) {
      case 'instagram':
        if (!this.instagram) throw new Error('Instagram API not configured')
        return this.instagram.exchangeCodeForToken(code)
      case 'tiktok':
        if (!this.tiktok) throw new Error('TikTok API not configured')
        return this.tiktok.exchangeCodeForToken(code)
      case 'youtube':
        if (!this.youtube) throw new Error('YouTube API not configured')
        return this.youtube.exchangeCodeForToken(code)
      case 'twitter':
        if (!this.twitter) throw new Error('Twitter API not configured')
        return this.twitter.exchangeCodeForToken(code)
      case 'tiktok_business':
        if (!this.tiktokBusiness) throw new Error('TikTok Business API not configured')
        return this.tiktokBusiness.exchangeCodeForToken(code)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * Get API instance for a platform
   */
  getAPI(platform: SocialPlatform) {
    switch (platform) {
      case 'instagram':
        return this.instagram
      case 'tiktok':
        return this.tiktok
      case 'youtube':
        return this.youtube
      case 'twitter':
        return this.twitter
      case 'tiktok_business':
        return this.tiktokBusiness
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }
}

/**
 * Get social media manager instance with environment variables
 */
export function getSocialMediaManager(): SocialMediaManager {
  const config: SocialMediaConfig = {
    instagram: process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET ? {
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/instagram/callback`,
    } : undefined,
    tiktok: process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET ? {
      clientKey: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/tiktok/callback`,
    } : undefined,
    youtube: process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET ? {
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/youtube/callback`,
      apiKey: process.env.YOUTUBE_API_KEY,
    } : undefined,
    twitter: process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET ? {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/twitter/callback`,
    } : undefined,
    tiktok_business: process.env.TIKTOK_BUSINESS_CLIENT_KEY && process.env.TIKTOK_BUSINESS_CLIENT_SECRET ? {
      clientKey: process.env.TIKTOK_BUSINESS_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_BUSINESS_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/tiktok-business/callback`,
    } : undefined,
  }

  return new SocialMediaManager(config)
}


