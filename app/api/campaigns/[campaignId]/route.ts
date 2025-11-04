import { NextRequest, NextResponse } from 'next/server'
import { getCampaign, updateCampaign, deleteCampaign } from '@/lib/api/campaigns'

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params

    const campaign = await getCampaign(campaignId)

    return NextResponse.json({ campaign }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get campaign API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params
    const body = await request.json()
    const { title, deliverables, kpis, budget, timeline, status } = body

    const campaign = await updateCampaign(campaignId, {
      title,
      deliverables,
      kpis,
      budget,
      timeline,
      status
    })

    return NextResponse.json({ campaign }, { status: 200 })
  } catch (error: any) {
    console.error('Error in update campaign API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params

    await deleteCampaign(campaignId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in delete campaign API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}


