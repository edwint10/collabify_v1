import { NextRequest, NextResponse } from 'next/server'
import { markAsRead } from '@/lib/api/messages'

export async function PUT(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await markAsRead(conversationId, userId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in mark conversation as read API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}




