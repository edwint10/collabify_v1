"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ConversationList from "@/components/messaging/conversation-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export default function MessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          router.push('/')
          return
        }

        const response = await fetch(`/api/conversations?userId=${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch conversations')
        }

        const data = await response.json()
        setConversations(data.conversations || [])
      } catch (err: any) {
        console.error('Error fetching conversations:', err)
        setError(err.message || 'Failed to load conversations')
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Messages</CardTitle>
            </div>
            <Button onClick={() => router.push('/matches')}>
              Find Matches
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userId && (
            <ConversationList
              conversations={conversations}
              currentUserId={userId}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}


