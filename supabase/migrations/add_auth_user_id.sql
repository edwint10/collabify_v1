-- Add auth_user_id column to users table to link with Supabase Auth
-- This migration adds the column and makes it unique

-- Add the column (nullable for existing users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique index on auth_user_id
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_user_id_unique ON users(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.auth_user_id IS 'Links to Supabase Auth users table';


