import { NextRequest, NextResponse } from 'next/server'
import { createPost, getPostsByUser } from '@/lib/api/posts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, content, imageUrl } = body

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'User ID and content are required' },
        { status: 400 }
      )
    }

    const post = await createPost(userId, {
      content,
      image_url: imageUrl || null
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create post API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const posts = await getPostsByUser(userId, limit, offset)

    return NextResponse.json({ posts }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get posts API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

