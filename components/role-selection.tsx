"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Building2 } from "lucide-react"
import { createClient } from '@/utils/supabase/client'

type UserRole = "creator" | "brand" | null

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRoleSelect = (role: "creator" | "brand") => {
    setSelectedRole(role)
    setError(null)
    setShowAuth(true)
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole || !email || !password) return

    setIsCreating(true)
    setError(null)

    try {
      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) {
        // Handle rate limiting
        if (authError.message.includes('rate limit') || authError.status === 429) {
          throw new Error('Too many signup attempts. Please wait a minute and try again.')
        }
        // Handle existing user
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.')
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create authentication account')
      }

      // Step 2: Create user record in database linked to auth user
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          role: selectedRole,
          authUserId: authData.user.id 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      const { user } = await response.json()

      // Store user ID and role in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userRole", selectedRole)
        localStorage.setItem("userId", user.id)
      }

      // Navigate to profile creation based on role
      router.push(`/profile/${selectedRole}`)
    } catch (err: any) {
      console.error('Error creating user:', err)
      
      // Provide user-friendly error messages
      let errorMessage = err.message || 'Failed to create account. Please try again.'
      
      if (err.message.includes('rate limit') || err.message.includes('429')) {
        errorMessage = 'Too many signup attempts. Please wait a minute and try again.'
      } else if (err.message.includes('already registered') || err.message.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.message.includes('Invalid') || err.message.includes('Password')) {
        errorMessage = 'Invalid email or password. Please check your input.'
      }
      
      setError(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Choose Your Role</CardTitle>
        <CardDescription className="text-base">
          {showAuth ? 'Create your account to get started' : 'Select how you want to use Hyperbrandz'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showAuth ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleRoleSelect("creator")}
                className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedRole === "creator"
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full ${
                    selectedRole === "creator" ? "bg-primary/10" : "bg-gray-100"
                  }`}>
                    <User className={`h-12 w-12 ${
                      selectedRole === "creator" ? "text-primary" : "text-gray-600"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Content Creator</h3>
                    <p className="text-sm text-gray-600">
                      I create content and want to collaborate with brands
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("brand")}
                className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedRole === "brand"
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full ${
                    selectedRole === "brand" ? "bg-primary/10" : "bg-gray-100"
                  }`}>
                    <Building2 className={`h-12 w-12 ${
                      selectedRole === "brand" ? "text-primary" : "text-gray-600"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Business / Brand</h3>
                    <p className="text-sm text-gray-600">
                      I represent a brand and want to find creators
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Already have an account?{" "}
                <button
                  onClick={() => router.push('/login')}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        ) : (
          <form onSubmit={handleContinue} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isCreating}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAuth(false)
                  setError(null)
                  setEmail("")
                  setPassword("")
                }}
                disabled={isCreating}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!selectedRole || !email || !password || isCreating}
                className="flex-1"
              >
                {isCreating ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}


