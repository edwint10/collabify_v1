"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import VerificationBadge from "@/components/ui/verification-badge"
import { User, Building2 } from "lucide-react"

interface User {
  id: string
  role: 'creator' | 'brand'
  verified: boolean
  created_at: string
}

export default function AdminVerifyPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const { users: fetchedUsers } = await response.json()
      setUsers(fetchedUsers)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerification = async (userId: string, currentVerified: boolean) => {
    setUpdating(userId)
    try {
      const response = await fetch('/api/admin/users/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          verified: !currentVerified,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update verification')
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, verified: !currentVerified }
          : user
      ))
    } catch (err: any) {
      console.error('Error toggling verification:', err)
      alert(err.message || 'Failed to update verification')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading users...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            User Verification
          </h1>
          <p className="text-lg text-gray-600">
            Manage user verification status
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Click the button to toggle verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No users found
                </p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        user.role === 'creator' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {user.role === 'creator' ? (
                          <User className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Building2 className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {user.role === 'creator' ? 'Creator' : 'Brand'}
                          </span>
                          <VerificationBadge verified={user.verified} />
                        </div>
                        <p className="text-sm text-gray-500">
                          ID: {user.id.substring(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleToggleVerification(user.id, user.verified)}
                      disabled={updating === user.id}
                      variant={user.verified ? "destructive" : "default"}
                      size="sm"
                    >
                      {updating === user.id 
                        ? "Updating..." 
                        : user.verified 
                        ? "Remove Verification" 
                        : "Verify User"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

