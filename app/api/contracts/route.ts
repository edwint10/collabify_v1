import { NextRequest, NextResponse } from 'next/server'
import { createContract, getContractsForCampaign, getContractsForUser } from '@/lib/api/contracts'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaignId')
    const userId = searchParams.get('userId')

    if (campaignId) {
      const contracts = await getContractsForCampaign(campaignId)
      return NextResponse.json({ contracts }, { status: 200 })
    }

    if (userId) {
      const contracts = await getContractsForUser(userId)
      return NextResponse.json({ contracts }, { status: 200 })
    }

    return NextResponse.json(
      { error: 'Campaign ID or User ID is required' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error in get contracts API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, type, content, templateId, version } = body

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      )
    }

    const contract = await createContract(campaignId, {
      type,
      content,
      template_id: templateId,
      version: version || 1
    })

    return NextResponse.json({ contract }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create contract API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create contract' },
      { status: 500 }
    )
  }
}


