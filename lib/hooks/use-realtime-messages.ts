"use client"

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachments: any[]
  read_at: string | null
  created_at: string
}

export function useRealtimeMessages(
  conversationId: string | null,
  onNewMessage?: (message: Message) => void
) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!conversationId) return

    const supabase = createClient()

    // Subscribe to messages for this conversation
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          if (onNewMessage) {
            onNewMessage(newMessage)
          } else {
            setMessages(prev => [...prev, newMessage])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          setMessages(prev =>
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          )
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [conversationId, onNewMessage])

  return { messages, isConnected }
}


