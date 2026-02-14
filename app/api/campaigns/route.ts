import { NextRequest, NextResponse } from 'next/server'
import { getCampaignsForBrand, createCampaign } from '@/lib/api/campaigns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandId = searchParams.get('brandId')
    const status = searchParams.get('status') || undefined

    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    const campaigns = await getCampaignsForBrand(brandId, status)

    return NextResponse.json({ campaigns }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get campaigns API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brandId, title, deliverables, kpis, budget, timeline, status } = body

    if (!brandId || !title) {
      return NextResponse.json(
        { error: 'Brand ID and title are required' },
        { status: 400 }
      )
    }

    const campaign = await createCampaign(brandId, {
      title,
      deliverables: deliverables || [],
      kpis: kpis || [],
      budget,
      timeline,
      status: status || 'draft'
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create campaign API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    )
  }
}




