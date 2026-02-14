"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Image as ImageIcon, X, Send, Loader2 } from "lucide-react"
import Image from "next/image"

interface PostCreatorProps {
  userId: string
  onPostCreated?: () => void
  placeholder?: string
}

export default function PostCreator({ 
  userId, 
  onPostCreated,
  placeholder = "What's on your mind?"
}: PostCreatorProps) {
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setImageFile(file)
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() && !imageFile) {
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl: string | null = null

      // Upload image if present
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('userId', userId)

        const uploadResponse = await fetch('/api/profiles/upload-image', {
          method: 'POST',
          headers: {
            'X-User-Id': userId,
          },
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.imageUrl
      }

      // Create post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          content: content.trim(),
          imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      // Reset form
      setContent("")
      setImagePreview(null)
      setImageFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Notify parent
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      alert(`Failed to create post: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-2 shadow-md">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="resize-none text-base"
            disabled={isSubmitting}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={imagePreview}
                alt="Post preview"
                width={600}
                height={400}
                className="w-full h-auto max-h-96 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Photo
              </Button>
            </div>

            <Button
              type="submit"
              disabled={(!content.trim() && !imageFile) || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

