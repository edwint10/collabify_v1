import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function createUser(role: 'creator' | 'brand', authUserId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  // Check if user already exists with this auth_user_id
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()

  if (existingUser) {
    throw new Error('User already exists with this email')
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ role, auth_user_id: authUserId }])
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

