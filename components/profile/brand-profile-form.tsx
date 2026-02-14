"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Save } from "lucide-react"

const brandProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  vertical: z.string().min(1, "Vertical is required"),
  adSpendRange: z.string().min(1, "Ad spend range is required"),
  bio: z.string().optional(),
})

type BrandProfileFormData = z.infer<typeof brandProfileSchema>

export default function BrandProfileForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BrandProfileFormData>({
    resolver: zodResolver(brandProfileSchema),
  })

  const vertical = watch("vertical")
  const adSpendRange = watch("adSpendRange")

  const onSubmit = async (data: BrandProfileFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Get userId from localStorage
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null

      if (!userId) {
        setError("User ID not found. Please select your role first.")
        return
      }

      // Save to Supabase
      const response = await fetch('/api/profiles/brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          userId,
          company_name: data.companyName,
          vertical: data.vertical,
          ad_spend_range: data.adSpendRange,
          bio: data.bio,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      // Success! Navigate to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Error saving profile:", err)
      setError(err.message || "Failed to save profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Brand Profile</CardTitle>
        <CardDescription>
          Set up your brand profile to find creators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Name
            </Label>
            <Input
              id="companyName"
              placeholder="Your Company"
              {...register("companyName")}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vertical">Industry Vertical</Label>
              <Select
                value={vertical}
                onValueChange={(value) => setValue("vertical", value)}
              >
                <SelectTrigger id="vertical">
                  <SelectValue placeholder="Select vertical" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="fitness">Fitness & Health</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.vertical && (
                <p className="text-sm text-destructive">
                  {errors.vertical.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adSpendRange">Ad Spend Range</Label>
              <Select
                value={adSpendRange}
                onValueChange={(value) => setValue("adSpendRange", value)}
              >
                <SelectTrigger id="adSpendRange">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-1k">Under $1,000</SelectItem>
                  <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                  <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                  <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                  <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                  <SelectItem value="over-100k">Over $100,000</SelectItem>
                </SelectContent>
              </Select>
              {errors.adSpendRange && (
                <p className="text-sm text-destructive">
                  {errors.adSpendRange.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About Your Brand</Label>
            <Textarea
              id="bio"
              placeholder="Tell creators about your brand and what you're looking for..."
              rows={4}
              {...register("bio")}
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


