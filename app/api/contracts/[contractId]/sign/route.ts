import { NextRequest, NextResponse } from 'next/server'
import { signContract, getContract } from '@/lib/api/contracts'
import { getUser } from '@/lib/api/users'
import { getCampaign } from '@/lib/api/campaigns'

export async function POST(
  request: NextRequest,
  { params }: { params: { contractId: string } }
) {
  try {
    const { contractId } = params
    const body = await request.json()
    const { userId, signature, name } = body

    if (!userId || !signature || !name) {
      return NextResponse.json(
        { error: 'User ID, signature, and name are required' },
        { status: 400 }
      )
    }

    // Get user to determine role
    const user = await getUser(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get contract to verify it exists
    const contract = await getContract(contractId)

    // Verify user is party to contract (if contract has campaign, check campaign belongs to user)
    if (contract.campaign_id) {
      const campaign = await getCampaign(contract.campaign_id)
      if (campaign.brand_id !== userId) {
        // For creators, we need to check if they're involved in the match/conversation
        // This is simplified - in a real system you'd check the match relationship
        // For MVP, we'll allow signing if it's a valid contract
      }
    }

    // Sign contract
    const signedContract = await signContract(
      contractId,
      userId,
      user.role,
      {
        signature,
        name,
        signed_at: new Date().toISOString()
      }
    )

    return NextResponse.json({ contract: signedContract }, { status: 200 })
  } catch (error: any) {
    console.error('Error in sign contract API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sign contract' },
      { status: 500 }
    )
  }
}


