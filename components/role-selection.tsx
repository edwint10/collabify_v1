"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Building2 } from "lucide-react"

type UserRole = "creator" | "brand" | null

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRoleSelect = (role: "creator" | "brand") => {
    setSelectedRole(role)
    setError(null)
  }

  const handleContinue = async () => {
    if (!selectedRole) return

    setIsCreating(true)
    setError(null)

    try {
      // Create user in database
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
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
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Choose Your Role</CardTitle>
        <CardDescription className="text-base">
          Select how you want to use Collabify
        </CardDescription>
      </CardHeader>
      <CardContent>
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

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isCreating}
            size="lg"
            className="w-full md:w-auto min-w-[200px]"
          >
            {isCreating ? "Creating Account..." : "Continue"}
          </Button>
        </div>

        {error && (
          <p className="text-center text-sm text-destructive mt-4">
            {error}
          </p>
        )}

        {selectedRole && !error && (
          <p className="text-center text-sm text-gray-500 mt-4">
            You can switch your role later if needed
          </p>
        )}
      </CardContent>
    </Card>
  )
}


