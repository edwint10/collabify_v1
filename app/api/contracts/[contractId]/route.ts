import { NextRequest, NextResponse } from 'next/server'
import { getContract, updateContract } from '@/lib/api/contracts'

export async function GET(
  request: NextRequest,
  { params }: { params: { contractId: string } }
) {
  try {
    const { contractId } = params

    const contract = await getContract(contractId)

    return NextResponse.json({ contract }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get contract API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contract' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { contractId: string } }
) {
  try {
    const { contractId } = params
    const body = await request.json()
    const { content, version, signed_by_creator, signed_by_brand, signed_at } = body

    const contract = await updateContract(contractId, {
      content,
      version,
      signed_by_creator,
      signed_by_brand,
      signed_at
    })

    return NextResponse.json({ contract }, { status: 200 })
  } catch (error: any) {
    console.error('Error in update contract API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update contract' },
      { status: 500 }
    )
  }
}




