"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Save, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  deliverables: z.array(z.string().min(1, "Deliverable cannot be empty")).min(1, "At least one deliverable is required"),
  kpis: z.array(z.string()).optional(),
  budget: z.union([z.number().min(0), z.literal("")]).optional(),
  timeline: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft')
})

export type CampaignFormData = z.infer<typeof campaignSchema>

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>
  onSubmit: (data: CampaignFormData) => Promise<void>
  onDraftSave?: (data: Partial<CampaignFormData>) => Promise<void>
  onAutoGenerate?: () => void
  isSubmitting?: boolean
  isGenerating?: boolean
}

export default function CampaignForm({
  initialData,
  onSubmit,
  onDraftSave,
  onAutoGenerate,
  isSubmitting = false,
  isGenerating = false
}: CampaignFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: initialData?.title || "",
      deliverables: initialData?.deliverables || [""],
      kpis: initialData?.kpis || [],
      budget: initialData?.budget || "",
      timeline: initialData?.timeline || "",
      status: initialData?.status || 'draft'
    }
  })

  const { fields: deliverableFields, append: appendDeliverable, remove: removeDeliverable } = useFieldArray<CampaignFormData, "deliverables">({
    control,
    name: "deliverables"
  })

  const { fields: kpiFields, append: appendKpi, remove: removeKpi } = useFieldArray<CampaignFormData, "kpis">({
    control,
    name: "kpis"
  })

  const watchedTitle = watch("title")
  const watchedDeliverables = watch("deliverables")
  const canAutoGenerate = watchedTitle && watchedDeliverables.some((d: string) => d.trim() !== "")

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!onDraftSave || !isDirty) return

    const interval = setInterval(() => {
      const currentValues = watch()
      if (currentValues.title) {
        onDraftSave(currentValues)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [watch, isDirty, onDraftSave])

  const handleFormSubmit = async (data: CampaignFormData) => {
    const formData = {
      ...data,
      budget: data.budget === "" ? undefined : Number(data.budget)
    }
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaign Details</CardTitle>
            {canAutoGenerate && onAutoGenerate && (
              <Button
                type="button"
                variant="outline"
                onClick={onAutoGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Auto-generate Brief
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Summer Product Launch Campaign"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Deliverables */}
          <div>
            <Label>Deliverables *</Label>
            <div className="space-y-2 mt-2">
              {deliverableFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`deliverables.${index}` as const)}
                    placeholder="e.g., 3 Instagram posts, 1 TikTok video"
                  />
                  {deliverableFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeDeliverable(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendDeliverable("")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Deliverable
              </Button>
            </div>
            {errors.deliverables && (
              <p className="text-sm text-red-500 mt-1">{errors.deliverables.message}</p>
            )}
          </div>

          {/* KPIs */}
          <div>
            <Label>Key Performance Indicators (KPIs)</Label>
            <div className="space-y-2 mt-2">
              {kpiFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`kpis.${index}` as const)}
                    placeholder="e.g., 10K impressions, 5% engagement rate"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeKpi(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendKpi("")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add KPI
              </Button>
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              type="number"
              {...register("budget", { valueAsNumber: true })}
              placeholder="e.g., 5000"
            />
            {errors.budget && (
              <p className="text-sm text-red-500 mt-1">{errors.budget.message}</p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              {...register("timeline")}
              placeholder="e.g., 2-4 weeks, Q2 2024"
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        {onDraftSave && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onDraftSave(watch())}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Campaign"
          )}
        </Button>
      </div>
    </form>
  )
}


