"use client"

import { useState, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip } from "lucide-react"
import FileUpload from "./file-upload"
import TemplateSelector from "./template-selector"

interface MessageAttachment {
  url: string
  filename: string
  type: string
  size: number
}

interface MessageInputProps {
  conversationId: string
  senderId: string
  onSend: (content: string, attachments: MessageAttachment[]) => Promise<void>
  disabled?: boolean
  userProfile?: any
  userRole?: 'creator' | 'brand'
}

export default function MessageInput({
  conversationId,
  senderId,
  onSend,
  disabled = false,
  userProfile,
  userRole
}: MessageInputProps) {
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if ((!content.trim() && attachments.length === 0) || isSending || disabled) {
      return
    }

    setIsSending(true)
    try {
      await onSend(content.trim(), attachments)
      setContent("")
      setAttachments([])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = (newAttachments: MessageAttachment[]) => {
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleTemplateSelect = (templateContent: string) => {
    setContent(templateContent)
  }

  return (
    <div className="border-t bg-white p-4">
      {/* Template Selector */}
      <div className="mb-2">
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          userProfile={userProfile}
          userRole={userRole}
        />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((attachment, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1 text-sm"
            >
              <span className="truncate max-w-[200px]">{attachment.filename}</span>
              <button
                onClick={() => removeAttachment(idx)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <FileUpload
          conversationId={conversationId}
          onUpload={handleFileUpload}
          disabled={isSending || disabled}
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[60px] max-h-[120px] resize-none"
          disabled={isSending || disabled}
        />
        <Button
          onClick={handleSend}
          disabled={(!content.trim() && attachments.length === 0) || isSending || disabled}
          size="icon"
        >
          {isSending ? (
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}

