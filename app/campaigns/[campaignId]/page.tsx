"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import CampaignPreview from "@/components/campaigns/campaign-preview"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import type { CampaignFormData } from "@/components/campaigns/campaign-form"

export default function CampaignViewPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.campaignId as string
  
  const [campaignData, setCampaignData] = useState<CampaignFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [brandId, setBrandId] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const userRole = localStorage.getItem('userRole')

    if (!userId || userRole !== 'brand') {
      router.push('/dashboard')
      return
    }

    setBrandId(userId)

    // Load campaign data
    const loadCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`)
        if (!response.ok) {
          throw new Error('Failed to load campaign')
        }

        const data = await response.json()
        const campaign = data.campaign

        // Verify this campaign belongs to the user
        if (campaign.brand_id !== userId) {
          router.push('/campaigns')
          return
        }

        setCampaignData({
          title: campaign.title || "",
          deliverables: campaign.deliverables?.length > 0 ? campaign.deliverables : [""],
          kpis: campaign.kpis || [],
          budget: campaign.budget || "",
          timeline: campaign.timeline || "",
          status: campaign.status || 'draft'
        })
      } catch (err: any) {
        console.error('Error loading campaign:', err)
        setError(err.message || 'Failed to load campaign')
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaign()
  }, [campaignId, router])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading campaign...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !campaignData || !brandId) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error || 'Campaign not found'}</p>
              <Button onClick={() => router.push('/campaigns')}>
                Back to Campaigns
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/campaigns')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <Button
          onClick={() => router.push(`/campaigns/${campaignId}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Campaign
        </Button>
      </div>

      <CampaignPreview campaign={campaignData} />
    </div>
  )
}


