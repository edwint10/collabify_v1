"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Building2 } from "lucide-react"
import Link from "next/link"
import VerificationBadge from "@/components/ui/verification-badge"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  match_id: string
  created_at: string
  updated_at: string
  otherUser?: {
    id: string
    role: 'creator' | 'brand'
    verified: boolean
  }
  otherProfile?: any
  lastMessage?: {
    id: string
    content: string
    sender_id: string
    created_at: string
  }
  unreadCount: number
}

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  loading?: boolean
}

export default function ConversationList({
  conversations,
  currentUserId,
  loading = false
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No conversations yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Start swiping to find matches and begin conversations
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherUser
        const otherProfile = conversation.otherProfile
        const displayName = otherUser?.role === 'brand'
          ? otherProfile?.company_name || 'Brand'
          : `@${otherProfile?.instagram_handle || otherProfile?.tiktok_handle || 'Creator'}`

        return (
          <Link key={conversation.id} href={`/messages/${conversation.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    otherUser?.role === 'creator'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                  }`}>
                    {otherUser?.role === 'creator' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">
                          {displayName}
                        </h3>
                        {otherUser?.verified && (
                          <VerificationBadge verified={true} showText={false} />
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <Badge variant="default" className="flex-shrink-0">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}




