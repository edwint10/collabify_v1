import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { verifyUserAuth } from '@/lib/utils/auth'

export async function GET(request: NextRequest) {
  try {
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

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get all social accounts for user
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, platform, platform_user_id, username, is_active, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch social accounts: ${error.message}`)
    }

    return NextResponse.json({ accounts: accounts || [] })
  } catch (error: any) {
    console.error('Error in get social accounts API:', error)
    
    if (error.message.includes('Authentication required') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid user')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch social accounts' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const accountId = searchParams.get('accountId')

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

    // Verify account belongs to user
    const { data: account, error: fetchError } = await supabase
      .from('social_accounts')
      .select('user_id')
      .eq('id', accountId)
      .single()

    if (fetchError || !account || account.user_id !== userId) {
      return NextResponse.json(
        { error: 'Account not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete account
    const { error: deleteError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', accountId)

    if (deleteError) {
      throw new Error(`Failed to delete account: ${deleteError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in delete social account API:', error)
    
    if (error.message.includes('Authentication required') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid user')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete social account' },
      { status: 500 }
    )
  }
}


