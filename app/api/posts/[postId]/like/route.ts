import { NextRequest, NextResponse } from 'next/server'
import { togglePostLike } from '@/lib/api/posts'

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await togglePostLike(postId, userId)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error in toggle post like API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

