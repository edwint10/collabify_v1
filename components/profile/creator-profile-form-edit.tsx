"use client"

import { useState, useEffect } from "react"
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

interface CreatorProfileFormEditProps {
  userId: string
  initialData?: {
    instagram_handle?: string
    tiktok_handle?: string
    follower_count_ig?: number
    follower_count_tiktok?: number
    bio?: string
  }
}

export default function CreatorProfileFormEdit({ userId, initialData }: CreatorProfileFormEditProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!initialData)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreatorProfileFormData>({
    resolver: zodResolver(creatorProfileSchema),
    defaultValues: initialData ? {
      instagramHandle: initialData.instagram_handle || '',
      tiktokHandle: initialData.tiktok_handle || '',
      followerCountIG: initialData.follower_count_ig?.toString() || '',
      followerCountTiktok: initialData.follower_count_tiktok?.toString() || '',
      bio: initialData.bio || '',
    } : undefined,
  })

  useEffect(() => {
    if (initialData) {
      setValue('instagramHandle', initialData.instagram_handle || '')
      setValue('tiktokHandle', initialData.tiktok_handle || '')
      setValue('followerCountIG', initialData.follower_count_ig?.toString() || '')
      setValue('followerCountTiktok', initialData.follower_count_tiktok?.toString() || '')
      setValue('bio', initialData.bio || '')
      setLoading(false)
    }
  }, [initialData, setValue])

  const onSubmit = async (data: CreatorProfileFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Update in Supabase
      const response = await fetch('/api/profiles/creator/update', {
        method: 'PUT',
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
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Success! Redirect to profile view
      router.push(`/user/${userId}`)
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <p className="text-center text-gray-500">Loading profile...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Creator Profile</CardTitle>
        <CardDescription>
          Update your social media handles and showcase your work
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
              onClick={() => router.push(`/user/${userId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

