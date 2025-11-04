import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export interface MessageAttachment {
  url: string
  filename: string
  type: string
  size: number
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  attachments: MessageAttachment[] = []
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      attachments: attachments.length > 0 ? attachments : []
    }])
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    throw new Error(`Failed to send message: ${error.message}`)
  }

  // Update conversation updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data
}

export async function getMessages(conversationId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    throw new Error(`Failed to fetch messages: ${error.message}`)
  }

  return data || []
}

export async function markAsRead(conversationId: string, userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Mark all unread messages in this conversation as read
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .is('read_at', null)

  if (error) {
    console.error('Error marking messages as read:', error)
    throw new Error(`Failed to mark messages as read: ${error.message}`)
  }
}

export async function markMessageAsRead(messageId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .is('read_at', null)

  if (error) {
    console.error('Error marking message as read:', error)
    throw new Error(`Failed to mark message as read: ${error.message}`)
  }
}

export async function getUnreadCount(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Get all conversations for this user
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, match_id')
    .order('updated_at', { ascending: false })

  if (!conversations || conversations.length === 0) {
    return 0
  }

  // Get matches to find which conversations belong to this user
  const conversationIds = conversations.map(c => c.id)
  const { data: matches } = await supabase
    .from('matches')
    .select('id, creator_id, brand_id')
    .in('id', conversations.map(c => c.match_id))

  if (!matches) {
    return 0
  }

  // Filter conversations where user is a participant
  const userConversationIds = conversations
    .filter(c => {
      const match = matches.find(m => m.id === c.match_id)
      return match && (match.creator_id === userId || match.brand_id === userId)
    })
    .map(c => c.id)

  if (userConversationIds.length === 0) {
    return 0
  }

  // Count unread messages (messages not sent by user, not read)
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', userConversationIds)
    .neq('sender_id', userId)
    .is('read_at', null)

  if (error) {
    console.error('Error counting unread messages:', error)
    return 0
  }

  return count || 0
}


