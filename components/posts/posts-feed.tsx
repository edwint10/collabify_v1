"use client"

import { useState, useEffect } from "react"
import PostCard from "./post-card"
import PostCreator from "./post-creator"
import { Loader2 } from "lucide-react"

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

interface PostsFeedProps {
  userId: string
  currentUserId?: string | null // Optional, will be fetched from localStorage if not provided
  showCreator?: boolean
}

export default function PostsFeed({ userId, currentUserId, showCreator = true }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actualCurrentUserId, setActualCurrentUserId] = useState<string | null>(currentUserId || null)

  useEffect(() => {
    // Get current user ID from localStorage if not provided
    if (!actualCurrentUserId && typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId')
      setActualCurrentUserId(storedUserId)
    }
  }, [actualCurrentUserId])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      
      // Fetch like status for each post if user is logged in
      if (actualCurrentUserId && data.posts) {
        const postsWithLikes = await Promise.all(
          data.posts.map(async (post: Post) => {
            try {
              const likeResponse = await fetch(`/api/posts/${post.id}/check-like?userId=${actualCurrentUserId}`)
              if (likeResponse.ok) {
                const likeData = await likeResponse.json()
                return { ...post, isLiked: likeData.isLiked }
              }
            } catch (err) {
              // Ignore errors checking likes
            }
            return { ...post, isLiked: false }
          })
        )
        setPosts(postsWithLikes)
      } else {
        setPosts(data.posts || [])
      }
    } catch (err: any) {
      console.error('Error fetching posts:', err)
      setError(err.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [userId, actualCurrentUserId])

  const handlePostCreated = () => {
    fetchPosts()
  }

  const handleLike = async (postId: string) => {
    if (!actualCurrentUserId) return

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: actualCurrentUserId }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      // Refresh posts to get updated counts
      fetchPosts()
    } catch (error: any) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  const handleDelete = async (postId: string) => {
    if (!actualCurrentUserId) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: actualCurrentUserId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      // Remove from local state
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (error: any) {
      console.error('Error deleting post:', error)
      alert(`Failed to delete post: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <button
          onClick={fetchPosts}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Post Creator */}
      {showCreator && actualCurrentUserId === userId && (
        <PostCreator
          userId={userId}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {actualCurrentUserId === userId 
              ? "No posts yet. Share something with your network!"
              : "No posts yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={actualCurrentUserId}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

