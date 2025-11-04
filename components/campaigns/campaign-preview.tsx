"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, Target, CheckCircle } from "lucide-react"
import type { CampaignFormData } from "./campaign-form"

interface CampaignPreviewProps {
  campaign: CampaignFormData
}

export default function CampaignPreview({ campaign }: CampaignPreviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="print:shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{campaign.title}</CardTitle>
          <Badge className={getStatusColor(campaign.status || 'draft')}>
            {campaign.status || 'draft'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deliverables */}
        {campaign.deliverables && campaign.deliverables.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Deliverables
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              {campaign.deliverables.map((deliverable, idx) => (
                <li key={idx} className="text-gray-700">
                  {deliverable}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* KPIs */}
        {campaign.kpis && campaign.kpis.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Performance Indicators
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              {campaign.kpis.map((kpi, idx) => (
                <li key={idx} className="text-gray-700">
                  {kpi}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Budget and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          {campaign.budget && (
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-semibold text-lg">
                  ${campaign.budget.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {campaign.timeline && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Timeline</p>
                <p className="font-semibold text-lg">{campaign.timeline}</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <h3 className="font-semibold text-lg mb-2">Campaign Summary</h3>
          <p className="text-gray-700">
            This campaign includes {campaign.deliverables?.length || 0} deliverable{campaign.deliverables?.length !== 1 ? 's' : ''}
            {campaign.kpis && campaign.kpis.length > 0 && ` and ${campaign.kpis.length} KPI${campaign.kpis.length !== 1 ? 's' : ''}`}.
            {campaign.budget && ` Total budget: $${campaign.budget.toLocaleString()}.`}
            {campaign.timeline && ` Timeline: ${campaign.timeline}.`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


