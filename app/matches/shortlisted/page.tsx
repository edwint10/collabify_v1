"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import VerificationBadge from "@/components/ui/verification-badge"
import { User, Building2, Heart, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ShortlistedMatch {
  id: string
  creator_id: string
  brand_id: string
  match_score: number
  status: string
  user: any
  profile: any
}

export default function ShortlistedMatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<ShortlistedMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    const storedRole = localStorage.getItem("userRole") as 'creator' | 'brand' | null

    if (!storedUserId || !storedRole) {
      router.push("/")
      return
    }

    setUserId(storedUserId)
    setUserRole(storedRole)
  }, [router])

  useEffect(() => {
    if (!userId || !userRole) return

    fetchShortlistedMatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userRole])

  const fetchShortlistedMatches = async () => {
    if (!userId || !userRole) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/matches/shortlisted?userId=${userId}&role=${userRole}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch shortlisted matches')
      }

      const data = await response.json()
      setMatches(data.matches || [])
    } catch (err: any) {
      console.error('Error fetching shortlisted matches:', err)
      setError(err.message || 'Failed to load shortlisted matches')
    } finally {
      setLoading(false)
    }
  }

  if (!userId || !userRole) {
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-gray-600">Loading shortlisted matches...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Shortlisted Matches
            </h1>
            <p className="text-lg text-gray-600">
              Your potential collaborators
            </p>
          </div>
          <Link href="/matches">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Matches
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        {matches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">No shortlisted matches yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Start swiping to find matches!
              </p>
              <Link href="/matches">
                <Button>Discover Matches</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const oppositeUser = match.user
              const oppositeProfile = match.profile
              const oppositeRole = userRole === 'creator' ? 'brand' : 'creator'

              return (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${
                          oppositeRole === 'creator' ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                          {oppositeRole === 'creator' ? (
                            <User className="h-6 w-6 text-blue-600" />
                          ) : (
                            <Building2 className="h-6 w-6 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {oppositeRole === 'brand' 
                              ? oppositeProfile?.company_name || 'Brand'
                              : `@${oppositeProfile?.instagram_handle || oppositeProfile?.tiktok_handle || 'creator'}`
                            }
                            {oppositeUser?.verified && (
                              <VerificationBadge verified={true} />
                            )}
                          </CardTitle>
                          <CardDescription>
                            Match Score: {match.match_score}%
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {oppositeRole === 'brand' && oppositeProfile?.vertical && (
                        <div>
                          <p className="text-xs text-gray-500">Industry</p>
                          <p className="text-sm font-medium capitalize">{oppositeProfile.vertical}</p>
                        </div>
                      )}
                      {oppositeRole === 'creator' && (
                        <div>
                          <p className="text-xs text-gray-500">Total Reach</p>
                          <p className="text-sm font-medium">
                            {((oppositeProfile?.follower_count_ig || 0) + (oppositeProfile?.follower_count_tiktok || 0)).toLocaleString()} followers
                          </p>
                        </div>
                      )}
                      {oppositeProfile?.bio && (
                        <div>
                          <p className="text-xs text-gray-500 line-clamp-2">{oppositeProfile.bio}</p>
                        </div>
                      )}
                      <Link href={`/user/${oppositeUser.id}`}>
                        <Button variant="outline" className="w-full mt-4">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

