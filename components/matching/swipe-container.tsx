"use client"

import { useState, useEffect } from "react"
import TinderCard from "react-tinder-card"
import SwipeCard from "./swipe-card"
import { Button } from "@/components/ui/button"
import { Heart, X, Loader2 } from "lucide-react"

interface Match {
  userId: string
  role: 'creator' | 'brand'
  profile: any
  matchScore: number
}

interface SwipeContainerProps {
  matches: Match[]
  currentUserId: string
  currentUserRole: 'creator' | 'brand'
  onSwipe: (userId: string, direction: 'left' | 'right') => Promise<void>
  onLoadMore?: () => void
}

export default function SwipeContainer({
  matches,
  currentUserId,
  currentUserRole,
  onSwipe,
  onLoadMore
}: SwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(matches.length - 1)
  const [swiped, setSwiped] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setCurrentIndex(matches.length - 1)
  }, [matches.length])

  const swipedDirection = async (direction: string, userId: string) => {
    if (swiped.includes(userId)) return

    setSwiped([...swiped, userId])
    setIsProcessing(true)

    try {
      await onSwipe(
        userId,
        direction === 'right' ? 'right' : 'left'
      )
    } catch (error) {
      console.error('Error processing swipe:', error)
    } finally {
      setIsProcessing(false)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const outOfFrame = (userId: string) => {
    // Card has been swiped out of view
  }

  const handleShortlist = async () => {
    if (currentIndex < 0 || isProcessing) return
    const currentMatch = matches[currentIndex]
    await swipedDirection('right', currentMatch.userId)
  }

  const handleReject = async () => {
    if (currentIndex < 0 || isProcessing) return
    const currentMatch = matches[currentIndex]
    await swipedDirection('left', currentMatch.userId)
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 mb-4">No more matches available</p>
        {onLoadMore && (
          <Button onClick={onLoadMore} variant="outline">
            Load More
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative h-[600px]">
        {matches.map((match, index) => (
          <TinderCard
            key={match.userId}
            className="absolute"
            onSwipe={(dir) => swipedDirection(dir, match.userId)}
            onCardLeftScreen={() => outOfFrame(match.userId)}
            preventSwipe={['up', 'down']}
          >
            <div
              className={`transform transition-all duration-300 ${
                index === currentIndex ? 'scale-100 z-10' : 'scale-95 z-0'
              } ${index < currentIndex ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <SwipeCard
                userId={match.userId}
                role={match.role}
                profile={match.profile}
                matchScore={match.matchScore}
              />
            </div>
          </TinderCard>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          onClick={handleReject}
          disabled={currentIndex < 0 || isProcessing}
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          <X className="h-6 w-6" />
        </Button>
        <Button
          onClick={handleShortlist}
          disabled={currentIndex < 0 || isProcessing}
          size="lg"
          className="rounded-full w-16 h-16"
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Heart className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Load More */}
      {currentIndex < 5 && onLoadMore && (
        <div className="mt-4 text-center">
          <Button onClick={onLoadMore} variant="outline" size="sm">
            Load More Matches
          </Button>
        </div>
      )}
    </div>
  )
}

