import { createClient } from '@/utils/supabase/client'

export interface FileUploadResult {
  url: string
  filename: string
  type: string
  size: number
}

export async function uploadFile(
  file: File,
  conversationId: string
): Promise<FileUploadResult> {
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `message-attachments/${fileName}`

  // Upload file
  const { data, error } = await supabase.storage
    .from('message-attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading file:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('message-attachments')
    .getPublicUrl(filePath)

  return {
    url: publicUrl,
    filename: file.name,
    type: file.type,
    size: file.size
  }
}

export async function getFileUrl(filePath: string): Promise<string> {
  const supabase = createClient()

  const { data } = supabase.storage
    .from('message-attachments')
    .getPublicUrl(filePath)

  return data.publicUrl
}


