"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CampaignForm, { type CampaignFormData } from "@/components/campaigns/campaign-form"
import CampaignPreview from "@/components/campaigns/campaign-preview"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Edit, ArrowLeft } from "lucide-react"
import { enhanceBriefWithTitle } from "@/lib/services/brief-generator"

export default function NewCampaignPage() {
  const router = useRouter()
  const [campaignData, setCampaignData] = useState<Partial<CampaignFormData>>({
    title: "",
    deliverables: [""],
    kpis: [],
    budget: "",
    timeline: "",
    status: 'draft'
  })
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [draftCampaignId, setDraftCampaignId] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const userRole = localStorage.getItem('userRole')

    if (!userId || userRole !== 'brand') {
      router.push('/dashboard')
      return
    }

    setBrandId(userId)

    // Check for existing draft
    const loadDraft = async () => {
      try {
        const response = await fetch(`/api/campaigns?brandId=${userId}&status=draft`)
        if (response.ok) {
          const data = await response.json()
          if (data.campaigns && data.campaigns.length > 0) {
            // Load most recent draft
            const draft = data.campaigns[0]
            setDraftCampaignId(draft.id)
            setCampaignData({
              title: draft.title || "",
              deliverables: draft.deliverables || [""],
              kpis: draft.kpis || [],
              budget: draft.budget || "",
              timeline: draft.timeline || "",
              status: draft.status || 'draft'
            })
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }

    loadDraft()
  }, [router])

  const handleAutoGenerate = async () => {
    if (!campaignData.title || !campaignData.deliverables?.some(d => d.trim() !== "")) {
      return
    }

    setIsGenerating(true)
    try {
      const enhanced = enhanceBriefWithTitle(
        campaignData.title,
        campaignData
      )
      setCampaignData(enhanced)
    } catch (error) {
      console.error('Error generating brief:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDraftSave = async (data: Partial<CampaignFormData>) => {
    if (!brandId) return

    try {
      // If we have an existing draft, update it instead of creating a new one
      if (draftCampaignId) {
        const response = await fetch(`/api/campaigns/${draftCampaignId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title || "",
            deliverables: data.deliverables || [],
            kpis: data.kpis || [],
            budget: data.budget === "" ? undefined : Number(data.budget),
            timeline: data.timeline || "",
            status: 'draft'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to save draft')
        }
      } else {
        // Create new draft only if we don't have one
        const response = await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandId,
            title: data.title || "",
            deliverables: data.deliverables || [],
            kpis: data.kpis || [],
            budget: data.budget === "" ? undefined : Number(data.budget),
            timeline: data.timeline || "",
            status: 'draft'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to save draft')
        }

        const result = await response.json()
        if (result.campaign?.id) {
          setDraftCampaignId(result.campaign.id)
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const handleSubmit = async (data: CampaignFormData) => {
    if (!brandId) return

    setIsSubmitting(true)
    try {
      // If we have an existing draft, update it instead of creating a new one
      if (draftCampaignId) {
        const response = await fetch(`/api/campaigns/${draftCampaignId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            deliverables: data.deliverables,
            kpis: data.kpis || [],
            budget: data.budget === "" ? undefined : Number(data.budget),
            timeline: data.timeline || "",
            status: data.status || 'active'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update campaign')
        }
      } else {
        // Create new campaign only if no draft exists
        const response = await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandId,
            title: data.title,
            deliverables: data.deliverables,
            kpis: data.kpis || [],
            budget: data.budget === "" ? undefined : Number(data.budget),
            timeline: data.timeline || "",
            status: data.status || 'active'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create campaign')
        }
      }

      router.push(`/campaigns`)
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert('Failed to save campaign. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!brandId) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-gray-500">Loading...</p>
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
          variant="outline"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
        >
          {isPreviewMode ? (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          )}
        </Button>
      </div>

      {isPreviewMode ? (
        <CampaignPreview campaign={campaignData as CampaignFormData} />
      ) : (
        <CampaignForm
          initialData={campaignData}
          onSubmit={handleSubmit}
          onDraftSave={handleDraftSave}
          onAutoGenerate={handleAutoGenerate}
          isSubmitting={isSubmitting}
          isGenerating={isGenerating}
        />
      )}
    </div>
  )
}

