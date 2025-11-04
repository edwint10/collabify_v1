# Quick Start - Begin Implementation

## 🚀 Start Here: Immediate Actions

### Step 1: Set Up Supabase (30 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up/Log in
   - Click "New Project"
   - Name: "collabify"
   - Set password and region
   - Wait 2-3 minutes for setup

2. **Run SQL Schema**
   - In Supabase dashboard → SQL Editor
   - Copy entire SQL from `supabase/schema.sql`
   - Paste and click "Run"
   - Verify tables created (Table Editor)

3. **Get Credentials**
   - Settings → API
   - Copy Project URL and anon public key

4. **Update Environment**
   ```bash
   # Edit .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

---

### Step 2: Create API Utilities (1 hour)

Create these files:

#### `lib/api/users.ts`
```typescript
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function createUser(role: 'creator' | 'brand') {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ role }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUser(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}
```

#### `lib/api/profiles.ts`
```typescript
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function createCreatorProfile(userId: string, profileData: {
  instagram_handle?: string
  tiktok_handle?: string
  follower_count_ig?: number
  follower_count_tiktok?: number
  bio?: string
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('creator_profiles')
    .insert([{ user_id: userId, ...profileData }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createBrandProfile(userId: string, profileData: {
  company_name: string
  vertical?: string
  ad_spend_range?: string
  bio?: string
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('brand_profiles')
    .insert([{ user_id: userId, ...profileData }])
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

---

### Step 3: Update Profile Forms (2 hours)

Update `components/profile/creator-profile-form.tsx`:

```typescript
// Add at top
import { createCreatorProfile } from '@/lib/api/profiles'

// In onSubmit function, replace localStorage with:
const userId = localStorage.getItem('userId') // Get from role selection
if (!userId) {
  alert('Please select a role first')
  return
}

try {
  const profile = await createCreatorProfile(userId, {
    instagram_handle: data.instagramHandle,
    tiktok_handle: data.tiktokHandle,
    follower_count_ig: parseInt(data.followerCountIG || '0'),
    follower_count_tiktok: parseInt(data.followerCountTiktok || '0'),
    bio: data.bio
  })
  
  // Success! Redirect to dashboard
  router.push('/dashboard')
} catch (error) {
  console.error('Error saving profile:', error)
  alert('Failed to save profile. Please try again.')
}
```

Do the same for `brand-profile-form.tsx`.

---

### Step 4: Update Role Selection (30 minutes)

Update `components/role-selection.tsx`:

```typescript
// Add import
import { createUser } from '@/lib/api/users'

// In handleRoleSelect, add:
const handleRoleSelect = async (role: "creator" | "brand") => {
  try {
    // Create user in database
    const user = await createUser(role)
    
    // Store user ID
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", role)
      localStorage.setItem("userId", user.id)
    }
    
    setSelectedRole(role)
  } catch (error) {
    console.error('Error creating user:', error)
    alert('Failed to create account. Please try again.')
  }
}
```

---

### Step 5: Test Everything (30 minutes)

1. **Test Role Selection**
   - Select Creator or Brand
   - Verify user created in Supabase Table Editor

2. **Test Profile Creation**
   - Fill out profile form
   - Submit
   - Verify profile saved in Supabase

3. **Check Database**
   - Go to Supabase Table Editor
   - Verify `users` table has record
   - Verify `creator_profiles` or `brand_profiles` has record

---

## 📋 Next Steps After Sprint 2

Once Supabase integration works:

1. **Build A4 - Verification Badge** (2 hours)
   - Create badge component
   - Add admin interface

2. **Build B1 - Swipe UI** (1 day)
   - Install react-tinder-card
   - Create swipe component
   - Create matches page

3. **Build B2 - Matching Algorithm** (1 day)
   - Create matching service
   - Create API endpoint
   - Test matching logic

---

## 🎯 Daily Checklist

### Today
- [ ] Set up Supabase
- [ ] Run SQL schema
- [ ] Create API utilities
- [ ] Update profile forms
- [ ] Test user/profile creation

### This Week
- [ ] Complete Sprint 2 (Supabase Integration)
- [ ] Build A4 (Verification Badge)
- [ ] Start Sprint 3 (Matching Engine)

### This Month
- [ ] Complete Sprint 3 (Matching)
- [ ] Complete Sprint 4 (Messaging)
- [ ] Start Sprint 5 (Campaigns)

---

## 🐛 Troubleshooting

### "Failed to create user"
- Check Supabase credentials in `.env.local`
- Verify SQL schema ran successfully
- Check browser console for errors

### "Table doesn't exist"
- Run SQL schema again in Supabase
- Check table names match exactly

### "CORS error"
- Check Supabase URL is correct
- Verify anon key is correct
- Check Supabase project settings

---

## 📚 Resources

- **Full Implementation Plan**: `IMPLEMENTATION_PLAN.md`
- **Progress Tracking**: `PROGRESS.md`
- **Database Schema**: `supabase/schema.sql`
- **Supabase Setup**: `SUPABASE_SETUP.md`

---

**Ready to start?** Begin with Step 1 above! 🚀

