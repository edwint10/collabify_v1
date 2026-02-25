"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { messageTemplates, replaceTemplateVariables, type MessageTemplate } from "@/lib/data/message-templates"
import { Card, CardContent } from "@/components/ui/card"

interface TemplateSelectorProps {
  onSelectTemplate: (content: string) => void
  userProfile?: any
  userRole?: 'creator' | 'brand'
}

export default function TemplateSelector({
  onSelectTemplate,
  userProfile,
  userRole
}: TemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [preview, setPreview] = useState<string>("")

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = messageTemplates.find(t => t.id === templateId)
    
    if (template) {
      // Build variables from user profile
      const variables: Record<string, string> = {}
      
      if (userRole === 'creator' && userProfile) {
        const totalFollowers = (userProfile.follower_count_ig || 0) + (userProfile.follower_count_tiktok || 0)
        variables.reach = totalFollowers > 0 ? `${totalFollowers.toLocaleString()} followers` : 'my audience'
        variables.niche = userProfile.bio?.substring(0, 50) || 'content creation'
        variables.expertise = userProfile.bio?.substring(0, 100) || 'creating engaging content'
        variables.name = `@${userProfile.instagram_handle || userProfile.tiktok_handle || 'creator'}`
      } else if (userRole === 'brand' && userProfile) {
        variables.name = userProfile.company_name || 'our brand'
        variables.title = 'a new campaign'
        variables.budget = userProfile.ad_spend_range || '$1,000 - $5,000'
        variables.timeline = '2-4 weeks'
      }

      // Fill in defaults for missing variables
      template.variables.forEach(v => {
        if (!variables[v]) {
          variables[v] = `[${v}]`
        }
      })

      const filledContent = replaceTemplateVariables(template, variables)
      setPreview(filledContent)
    }
  }

  const handleUseTemplate = () => {
    if (preview) {
      onSelectTemplate(preview)
      setSelectedTemplateId("")
      setPreview("")
    }
  }

  return (
    <div className="space-y-2">
      <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a message template" />
        </SelectTrigger>
        <SelectContent>
          {messageTemplates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preview && (
        <Card>
          <CardContent className="p-3">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{preview}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleUseTemplate}
                  className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Use Template
                </button>
                <button
                  onClick={() => {
                    setPreview("")
                    setSelectedTemplateId("")
                  }}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



