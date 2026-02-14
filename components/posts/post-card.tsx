"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Trash2 } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
// Dropdown menu - using simple button for now

interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  user?: {
    id: string
    role: 'creator' | 'brand'
    verified: boolean
  }
  profile?: {
    profile_image_url?: string | null
    instagram_handle?: string
    company_name?: string
  }
  isLiked?: boolean
}

interface PostCardProps {
  post: Post
  currentUserId?: string | null
  onLike?: (postId: string) => void
  onDelete?: (postId: string) => void
  onComment?: (postId: string) => void
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
  onComment
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count)

  const handleLike = async () => {
    if (!currentUserId || !onLike) return

    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1)

    try {
      await onLike(post.id)
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState)
      setLikesCount(prev => newLikedState ? prev - 1 : prev + 1)
    }
  }

  const displayName = post.user?.role === 'creator'
    ? `@${post.profile?.instagram_handle || 'creator'}`
    : post.profile?.company_name || 'Brand'

  const isOwnPost = currentUserId === post.user_id

  return (
    <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Profile Image */}
            {post.profile?.profile_image_url ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <Image
                  src={post.profile.profile_image_url}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                post.user?.role === 'creator' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                <span className="text-lg font-semibold">
                  {post.user?.role === 'creator' ? '👤' : '🏢'}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{displayName}</span>
                {post.user?.verified && (
                  <span className="text-blue-500">✓</span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* More Options */}
          {isOwnPost && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (confirm('Are you sure you want to delete this post?')) {
                  onDelete(post.id)
                }
              }}
              title="Delete post"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Post Content */}
        {post.content && (
          <p className="text-gray-900 whitespace-pre-wrap break-words">
            {post.content}
          </p>
        )}

        {/* Post Image */}
        {post.image_url && (
          <div className="relative w-full rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={post.image_url}
              alt="Post image"
              width={800}
              height={600}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!currentUserId}
            className={`flex items-center gap-2 ${
              isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-600'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment?.(post.id)}
            disabled={!currentUserId}
            className="flex items-center gap-2 text-gray-600"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments_count}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

