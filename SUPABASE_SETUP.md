# Supabase Database Setup Guide

## Step-by-Step Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: collabify (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - Click "Create new project"
5. Wait 2-3 minutes for project to initialize

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### 3. Update Your Environment Variables

1. In your project root, create or edit `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Replace `xxxxx` with your actual project URL and key

### 4. Run the SQL Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire SQL from `supabase/schema.sql` (see below)
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Quick Copy SQL Query

Here's the complete SQL to paste into Supabase SQL Editor:

```sql
-- Collabify Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simplified - no auth required)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('creator', 'brand')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator profiles table
CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  follower_count_ig INTEGER DEFAULT 0,
  follower_count_tiktok INTEGER DEFAULT 0,
  bio TEXT,
  portfolio_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Brand profiles table
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  vertical TEXT,
  ad_spend_range TEXT,
  bio TEXT,
  previous_campaigns JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_score DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected', 'matched')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(creator_id, brand_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  deliverables JSONB DEFAULT '[]'::jsonb,
  kpis JSONB DEFAULT '[]'::jsonb,
  budget DECIMAL(10,2),
  timeline TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('nda', 'contract')),
  template_id UUID,
  version INTEGER DEFAULT 1,
  content TEXT NOT NULL,
  signed_by_creator BOOLEAN DEFAULT FALSE,
  signed_by_brand BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Escrows table
CREATE TABLE IF NOT EXISTS escrows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'in_escrow', 'released', 'refunded')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_creator_id ON matches(creator_id);
CREATE INDEX IF NOT EXISTS idx_matches_brand_id ON matches(brand_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_escrows_campaign_id ON escrows(campaign_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON creator_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON brand_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON escrows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 5. Set Up Row Level Security (RLS) - Optional for MVP

Since we're not using authentication, you can either:

**Option A: Disable RLS (Simplest for MVP)**
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE escrows DISABLE ROW LEVEL SECURITY;
```

**Option B: Enable RLS with public access (Recommended for production later)**
```sql
-- Enable RLS but allow public access for MVP
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON users FOR UPDATE USING (true);

-- Repeat for other tables...
```

For MVP, **Option A is fine** since you're not using authentication yet.

## 6. Verify Tables Were Created

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `users`
   - `creator_profiles`
   - `brand_profiles`
   - `matches`
   - `conversations`
   - `messages`
   - `campaigns`
   - `contracts`
   - `escrows`

## 7. Test Your Connection

1. Restart your dev server:
```bash
npm run dev
```

2. Navigate to your app and try creating a profile
3. Check Supabase **Table Editor** to see if data was inserted

## Troubleshooting

### "extension uuid-ossp does not exist"
- This is usually already enabled in Supabase
- If you get this error, skip that line or run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` separately

### "permission denied"
- Make sure you're using the **anon public key** in your `.env.local`
- Check that RLS is disabled (see Option A above)

### Tables not showing up
- Refresh the Supabase dashboard
- Check the SQL Editor for any error messages
- Make sure you clicked "Run" after pasting the SQL

## Next Steps

After setting up the database:
1. ✅ Update profile forms to save to Supabase instead of localStorage
2. ✅ Create API routes to handle database operations
3. ✅ Test creating users and profiles
4. ✅ Implement matching algorithm (Sprint 3)

---

**Need Help?** Check the `supabase/schema.sql` file in your project for the full schema.


