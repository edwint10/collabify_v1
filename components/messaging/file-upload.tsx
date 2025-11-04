"use client"

import { useState, useRef, DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X, Image, File } from "lucide-react"
import { uploadFile, FileUploadResult } from "@/lib/api/storage"

interface FileUploadProps {
  conversationId: string
  onUpload: (attachments: FileUploadResult[]) => void
  disabled?: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export default function FileUpload({
  conversationId,
  onUpload,
  disabled = false
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} is too large. Maximum size is 10MB.`
    }

    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES]
    if (!allowedTypes.includes(file.type)) {
      return `File ${file.name} has an unsupported type.`
    }

    return null
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }

    if (validFiles.length === 0) return

    setIsUploading(true)
    try {
      const uploadResults = await Promise.all(
        validFiles.map(async (file) => {
          try {
            const result = await uploadFile(file, conversationId)
            return result
          } catch (error: any) {
            console.error(`Error uploading ${file.name}:`, error)
            throw error
          }
        })
      )

      onUpload(uploadResults)
    } catch (error: any) {
      console.error('Error uploading files:', error)
      alert(`Failed to upload files: ${error.message}`)
    } finally {
      setIsUploading(false)
      setUploadProgress({})
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES].join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        title="Attach file"
      >
        {isUploading ? (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}


