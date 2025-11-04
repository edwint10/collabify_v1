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
  
  if (error) {
    console.error('Error creating user:', error)
    throw new Error(`Failed to create user: ${error.message}`)
  }
  
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
  
  if (error) {
    console.error('Error fetching user:', error)
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
  
  return data
}

export async function updateUserVerification(userId: string, verified: boolean) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('users')
    .update({ verified })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user verification:', error)
    throw new Error(`Failed to update verification: ${error.message}`)
  }
  
  return data
}

