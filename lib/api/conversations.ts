import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getUser } from '@/lib/api/users'
import { getCreatorProfile, getBrandProfile } from '@/lib/api/profiles'

export async function getOrCreateConversation(matchId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Check if conversation already exists
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('match_id', matchId)
    .single()

  if (existingConversation) {
    return existingConversation
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ match_id: matchId }])
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    throw new Error(`Failed to create conversation: ${error.message}`)
  }

  return data
}

export async function getConversationsForUser(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Get user to determine role
  const user = await getUser(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const role = user.role
  const matchColumn = role === 'creator' ? 'creator_id' : 'brand_id'

  // Get all matches for this user
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, creator_id, brand_id, status')
    .eq(matchColumn, userId)
    .eq('status', 'shortlisted')

  if (matchesError) {
    console.error('Error fetching matches:', matchesError)
    throw new Error(`Failed to fetch matches: ${matchesError.message}`)
  }

  if (!matches || matches.length === 0) {
    return []
  }

  const matchIds = matches.map(m => m.id)

  // Get conversations for these matches
  const { data: conversations, error: conversationsError } = await supabase
    .from('conversations')
    .select('id, match_id, created_at, updated_at')
    .in('match_id', matchIds)
    .order('updated_at', { ascending: false })

  if (conversationsError) {
    console.error('Error fetching conversations:', conversationsError)
    throw new Error(`Failed to fetch conversations: ${conversationsError.message}`)
  }

  if (!conversations || conversations.length === 0) {
    return []
  }

  // Enrich conversations with match and participant info
  const enrichedConversations = await Promise.all(
    conversations.map(async (conversation) => {
      const match = matches.find(m => m.id === conversation.match_id)
      if (!match) return null

      const oppositeUserId = role === 'creator' ? match.brand_id : match.creator_id
      const oppositeUser = await getUser(oppositeUserId)
      const oppositeProfile = oppositeUser?.role === 'creator'
        ? await getCreatorProfile(oppositeUserId)
        : await getBrandProfile(oppositeUserId)

      // Get last message and unread count
      const { data: messages } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at, read_at')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const lastMessage = messages && messages.length > 0 ? messages[0] : null

      // Count unread messages
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversation.id)
        .eq('sender_id', oppositeUserId)
        .is('read_at', null)

      return {
        ...conversation,
        match,
        otherUser: oppositeUser,
        otherProfile: oppositeProfile,
        lastMessage,
        unreadCount: unreadCount || 0
      }
    })
  )

  return enrichedConversations.filter(c => c !== null)
}

export async function getConversationById(conversationId: string, userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Get conversation
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (conversationError || !conversation) {
    throw new Error('Conversation not found')
  }

  // Get match details
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', conversation.match_id)
    .single()

  if (matchError || !match) {
    throw new Error('Match not found')
  }

  // Get other participant
  const otherUserId = match.creator_id === userId ? match.brand_id : match.creator_id
  const otherUser = await getUser(otherUserId)
  const otherProfile = otherUser?.role === 'creator'
    ? await getCreatorProfile(otherUserId)
    : await getBrandProfile(otherUserId)

  return {
    ...conversation,
    match,
    otherUser,
    otherProfile
  }
}

