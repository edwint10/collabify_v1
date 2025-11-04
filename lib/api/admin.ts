import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function getAllUsers() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
  
  return data || []
}

export async function toggleUserVerification(userId: string, verified: boolean) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('users')
    .update({ verified })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error toggling user verification:', error)
    throw new Error(`Failed to toggle verification: ${error.message}`)
  }
  
  return data
}

