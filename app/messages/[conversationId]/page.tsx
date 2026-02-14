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
import ContractEditor from "@/components/contracts/contract-editor"
import type { ContractTemplate } from "@/lib/templates/contract-templates"

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
  const [showContractModal, setShowContractModal] = useState(false)
  const [editingContractId, setEditingContractId] = useState<string | null>(null)

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
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/messages')}
              className="hover:bg-white shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
              otherUser?.role === 'creator'
                ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
            }`}>
              {otherUser?.role === 'creator' ? (
                <User className="h-6 w-6" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg truncate">{displayName}</h2>
              {otherProfile?.bio && (
                <p className="text-sm text-gray-600 truncate mt-0.5">{otherProfile.bio}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog open={showNDAModal} onOpenChange={setShowNDAModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow border-2">
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
              <Dialog open={showContractModal} onOpenChange={setShowContractModal}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Contract
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContractId ? 'Edit Contract' : 'Create Collaboration Contract'}
                    </DialogTitle>
                  </DialogHeader>
                  <ContractEditor
                    initialData={undefined}
                    onSubmit={async (contractData: ContractTemplate) => {
                      try {
                        const { generateContractText } = await import('@/lib/templates/contract-templates')
                        const contractText = generateContractText(contractData)

                        // Get match ID from conversation
                        const matchId = conversation?.match?.id
                        if (!matchId) {
                          throw new Error('No match found for this conversation')
                        }

                        // Get campaign ID from match if available (optional)
                        const campaignId = undefined // Can be linked later

                        let contractId = editingContractId

                        if (editingContractId) {
                          // Update existing contract
                          const updateResponse = await fetch(`/api/contracts/${editingContractId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              content: contractText,
                              version: undefined // Will be incremented server-side
                            })
                          })

                          if (!updateResponse.ok) {
                            throw new Error('Failed to update contract')
                          }

                          const updateData = await updateResponse.json()
                          contractId = updateData.contract.id
                        } else {
                          // Create new contract
                          const contractResponse = await fetch('/api/contracts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              campaignId,
                              type: 'contract',
                              content: contractText
                            })
                          })

                          if (!contractResponse.ok) {
                            throw new Error('Failed to save contract')
                          }

                          const contractDataResponse = await contractResponse.json()
                          contractId = contractDataResponse.contract.id
                        }

                        // Send contract as a message in the conversation
                        const messageContent = `📄 ${editingContractId ? 'Contract Updated' : 'Contract Created'}\n\nI've ${editingContractId ? 'updated' : 'created'} a collaboration contract for our project.\n\nView and sign the contract using the attachment below.\n\nContract Name: ${contractData.name}`

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
                              filename: contractData.name || 'Contract',
                              name: contractData.name || 'Contract',
                              contractId: contractId,
                              size: 0
                            }]
                          })
                        })

                        const messageData = await messageResponse.json()
                        
                        if (!messageResponse.ok) {
                          throw new Error(messageData.error || 'Failed to send contract message')
                        }

                        // Add the message to local state
                        if (messageData.message) {
                          setMessages(prev => [...prev, messageData.message])
                        }

                        setShowContractModal(false)
                        setEditingContractId(null)
                        alert(`Contract ${editingContractId ? 'updated' : 'created'} and sent successfully!`)
                      } catch (error: any) {
                        console.error('Error saving contract:', error)
                        alert(`Failed to save contract: ${error.message}`)
                      }
                    }}
                    isSubmitting={false}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <MessageThread
            messages={messages}
            currentUserId={currentUserId}
            otherUser={otherUser}
            otherProfile={otherProfile}
            onEditContract={async (contractId: string) => {
              try {
                // Fetch contract data
                const contractResponse = await fetch(`/api/contracts/${contractId}`)
                if (!contractResponse.ok) {
                  throw new Error('Failed to fetch contract')
                }

                const contractData = await contractResponse.json()
                const contract = contractData.contract

                // For now, we'll allow editing by opening the contract editor
                // Since contracts are stored as text, we'll create a new version
                // In the future, you might want to store template data separately
                setEditingContractId(contractId)
                setShowContractModal(true)

                // Note: We're not loading the contract template back into the editor
                // because contracts are stored as plain text. You would need to either:
                // 1. Store template data separately in a JSON field
                // 2. Parse the text back (complex)
                // 3. Or just allow creating a new version
              } catch (error: any) {
                console.error('Error loading contract:', error)
                alert(`Failed to load contract: ${error.message}`)
              }
            }}
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

