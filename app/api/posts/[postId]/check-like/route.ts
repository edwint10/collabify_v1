import { NextRequest, NextResponse } from 'next/server'
import { checkPostLiked } from '@/lib/api/posts'

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const isLiked = await checkPostLiked(postId, userId)

    return NextResponse.json({ isLiked }, { status: 200 })
  } catch (error: any) {
    console.error('Error in check post like API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check like status' },
      { status: 500 }
    )
  }
}

