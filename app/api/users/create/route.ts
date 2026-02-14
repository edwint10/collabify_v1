import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/api/users'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, authUserId } = body

    if (!role || (role !== 'creator' && role !== 'brand')) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "creator" or "brand"' },
        { status: 400 }
      )
    }

    if (!authUserId) {
      return NextResponse.json(
        { error: 'Authentication user ID is required' },
        { status: 400 }
      )
    }

    // Verify authUserId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(authUserId)) {
      return NextResponse.json(
        { error: 'Invalid authentication user ID format' },
        { status: 400 }
      )
    }

    const user = await createUser(role, authUserId)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create user API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}

