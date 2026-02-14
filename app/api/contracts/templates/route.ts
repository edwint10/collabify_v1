import { NextRequest, NextResponse } from 'next/server'
import { getContractTemplates, createContractTemplate } from '@/lib/api/contracts'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const templates = await getContractTemplates(userId)

    return NextResponse.json({ templates }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get contract templates API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contract templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, sections } = body

    if (!userId || !name || !sections) {
      return NextResponse.json(
        { error: 'User ID, name, and sections are required' },
        { status: 400 }
      )
    }

    const template = await createContractTemplate(userId, {
      name,
      sections
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create contract template API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create contract template' },
      { status: 500 }
    )
  }
}




