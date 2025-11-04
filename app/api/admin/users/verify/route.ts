import { NextRequest, NextResponse } from 'next/server'
import { toggleUserVerification } from '@/lib/api/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, verified } = body

    if (!userId || typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID and verified status are required' },
        { status: 400 }
      )
    }

    const user = await toggleUserVerification(userId, verified)

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error('Error in toggle verification API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle verification' },
      { status: 500 }
    )
  }
}

