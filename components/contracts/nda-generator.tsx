"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, File } from "lucide-react"
import { generateNDA } from "@/lib/services/nda-generator"
import { generateNDAPDF, downloadPDF, downloadText } from "@/lib/services/pdf-generator"

interface NDAGeneratorProps {
  brandName?: string
  creatorName?: string
  onGenerate?: (ndaText: string) => void
  onSave?: (ndaText: string) => Promise<void>
}

export default function NDAGenerator({
  brandName = "",
  creatorName = "",
  onGenerate,
  onSave
}: NDAGeneratorProps) {
  const [formData, setFormData] = useState({
    brandName: brandName,
    creatorName: creatorName,
    term: "2 years"
  })
  const [ndaText, setNdaText] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleGenerate = async () => {
    if (!formData.brandName || !formData.creatorName) {
      alert("Please fill in both brand name and creator name")
      return
    }

    setIsGenerating(true)
    try {
      const generated = generateNDA({
        brandName: formData.brandName,
        creatorName: formData.creatorName,
        term: formData.term
      })
      setNdaText(generated)
      if (onGenerate) {
        onGenerate(generated)
      }
    } catch (error) {
      console.error('Error generating NDA:', error)
      alert('Failed to generate NDA')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!ndaText) return

    try {
      const pdfBlob = await generateNDAPDF(ndaText, {
        title: "Non-Disclosure Agreement",
        brandName: formData.brandName,
        creatorName: formData.creatorName
      })
      const filename = `NDA_${formData.brandName}_${formData.creatorName}_${new Date().toISOString().split('T')[0]}.pdf`
      downloadPDF(pdfBlob, filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF')
    }
  }

  const handleDownloadTXT = () => {
    if (!ndaText) return

    const filename = `NDA_${formData.brandName}_${formData.creatorName}_${new Date().toISOString().split('T')[0]}.txt`
    downloadText(ndaText, filename)
  }

  const handleSave = async () => {
    if (!ndaText || !onSave) return

    setIsSaving(true)
    try {
      await onSave(ndaText)
      alert('NDA saved successfully')
    } catch (error) {
      console.error('Error saving NDA:', error)
      alert('Failed to save NDA')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate NDA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brandName">Brand Name *</Label>
            <Input
              id="brandName"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="Enter brand or company name"
            />
          </div>

          <div>
            <Label htmlFor="creatorName">Creator Name *</Label>
            <Input
              id="creatorName"
              value={formData.creatorName}
              onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
              placeholder="Enter creator name or handle"
            />
          </div>

          <div>
            <Label htmlFor="term">Term *</Label>
            <Input
              id="term"
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              placeholder="e.g., 2 years, 1 year, 6 months"
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate NDA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {ndaText && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated NDA</CardTitle>
              <div className="flex gap-2">
                {onSave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTXT}
                >
                  <File className="h-4 w-4 mr-2" />
                  Download TXT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={ndaText}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}


