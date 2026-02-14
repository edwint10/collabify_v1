import { NextRequest, NextResponse } from 'next/server'
import { getConversationById } from '@/lib/api/conversations'

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const conversation = await getConversationById(conversationId, userId)

    return NextResponse.json({ conversation }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get conversation API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}




