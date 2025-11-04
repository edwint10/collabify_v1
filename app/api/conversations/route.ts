import { NextRequest, NextResponse } from 'next/server'
import { getConversationsForUser, getOrCreateConversation } from '@/lib/api/conversations'

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

    const conversations = await getConversationsForUser(userId)

    return NextResponse.json({ conversations }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get conversations API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId } = body

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      )
    }

    const conversation = await getOrCreateConversation(matchId)

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create conversation API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create conversation' },
      { status: 500 }
    )
  }
}


