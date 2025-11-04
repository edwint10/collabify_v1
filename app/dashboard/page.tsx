"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import VerificationBadge from "@/components/ui/verification-badge"
import { User, Building2, Edit, Instagram, Video, DollarSign } from "lucide-react"
import Link from "next/link"

interface ProfileData {
  user: {
    id: string
    role: 'creator' | 'brand'
    verified: boolean
  }
  profile: any
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      // Check if user has completed profile
      const userId = localStorage.getItem("userId")
      const userRole = localStorage.getItem("userRole")
      
      if (!userId || !userRole) {
        router.push("/")
        return
      }

      try {
        const response = await fetch(`/api/profiles/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        const data = await response.json()
        setProfileData(data)
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !profileData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-destructive mb-4">{error || 'Profile not found'}</p>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </div>
        </div>
      </main>
    )
  }

  const { user, profile } = profileData

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to Collabify!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    user.role === 'creator' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {user.role === 'creator' ? (
                      <User className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Building2 className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {user.role === 'creator' ? 'Creator' : 'Brand'} Profile
                      <VerificationBadge verified={user.verified} />
                    </CardTitle>
                    <CardDescription>
                      {profile ? 'Profile complete' : 'Profile incomplete'}
                    </CardDescription>
                  </div>
                </div>
                {profile && (
                  <Link href={`/user/${user.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {profile ? (
                user.role === 'creator' ? (
                  <div className="space-y-4">
                    {profile.instagram_handle && (
                      <div className="flex items-center gap-3">
                        <Instagram className="h-5 w-5 text-pink-600" />
                        <div>
                          <p className="text-sm text-gray-500">Instagram</p>
                          <p className="font-medium">@{profile.instagram_handle}</p>
                          {profile.follower_count_ig && (
                            <p className="text-xs text-gray-400">
                              {profile.follower_count_ig.toLocaleString()} followers
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {profile.tiktok_handle && (
                      <div className="flex items-center gap-3">
                        <Video className="h-5 w-5 text-black" />
                        <div>
                          <p className="text-sm text-gray-500">TikTok</p>
                          <p className="font-medium">@{profile.tiktok_handle}</p>
                          {profile.follower_count_tiktok && (
                            <p className="text-xs text-gray-400">
                              {profile.follower_count_tiktok.toLocaleString()} followers
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {profile.bio && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Bio</p>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Company Name</p>
                      <p className="font-medium">{profile.company_name}</p>
                    </div>
                    {profile.vertical && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Industry Vertical</p>
                        <p className="font-medium capitalize">{profile.vertical}</p>
                      </div>
                    )}
                    {profile.ad_spend_range && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Ad Spend Range</p>
                          <p className="font-medium">{profile.ad_spend_range.replace('-', ' - ')}</p>
                        </div>
                      </div>
                    )}
                    {profile.bio && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">About</p>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Profile not yet created</p>
                  <Link href={`/profile/${user.role}`}>
                    <Button>Create Profile</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with Collabify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile ? (
                <>
                  <Link href={`/user/${user.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      View Public Profile
                    </Button>
                  </Link>
                  <Link href={`/user/${user.id}/edit`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/matches" className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Find Matches
                    </Button>
                  </Link>
                  <Link href="/messages" className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Messages
                    </Button>
                  </Link>
                  {user.role === 'brand' && (
                    <Link href="/campaigns" className="w-full">
                      <Button variant="outline" className="w-full justify-start">
                        Create Campaign
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <Link href={`/profile/${user.role}`}>
                  <Button className="w-full">Complete Your Profile</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

