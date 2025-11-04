import { NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/api/admin'

export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json({ users }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get all users API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

