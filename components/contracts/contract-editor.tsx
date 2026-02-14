"use client"

import { useState, useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Eye, FileText, Calendar, DollarSign, Clock, CheckCircle2, Sparkles } from "lucide-react"
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
    name: "sections.deliverables" as any
  })

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control,
    name: "sections.milestones" as any
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
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Contract Details</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Create a professional collaboration contract</p>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={handlePreview} className="shadow-sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Contract Name */}
          <div className="space-y-2">
            <Label htmlFor="contractName" className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Contract Name
            </Label>
            <Input
              id="contractName"
              {...register("name")}
              placeholder="e.g., Q1 2024 Campaign Contract"
              className="h-11 text-base"
            />
          </div>

          {/* Deliverables */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Deliverables
            </Label>
            <div className="space-y-3 mt-2">
              {deliverableFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <Input
                    {...register(`sections.deliverables.${index}` as const)}
                    placeholder="e.g., 3 Instagram posts, 1 TikTok video"
                    className="flex-1 h-11"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDeliverable(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendDeliverable("" as any)}
                className="w-full border-dashed hover:border-solid transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Deliverable
              </Button>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Milestones
            </Label>
            <div className="space-y-4 mt-2">
              {milestoneFields.map((field, index) => (
                <Card key={field.id} className="border-2 hover:border-primary/50 transition-colors shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <Input
                          {...register(`sections.milestones.${index}.description` as const)}
                          placeholder="Milestone description"
                          className="h-11"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Due Date</Label>
                            <Input
                              type="date"
                              {...register(`sections.milestones.${index}.dueDate` as const)}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Payment Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                {...register(`sections.milestones.${index}.paymentAmount` as const, { valueAsNumber: true })}
                                placeholder="0.00"
                                className="h-11 pl-9"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendMilestone({ description: "", dueDate: "", paymentAmount: 0 })}
                className="w-full border-dashed hover:border-solid transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Payment Terms
            </Label>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount" className="text-sm font-medium">Total Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input
                      id="totalAmount"
                      type="number"
                      {...register("sections.paymentTerms.totalAmount", { valueAsNumber: true })}
                      placeholder="0.00"
                      className="h-11 pl-10 text-lg font-semibold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentSchedule" className="text-sm font-medium">Payment Schedule</Label>
                    <Select
                      value={paymentSchedule}
                      onValueChange={(value) => setValue("sections.paymentTerms.schedule", value as any)}
                    >
                      <SelectTrigger id="paymentSchedule" className="h-11">
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
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method</Label>
                    <Select
                      value={watch("sections.paymentTerms.method")}
                      onValueChange={(value) => setValue("sections.paymentTerms.method", value as any)}
                    >
                      <SelectTrigger id="paymentMethod" className="h-11">
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
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Timeline
            </Label>
            <Textarea
              id="timeline"
              {...register("sections.timeline")}
              placeholder="e.g., Project to be completed within 4-6 weeks from start date"
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-[140px] h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Contract
            </>
          )}
        </Button>
      </div>
    </form>
  )
}



