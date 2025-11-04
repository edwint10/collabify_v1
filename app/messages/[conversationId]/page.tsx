"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import MessageThread from "@/components/messaging/message-thread"
import MessageInput from "@/components/messaging/message-input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Building2, FileText } from "lucide-react"
import { useRealtimeMessages } from "@/lib/hooks/use-realtime-messages"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import NDAGenerator from "@/components/contracts/nda-generator"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachments: any[]
  read_at: string | null
  created_at: string
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string
  
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  const [currentUserRole, setCurrentUserRole] = useState<'creator' | 'brand' | null>(null)
  const [showNDAModal, setShowNDAModal] = useState(false)

  // Real-time updates
  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev
      }
      return [...prev, newMessage]
    })
  }, [])

  useRealtimeMessages(conversationId, handleNewMessage)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/')
      return
    }
    setCurrentUserId(userId)

    const fetchData = async () => {
      try {
        // Fetch current user profile for templates
        const profileResponse = await fetch(`/api/profiles/${userId}`)
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setCurrentUserProfile(profileData.profile)
          setCurrentUserRole(profileData.role)
        }

        // Fetch conversation details
        const convResponse = await fetch(`/api/conversations/${conversationId}?userId=${userId}`)
        if (!convResponse.ok) {
          throw new Error('Failed to fetch conversation')
        }
        const convData = await convResponse.json()
        setConversation(convData.conversation)

        // Fetch messages
        const messagesResponse = await fetch(`/api/messages?conversationId=${conversationId}`)
        if (!messagesResponse.ok) {
          throw new Error('Failed to fetch messages')
        }
        const messagesData = await messagesResponse.json()
        setMessages(messagesData.messages || [])

        // Mark messages as read
        if (userId) {
          try {
            await fetch(`/api/conversations/${conversationId}/read`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
            })
          } catch (err) {
            console.error('Error marking messages as read:', err)
          }
        }
      } catch (err: any) {
        console.error('Error fetching conversation data:', err)
        setError(err.message || 'Failed to load conversation')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [conversationId, router])

  const handleSendMessage = useCallback(async (content: string, attachments: any[]) => {
    if (!currentUserId) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: currentUserId,
          content,
          attachments
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setMessages(prev => [...prev, data.message])
    } catch (err: any) {
      console.error('Error sending message:', err)
      throw err
    }
  }, [conversationId, currentUserId])

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading conversation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !conversation || !currentUserId) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error || 'Conversation not found'}</p>
              <Button onClick={() => router.push('/messages')}>
                Back to Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const otherUser = conversation.otherUser
  const otherProfile = conversation.otherProfile
  const displayName = otherUser?.role === 'brand'
    ? otherProfile?.company_name || 'Brand'
    : `@${otherProfile?.instagram_handle || otherProfile?.tiktok_handle || 'Creator'}`

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="flex flex-col h-[calc(100vh-8rem)]">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/messages')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              otherUser?.role === 'creator'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-purple-100 text-purple-600'
            }`}>
              {otherUser?.role === 'creator' ? (
                <User className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">{displayName}</h2>
              {otherProfile?.bio && (
                <p className="text-sm text-gray-500 truncate">{otherProfile.bio}</p>
              )}
            </div>
            <Dialog open={showNDAModal} onOpenChange={setShowNDAModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate NDA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Generate Non-Disclosure Agreement</DialogTitle>
                </DialogHeader>
                <NDAGenerator
                  brandName={
                    currentUserRole === 'brand'
                      ? currentUserProfile?.company_name || ''
                      : otherProfile?.company_name || ''
                  }
                  creatorName={
                    currentUserRole === 'creator'
                      ? `@${currentUserProfile?.instagram_handle || currentUserProfile?.tiktok_handle || ''}`
                      : `@${otherProfile?.instagram_handle || otherProfile?.tiktok_handle || ''}`
                  }
                  onSave={async (ndaText: string) => {
                    try {
                      // Get match ID from conversation
                      const matchId = conversation?.match?.id
                      if (!matchId) {
                        throw new Error('No match found for this conversation')
                      }

                      // Get campaign ID from match if available (optional)
                      const campaignId = undefined // Can be linked later

                      // Save contract
                      const contractResponse = await fetch('/api/contracts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          campaignId,
                          type: 'nda',
                          content: ndaText
                        })
                      })

                      if (!contractResponse.ok) {
                        throw new Error('Failed to save NDA')
                      }

                      const contractData = await contractResponse.json()
                      const contractId = contractData.contract.id

                      // Send NDA as a message in the conversation
                      const messageContent = `📄 NDA Generated\n\nI've generated a Non-Disclosure Agreement for our collaboration.\n\nView and sign the NDA using the attachment below.\n\nPreview:\n${ndaText.substring(0, 300)}${ndaText.length > 300 ? '...' : ''}`

                      const messageResponse = await fetch('/api/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          conversationId,
                          senderId: currentUserId,
                          content: messageContent,
                          attachments: [{
                            type: 'contract',
                            url: `/contracts/${contractId}`,
                            filename: 'NDA',
                            name: 'NDA',
                            contractId: contractId,
                            size: 0
                          }]
                        })
                      })

                      // Read response once
                      const messageData = await messageResponse.json()
                      
                      if (!messageResponse.ok) {
                        throw new Error(messageData.error || 'Failed to send NDA message')
                      }

                      // Add the message to local state
                      if (messageData.message) {
                        setMessages(prev => [...prev, messageData.message])
                      }

                      setShowNDAModal(false)
                      alert('NDA generated and sent successfully!')
                    } catch (error: any) {
                      console.error('Error saving NDA:', error)
                      alert(`Failed to save NDA: ${error.message}`)
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <MessageThread
            messages={messages}
            currentUserId={currentUserId}
            otherUser={otherUser}
            otherProfile={otherProfile}
          />
          <MessageInput
            conversationId={conversationId}
            senderId={currentUserId}
            onSend={handleSendMessage}
            userProfile={currentUserProfile}
            userRole={currentUserRole || undefined}
          />
        </CardContent>
      </Card>
    </div>
  )
}

