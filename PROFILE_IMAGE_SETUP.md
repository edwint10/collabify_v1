# Profile Image Upload Setup

## Quick Fix for RLS Error

The image upload now uses the Supabase **Service Role Key** to bypass RLS for server-side operations. This is the recommended approach for secure server-side file uploads.

## Setup Steps

### 1. Get Your Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Find the **service_role** key (NOT the anon key)
4. Copy this key - it starts with `eyJ...` but is different from the anon key

### 2. Add to Environment Variables

Add the service role key to your `.env.local` file:

```bash
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key)

# Add this new variable (DO NOT prefix with NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key)
```

**⚠️ IMPORTANT:** 
- Never expose the service role key to the client
- Never add `NEXT_PUBLIC_` prefix to `SUPABASE_SERVICE_ROLE_KEY`
- Keep this key secret and only use in server-side code

### 3. Run the Migration

Run the migration in Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the contents of `supabase/migrations/add_profile_images.sql`
3. Paste and click **Run**

This will:
- Add `profile_image_url` columns to profile tables
- Create the `profile-images` storage bucket
- Set up RLS policies (though server-side uses service role which bypasses RLS)

### 4. Restart Your Dev Server

```bash
npm run dev
```

## How It Works

- **Client-side**: Uses anon key (subject to RLS)
- **Server-side API routes**: Uses service role key (bypasses RLS)
- This is the secure way to handle file uploads from server-side code

## Troubleshooting

### Still getting RLS errors?

1. **Check environment variable**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is set (without `NEXT_PUBLIC_` prefix)
2. **Restart dev server**: Environment variables are loaded at startup
3. **Verify bucket exists**: Check Supabase Dashboard → Storage → Buckets
4. **Check service role key**: Make sure you copied the `service_role` key, not the `anon` key

### Bucket doesn't exist?

The migration should create it, but if it doesn't:
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `profile-images`
4. Public: ✅ Enabled
5. File size limit: 5MB
6. Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

