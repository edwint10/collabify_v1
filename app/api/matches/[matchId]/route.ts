import { NextRequest, NextResponse } from 'next/server'
import { updateMatchStatus } from '@/lib/api/matches'

export async function PUT(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'shortlisted', 'rejected', 'matched'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (pending, shortlisted, rejected, matched)' },
        { status: 400 }
      )
    }

    const match = await updateMatchStatus(matchId, status as any)

    return NextResponse.json({ match }, { status: 200 })
  } catch (error: any) {
    console.error('Error in update match API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update match' },
      { status: 500 }
    )
  }
}

