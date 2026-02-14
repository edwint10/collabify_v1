import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export interface PostData {
  content: string
  image_url?: string | null
}

export interface Post extends PostData {
  id: string
  user_id: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
}

export async function createPost(userId: string, postData: PostData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('posts')
    .insert([{
      user_id: userId,
      content: postData.content,
      image_url: postData.image_url || null
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating post:', error)
    throw new Error(`Failed to create post: ${error.message}`)
  }

  return data
}

export async function getPostsByUser(userId: string, limit: number = 20, offset: number = 0) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching posts:', error)
    throw new Error(`Failed to fetch posts: ${error.message}`)
  }

  if (!posts || posts.length === 0) {
    return []
  }

  // Fetch user and profile data for each post
  const { getUser } = await import('@/lib/api/users')
  const { getCreatorProfile, getBrandProfile } = await import('@/lib/api/profiles')

  const enrichedPosts = await Promise.all(
    posts.map(async (post) => {
      try {
        const user = await getUser(post.user_id)
        const profile = user.role === 'creator'
          ? await getCreatorProfile(post.user_id)
          : await getBrandProfile(post.user_id)

        return {
          ...post,
          user,
          profile
        }
      } catch (err) {
        console.error(`Error fetching user/profile for post ${post.id}:`, err)
        return post
      }
    })
  )

  return enrichedPosts
}

export async function getPost(postId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    throw new Error(`Failed to fetch post: ${error.message}`)
  }

  return data
}

export async function deletePost(postId: string, userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Verify user owns the post
  const post = await getPost(postId)
  if (post.user_id !== userId) {
    throw new Error('Unauthorized: You can only delete your own posts')
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    console.error('Error deleting post:', error)
    throw new Error(`Failed to delete post: ${error.message}`)
  }
}

export async function togglePostLike(postId: string, userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to unlike post: ${error.message}`)
    }
    return { liked: false }
  } else {
    // Like
    const { error } = await supabase
      .from('post_likes')
      .insert([{
        post_id: postId,
        user_id: userId
      }])

    if (error) {
      throw new Error(`Failed to like post: ${error.message}`)
    }
    return { liked: true }
  }
}

export async function checkPostLiked(postId: string, userId: string): Promise<boolean> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  return !!data
}

