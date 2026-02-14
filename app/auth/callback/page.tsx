"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from '@/utils/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL
        const code = searchParams.get('code')
        
        if (code) {
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Error exchanging code:', error)
            router.push('/login?error=auth_failed')
            return
          }

          if (data.user) {
            // Get user profile from database
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('id, role')
              .eq('auth_user_id', data.user.id)
              .single()

            if (userError || !userData) {
              // User doesn't have a profile yet, redirect to role selection
              router.push('/')
              return
            }

            // Store user ID and role in localStorage
            if (typeof window !== "undefined") {
              localStorage.setItem("userRole", userData.role)
              localStorage.setItem("userId", userData.id)
            }

            // Redirect to dashboard
            router.push('/dashboard')
          }
        } else {
          router.push('/login?error=no_code')
        }
      } catch (err) {
        console.error('Error in callback:', err)
        router.push('/login?error=auth_failed')
      }
    }

    handleCallback()
  }, [router, searchParams, supabase])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <p className="text-lg text-gray-600">Completing sign in...</p>
      </div>
    </main>
  )
}


