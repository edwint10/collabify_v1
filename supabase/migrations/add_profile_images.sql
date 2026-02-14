-- Migration: Add profile_image_url to creator_profiles and brand_profiles
-- Run this in your Supabase SQL editor

-- Add profile_image_url to creator_profiles
ALTER TABLE creator_profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add profile_image_url to brand_profiles
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create storage bucket for profile images
-- Note: This creates the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the profile-images bucket
-- These policies allow public access for MVP
-- Note: Server-side uploads use service role key which bypasses RLS

-- Policy: Allow public to upload images
CREATE POLICY IF NOT EXISTS "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'profile-images');

-- Policy: Allow public to read images
CREATE POLICY IF NOT EXISTS "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Policy: Allow public to update images
CREATE POLICY IF NOT EXISTS "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'profile-images')
WITH CHECK (bucket_id = 'profile-images');

-- Policy: Allow public to delete images
CREATE POLICY IF NOT EXISTS "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'profile-images');

-- Note: Server-side API routes use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
-- For production with authentication, you can restrict policies to:
-- - Only allow users to upload/update/delete files in their own user_id folder
-- Example: USING (auth.uid()::text = (storage.foldername(name))[1])

