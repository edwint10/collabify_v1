import { NextRequest, NextResponse } from 'next/server'
import { markMessageAsRead } from '@/lib/api/messages'

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params

    await markMessageAsRead(messageId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in mark message as read API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark message as read' },
      { status: 500 }
    )
  }
}




