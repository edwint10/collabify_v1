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
import { Instagram, Video, Save } from "lucide-react"

const creatorProfileSchema = z.object({
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  followerCountIG: z.string().optional(),
  followerCountTiktok: z.string().optional(),
  bio: z.string().optional(),
})

type CreatorProfileFormData = z.infer<typeof creatorProfileSchema>

export default function CreatorProfileForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatorProfileFormData>({
    resolver: zodResolver(creatorProfileSchema),
  })

  const onSubmit = async (data: CreatorProfileFormData) => {
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
      const response = await fetch('/api/profiles/creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          instagram_handle: data.instagramHandle,
          tiktok_handle: data.tiktokHandle,
          follower_count_ig: data.followerCountIG ? parseInt(data.followerCountIG) : undefined,
          follower_count_tiktok: data.followerCountTiktok ? parseInt(data.followerCountTiktok) : undefined,
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
        <CardTitle>Creator Profile</CardTitle>
        <CardDescription>
          Add your social media handles and showcase your work
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagramHandle" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram Handle
              </Label>
              <Input
                id="instagramHandle"
                placeholder="@yourhandle"
                {...register("instagramHandle")}
              />
              {errors.instagramHandle && (
                <p className="text-sm text-destructive">
                  {errors.instagramHandle.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktokHandle" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                TikTok Handle
              </Label>
              <Input
                id="tiktokHandle"
                placeholder="@yourhandle"
                {...register("tiktokHandle")}
              />
              {errors.tiktokHandle && (
                <p className="text-sm text-destructive">
                  {errors.tiktokHandle.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followerCountIG">Instagram Followers</Label>
              <Input
                id="followerCountIG"
                type="number"
                placeholder="10000"
                {...register("followerCountIG")}
              />
              <p className="text-xs text-gray-500">
                We&apos;ll verify this later (mock for MVP)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followerCountTiktok">TikTok Followers</Label>
              <Input
                id="followerCountTiktok"
                type="number"
                placeholder="5000"
                {...register("followerCountTiktok")}
              />
              <p className="text-xs text-gray-500">
                We&apos;ll verify this later (mock for MVP)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell brands about yourself and your content..."
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

