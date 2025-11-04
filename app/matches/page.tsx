"use client"

import { useEffect, useState, Suspense, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SwipeContainer from "@/components/matching/swipe-container"
import Filters from "@/components/matching/filters"
import { Loader2, Heart } from "lucide-react"
import Link from "next/link"

interface Match {
  userId: string
  role: 'creator' | 'brand'
  profile: any
  matchScore: number
}

function MatchesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false) // Start as false, set to true when actually fetching
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const isFetchingRef = useRef(false)
  const lastSearchParamsRef = useRef<string>('')
  const hasInitialFetchRef = useRef(false)

  useEffect(() => {
    // Get userId and role from localStorage
    const storedUserId = localStorage.getItem("userId")
    const storedRole = localStorage.getItem("userRole") as 'creator' | 'brand' | null

    if (!storedUserId || !storedRole) {
      router.push("/")
      return
    }

    setUserId(storedUserId)
    setUserRole(storedRole)
  }, [router])

  const offsetRef = useRef(0)
  offsetRef.current = offset
  
  // Convert searchParams to string for stable dependency
  const searchParamsString = searchParams.toString()

  const fetchMatches = useCallback(async (loadMore = false) => {
    if (!userId || !userRole || isFetchingRef.current) {
      return
    }

    isFetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      // Build query parameters
      const params = new URLSearchParams({
        userId,
        role: userRole,
        limit: '20',
        offset: loadMore ? offsetRef.current.toString() : '0',
      })

      // Add filter parameters from URL
      const minReach = searchParams.get('minReach')
      const maxReach = searchParams.get('maxReach')
      const vertical = searchParams.get('vertical')
      const verified = searchParams.get('verified')
      const adSpendRange = searchParams.get('adSpendRange')
      const search = searchParams.get('search')

      if (minReach) params.set('minReach', minReach)
      if (maxReach) params.set('maxReach', maxReach)
      if (vertical) params.set('vertical', vertical)
      if (verified) params.set('verified', verified)
      if (adSpendRange) params.set('adSpendRange', adSpendRange)
      if (search) params.set('search', search)

      const response = await fetch(`/api/matches?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data = await response.json()
      
      if (loadMore) {
        setMatches(prev => [...prev, ...(data.matches || [])])
      } else {
        setMatches(data.matches || [])
        setOffset(0)
        offsetRef.current = 0
      }

      const newOffset = (data.offset || 0) + (data.matches?.length || 0)
      setOffset(newOffset)
      offsetRef.current = newOffset
      setHasMore((data.matches?.length || 0) === 20 && newOffset < (data.total || 0))
    } catch (err: any) {
      console.error('Error fetching matches:', err)
      setError(err.message || 'Failed to load matches')
      setMatches([]) // Clear matches on error
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [userId, userRole, searchParams])

  useEffect(() => {
    if (!userId || !userRole) return

    // Always allow initial fetch
    if (!hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true
      lastSearchParamsRef.current = searchParamsString
      fetchMatches(false)
      return
    }

    // Check if searchParams actually changed
    if (searchParamsString === lastSearchParamsRef.current) return

    lastSearchParamsRef.current = searchParamsString
    fetchMatches(false)
  }, [userId, userRole, searchParamsString, fetchMatches])

  const handleSwipe = useCallback(async (swipedUserId: string, direction: 'left' | 'right') => {
    if (!userId || !userRole) return

    try {
      const status = direction === 'right' ? 'shortlisted' : 'rejected'
      
      // Determine creator and brand IDs
      const creatorId = userRole === 'creator' ? userId : swipedUserId
      const brandId = userRole === 'creator' ? swipedUserId : userId

      // Create or update match
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId,
          brandId,
          status,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save match')
      }

      // Remove swiped match from list
      setMatches(prev => prev.filter(m => m.userId !== swipedUserId))
    } catch (err: any) {
      console.error('Error saving swipe:', err)
      throw err
    }
  }, [userId, userRole])

  const handleFiltersChange = useCallback(() => {
    // Filters change will update URL, which triggers the useEffect above
    // No need to call fetchMatches here
  }, [])

  const handleLoadMore = useCallback(() => {
    fetchMatches(true)
  }, [fetchMatches])

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

  if (loading && matches.length === 0 && !error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-gray-600">Loading matches...</p>
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
            Discover Matches
          </h1>
          <p className="text-lg text-gray-600">
            Swipe right to shortlist, left to skip
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Filters role={userRole} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Swipe Container */}
          <div className="lg:col-span-3">
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-600">Loading matches...</p>
                </CardContent>
              </Card>
            ) : matches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">No matches found</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Try adjusting your filters or check back later
                  </p>
                  <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <SwipeContainer
                matches={matches}
                currentUserId={userId}
                currentUserRole={userRole}
                onSwipe={handleSwipe}
                onLoadMore={hasMore ? handleLoadMore : undefined}
              />
            )}
          </div>
        </div>

        {/* Shortlisted Matches Link */}
        <div className="mt-8 text-center">
          <Link href="/matches/shortlisted">
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <Heart className="h-4 w-4" />
              View Shortlisted Matches
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function MatchesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-gray-600">Loading matches...</p>
          </div>
        </div>
      </main>
    }>
      <MatchesPageContent />
    </Suspense>
  )
}

