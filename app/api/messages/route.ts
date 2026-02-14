import { NextRequest, NextResponse } from 'next/server'
import { getMessages, sendMessage } from '@/lib/api/messages'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const messages = await getMessages(conversationId)

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get messages API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, senderId, content, attachments } = body

    if (!conversationId || !senderId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID, sender ID, and content are required' },
        { status: 400 }
      )
    }

    const message = await sendMessage(
      conversationId,
      senderId,
      content,
      attachments || []
    )

    return NextResponse.json({ message }, { status: 201 })
  } catch (error: any) {
    console.error('Error in send message API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}




