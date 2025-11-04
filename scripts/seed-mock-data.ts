/**
 * Script to seed mock users and profiles into Supabase
 * Run with: npx tsx scripts/seed-mock-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedMockData() {
  try {
    // Read mock data
    const mockDataPath = path.join(process.cwd(), 'mock-data', 'users.json')
    const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'))
    
    console.log(`Seeding ${mockData.users.length} users...`)

    // Insert users and profiles
    for (const userData of mockData.users) {
      const { id, role, verified, created_at, profile } = userData

      // Insert user
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id,
          role,
          verified,
          created_at,
          updated_at: created_at
        }, {
          onConflict: 'id'
        })

      if (userError) {
        console.error(`Error inserting user ${id}:`, userError)
        continue
      }

      // Insert profile
      if (role === 'creator') {
        const { error: profileError } = await supabase
          .from('creator_profiles')
          .upsert({
            user_id: id,
            instagram_handle: profile.instagram_handle,
            tiktok_handle: profile.tiktok_handle,
            follower_count_ig: profile.follower_count_ig,
            follower_count_tiktok: profile.follower_count_tiktok,
            bio: profile.bio,
            created_at,
            updated_at: created_at
          }, {
            onConflict: 'user_id'
          })

        if (profileError) {
          console.error(`Error inserting creator profile ${id}:`, profileError)
        } else {
          console.log(`✓ Created creator: ${profile.instagram_handle || profile.tiktok_handle}`)
        }
      } else {
        const { error: profileError } = await supabase
          .from('brand_profiles')
          .upsert({
            user_id: id,
            company_name: profile.company_name,
            vertical: profile.vertical,
            ad_spend_range: profile.ad_spend_range,
            bio: profile.bio,
            created_at,
            updated_at: created_at
          }, {
            onConflict: 'user_id'
          })

        if (profileError) {
          console.error(`Error inserting brand profile ${id}:`, profileError)
        } else {
          console.log(`✓ Created brand: ${profile.company_name}`)
        }
      }
    }

    console.log('\n✅ Mock data seeding completed!')
    console.log(`Total users seeded: ${mockData.users.length}`)
    console.log(`Creators: ${mockData.users.filter((u: any) => u.role === 'creator').length}`)
    console.log(`Brands: ${mockData.users.filter((u: any) => u.role === 'brand').length}`)
  } catch (error) {
    console.error('Error seeding mock data:', error)
    process.exit(1)
  }
}

seedMockData()

