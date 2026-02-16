import { NextRequest, NextResponse } from 'next/server'
import { getSocialMediaManager } from '@/lib/services/social-media'
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
    const internalPlatform = (platformMap[urlPlatform] || urlPlatform) as Platform
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify authentication
    await verifyUserAuth(request, userId)

    // Generate state token (store userId in state for callback)
    // For Twitter, we need to store code_verifier in state for PKCE
    const stateData: any = { userId, timestamp: Date.now() }
    let codeVerifier: string | undefined
    
    if (internalPlatform === 'twitter') {
      // Generate code verifier for Twitter PKCE
      codeVerifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      stateData.codeVerifier = codeVerifier
    }
    
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64')

    // Get authorization URL
    const manager = getSocialMediaManager()
    const api = manager.getAPI(internalPlatform)
    
    // For Twitter, pass code_verifier to the API
    let authUrl: string
    if (internalPlatform === 'twitter' && api && codeVerifier) {
      authUrl = (api as any).getAuthorizationUrl(state, codeVerifier)
    } else {
      authUrl = manager.getAuthorizationUrl(internalPlatform, state)
    }

    // Redirect to platform's OAuth page
    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error('Error in auth route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}

