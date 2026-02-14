import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { verifyUserAuth } from '@/lib/utils/auth'

export async function POST(request: NextRequest) {
  try {
    // Use admin client with service role key to bypass RLS for server-side uploads
    const supabase = createAdminClient()

    const formData = await request.formData()
    const file = formData.get('image') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Image and user ID are required' },
        { status: 400 }
      )
    }

    // Verify authentication - user can only upload their own profile image
    await verifyUserAuth(request, userId)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)

    return NextResponse.json(
      { imageUrl: publicUrl, filePath },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in upload image API:', error)
    
    // Return 401 for authentication errors
    if (error.message.includes('Authentication required') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid user')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}

