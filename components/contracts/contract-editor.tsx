"use client"

import { useState, useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Eye } from "lucide-react"
import type { ContractTemplate, Milestone, PaymentTerms } from "@/lib/templates/contract-templates"
import { generateContractText } from "@/lib/templates/contract-templates"

interface ContractEditorProps {
  initialData?: Partial<ContractTemplate>
  onSubmit: (data: ContractTemplate) => Promise<void>
  onPreview?: (data: ContractTemplate) => void
  isSubmitting?: boolean
}

export default function ContractEditor({
  initialData,
  onSubmit,
  onPreview,
  isSubmitting = false
}: ContractEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewText, setPreviewText] = useState("")

  const { register, handleSubmit, control, watch, setValue } = useForm<ContractTemplate>({
    defaultValues: {
      id: initialData?.id || 'default',
      name: initialData?.name || 'Standard Collaboration Contract',
      sections: {
        deliverables: initialData?.sections?.deliverables || [],
        milestones: initialData?.sections?.milestones || [],
        paymentTerms: initialData?.sections?.paymentTerms || {
          totalAmount: 0,
          schedule: 'completion',
          method: 'bank_transfer'
        },
        timeline: initialData?.sections?.timeline || ''
      }
    }
  })

  const { fields: deliverableFields, append: appendDeliverable, remove: removeDeliverable } = useFieldArray({
    control,
    name: "sections.deliverables"
  })

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control,
    name: "sections.milestones"
  })

  const paymentSchedule = watch("sections.paymentTerms.schedule")

  const handleFormSubmit = async (data: ContractTemplate) => {
    await onSubmit(data)
  }

  const handlePreview = () => {
    const currentData = watch()
    const text = generateContractText(currentData)
    setPreviewText(text)
    setShowPreview(true)
    if (onPreview) {
      onPreview(currentData)
    }
  }

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Contract Preview</h3>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Back to Edit
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm">{previewText}</pre>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contract Details</CardTitle>
            <Button type="button" variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contract Name */}
          <div>
            <Label htmlFor="contractName">Contract Name</Label>
            <Input
              id="contractName"
              {...register("name")}
              placeholder="e.g., Q1 2024 Campaign Contract"
            />
          </div>

          {/* Deliverables */}
          <div>
            <Label>Deliverables</Label>
            <div className="space-y-2 mt-2">
              {deliverableFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`sections.deliverables.${index}` as const)}
                    placeholder="e.g., 3 Instagram posts, 1 TikTok video"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeDeliverable(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
          </div>

          {/* Milestones */}
          <div>
            <Label>Milestones</Label>
            <div className="space-y-4 mt-2">
              {milestoneFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        {...register(`sections.milestones.${index}.description` as const)}
                        placeholder="Milestone description"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        {...register(`sections.milestones.${index}.dueDate` as const)}
                        placeholder="Due date"
                      />
                      <Input
                        type="number"
                        {...register(`sections.milestones.${index}.paymentAmount` as const, { valueAsNumber: true })}
                        placeholder="Payment amount"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendMilestone({ description: "", dueDate: "", paymentAmount: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <Label>Payment Terms</Label>
            <div className="space-y-4 mt-2">
              <div>
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  {...register("sections.paymentTerms.totalAmount", { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="paymentSchedule">Payment Schedule</Label>
                <Select
                  value={paymentSchedule}
                  onValueChange={(value) => setValue("sections.paymentTerms.schedule", value as any)}
                >
                  <SelectTrigger id="paymentSchedule">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upfront">Upfront</SelectItem>
                    <SelectItem value="milestone">Milestone-based</SelectItem>
                    <SelectItem value="completion">Upon Completion</SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={watch("sections.paymentTerms.method")}
                  onValueChange={(value) => setValue("sections.paymentTerms.method", value as any)}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <Label htmlFor="timeline">Timeline</Label>
            <Textarea
              id="timeline"
              {...register("sections.timeline")}
              placeholder="e.g., Project to be completed within 4-6 weeks from start date"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Contract"}
        </Button>
      </div>
    </form>
  )
}


