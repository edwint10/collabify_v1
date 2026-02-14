import { NextRequest, NextResponse } from 'next/server'
import { getContract, updateContractTemplate, deleteContractTemplate } from '@/lib/api/contracts'

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params

    const template = await getContract(templateId)

    return NextResponse.json({ template }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get contract template API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contract template' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params
    const body = await request.json()
    const { name, sections } = body

    const template = await updateContractTemplate(templateId, {
      name,
      sections
    })

    return NextResponse.json({ template }, { status: 200 })
  } catch (error: any) {
    console.error('Error in update contract template API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update contract template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params

    await deleteContractTemplate(templateId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in delete contract template API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete contract template' },
      { status: 500 }
    )
  }
}




