"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { User, Building2, File, Download, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface MessageAttachment {
  url: string
  filename: string
  type: string
  size: number
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachments: MessageAttachment[]
  read_at: string | null
  created_at: string
}

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
  otherUser?: {
    id: string
    role: 'creator' | 'brand'
    verified: boolean
  }
  otherProfile?: any
}

const isImage = (attachment: MessageAttachment): boolean => {
  return attachment.type?.startsWith('image/') ?? false
}

export default function MessageThread({
  messages,
  currentUserId,
  otherUser,
  otherProfile
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No messages yet</p>
          <p className="text-sm text-gray-400">
            Start the conversation by sending a message
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isOwnMessage 
                  ? 'bg-primary text-primary-foreground'
                  : otherUser?.role === 'creator'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                {isOwnMessage ? (
                  <User className="h-4 w-4" />
                ) : otherUser?.role === 'creator' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg px-4 py-2 ${
                  isOwnMessage
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {/* Message Text */}
                  {message.content && (
                    <p className={`text-sm whitespace-pre-wrap ${
                      isOwnMessage ? 'text-primary-foreground' : ''
                    }`}>
                      {message.content}
                    </p>
                  )}

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, idx) => {
                        // Handle contract attachments
                        if (attachment.type === 'contract' || (attachment as any).contractId) {
                          const contractId = (attachment as any).contractId || attachment.url.split('/').pop()
                          return (
                            <a
                              key={idx}
                              href={attachment.url}
                              className={`flex items-center gap-2 p-3 rounded border-2 ${
                                isOwnMessage
                                  ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                                  : 'bg-white text-gray-700 border-gray-300'
                              } hover:opacity-90 transition-opacity`}
                            >
                              <FileText className="h-5 w-5" />
                              <div className="flex-1">
                                <span className="text-sm font-semibold block">
                                  {attachment.filename || attachment.name || 'NDA'}
                                </span>
                                <span className="text-xs opacity-75">Click to view and sign</span>
                              </div>
                              <Download className="h-4 w-4" />
                            </a>
                          )
                        }
                        
                        // Handle images
                        if (isImage(attachment)) {
                          return (
                            <a
                              key={idx}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Image
                                src={attachment.url}
                                alt={attachment.filename}
                                width={300}
                                height={200}
                                className="max-w-xs max-h-48 rounded cursor-pointer hover:opacity-90"
                              />
                            </a>
                          )
                        }
                        
                        // Handle other file attachments
                        return (
                          <a
                            key={idx}
                            href={attachment.url}
                            download={attachment.filename}
                            className={`flex items-center gap-2 p-2 rounded ${
                              isOwnMessage
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-white text-gray-700'
                            }`}
                          >
                            <File className="h-4 w-4" />
                            <span className="text-xs truncate">{attachment.filename}</span>
                            <Download className="h-3 w-3" />
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
