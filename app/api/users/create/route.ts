import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/api/users'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role } = body

    if (!role || (role !== 'creator' && role !== 'brand')) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "creator" or "brand"' },
        { status: 400 }
      )
    }

    const user = await createUser(role)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create user API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}

