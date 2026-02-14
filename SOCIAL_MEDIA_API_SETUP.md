# Social Media API Integration Setup Guide

This guide will help you set up integrations with Instagram, TikTok, YouTube, Twitter/X, and TikTok Business APIs.

## Prerequisites

1. Developer accounts for each platform you want to integrate
2. API credentials (Client ID, Client Secret, etc.)
3. OAuth redirect URIs configured in each platform's developer console

## Environment Variables

Add these to your `.env.local` file:

```bash
# Instagram Graph API
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# TikTok API
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# YouTube Data API
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_API_KEY=your_youtube_api_key

# Twitter/X API
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# TikTok Business API
TIKTOK_BUSINESS_CLIENT_KEY=your_tiktok_business_client_key
TIKTOK_BUSINESS_CLIENT_SECRET=your_tiktok_business_client_secret

# App URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Platform-Specific Setup

### 1. Instagram Graph API

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Instagram Graph API" product
4. Get your App ID and App Secret
5. Add OAuth redirect URI: `http://localhost:3000/api/auth/instagram/callback`
6. Request required permissions: `user_profile`, `user_media`

**Note**: Instagram Graph API requires a Facebook Page connected to an Instagram Business or Creator account.

### 2. TikTok API

1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Create a new app
3. Get your Client Key and Client Secret
4. Add redirect URI: `http://localhost:3000/api/auth/tiktok/callback`
5. Request scopes: `user.info.basic`, `video.list`

### 3. YouTube Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Create OAuth 2.0 credentials
5. Get Client ID and Client Secret
6. Add authorized redirect URI: `http://localhost:3000/api/auth/youtube/callback`
7. (Optional) Create API Key for public data access

### 4. Twitter/X API

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Set up OAuth 2.0
4. Get Client ID and Client Secret
5. Add callback URL: `http://localhost:3000/api/auth/twitter/callback`
6. Request scopes: `tweet.read`, `users.read`, `offline.access`

**Note**: Twitter API uses PKCE (Proof Key for Code Exchange) for security.

### 5. TikTok Business API

1. Go to [TikTok Business Developers](https://developers.tiktok.com/business/)
2. Create a business account
3. Create an app
4. Get Client Key and Client Secret
5. Add redirect URI: `http://localhost:3000/api/auth/tiktok-business/callback`
6. Request scopes: `user.info.basic`, `video.list`, `advertiser.info.basic`

## Database Migration

Run the migration to create the necessary tables:

```sql
-- See: supabase/migrations/add_social_media_integrations.sql
```

This creates:
- `social_accounts` table - stores connected accounts and tokens
- `social_metrics` table - stores synced metrics data

## Usage

### Connecting Accounts

1. Users can connect accounts from the dashboard
2. Click "Connect [Platform]" button
3. Authorize the app on the platform
4. Account is automatically saved and synced

### Syncing Data

1. Click the refresh icon on a connected account
2. System fetches latest metrics from the platform
3. Data is stored in `social_metrics` table
4. Metrics are aggregated for performance tracking

### Disconnecting Accounts

1. Click the trash icon on a connected account
2. Confirm disconnection
3. Account and tokens are removed from database

## API Endpoints

- `GET /api/auth/[platform]` - Initiate OAuth flow
- `GET /api/auth/[platform]/callback` - Handle OAuth callback
- `GET /api/social-accounts?userId=xxx` - Get user's connected accounts
- `DELETE /api/social-accounts?userId=xxx&accountId=xxx` - Disconnect account
- `POST /api/social-accounts/sync` - Sync metrics from platform

## Features

- ✅ OAuth 2.0 authentication for all platforms
- ✅ Automatic token refresh
- ✅ Secure token storage
- ✅ Metrics syncing
- ✅ Account management UI
- ✅ Performance tracking integration

## Security Notes

- Tokens are stored encrypted in the database
- Tokens automatically refresh when expired
- OAuth state parameter prevents CSRF attacks
- All API routes require authentication
- Users can only access their own accounts


