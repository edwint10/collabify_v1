"use client"

import { Card, CardContent } from "@/components/ui/card"
import VerificationBadge from "@/components/ui/verification-badge"
import { User, Building2, Instagram, Video, DollarSign, TrendingUp } from "lucide-react"

interface SwipeCardProps {
  userId: string
  role: 'creator' | 'brand'
  profile: any
  matchScore?: number
  onSwipe?: (direction: 'left' | 'right') => void
}

export default function SwipeCard({ userId, role, profile, matchScore, onSwipe }: SwipeCardProps) {
  if (!profile) return null

  return (
    <Card className="w-full max-w-md mx-auto cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-shadow relative">
      <CardContent className="p-6">
        {/* Match Score Badge */}
        {matchScore !== undefined && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full z-10">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-xs font-semibold text-primary">{Math.round(matchScore)}%</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-6 rounded-full ${
            role === 'creator' ? 'bg-blue-100' : 'bg-purple-100'
          }`}>
            {role === 'creator' ? (
              <User className="h-12 w-12 text-blue-600" />
            ) : (
              <Building2 className="h-12 w-12 text-purple-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold">
                {role === 'brand' ? profile.company_name : `@${profile.instagram_handle || profile.tiktok_handle || 'creator'}`}
              </h3>
              <VerificationBadge verified={false} showText={false} />
            </div>
            <p className="text-sm text-gray-500">
              {role === 'creator' ? 'Content Creator' : 'Brand/Business'}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          {role === 'creator' ? (
            <>
              {(profile.instagram_handle || profile.tiktok_handle) && (
                <div className="grid grid-cols-2 gap-4">
                  {profile.instagram_handle && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <div>
                        <p className="text-xs text-gray-500">Instagram</p>
                        <p className="font-semibold">@{profile.instagram_handle}</p>
                        {profile.follower_count_ig && (
                          <p className="text-xs text-gray-400">
                            {profile.follower_count_ig.toLocaleString()} followers
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {profile.tiktok_handle && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Video className="h-5 w-5 text-black" />
                      <div>
                        <p className="text-xs text-gray-500">TikTok</p>
                        <p className="font-semibold">@{profile.tiktok_handle}</p>
                        {profile.follower_count_tiktok && (
                          <p className="text-xs text-gray-400">
                            {profile.follower_count_tiktok.toLocaleString()} followers
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {profile.bio && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Bio</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{profile.bio}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {profile.vertical && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Industry</p>
                    <p className="font-semibold capitalize">{profile.vertical}</p>
                  </div>
                )}
                {profile.ad_spend_range && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Budget</p>
                      <p className="font-semibold">{profile.ad_spend_range.replace('-', ' - ')}</p>
                    </div>
                  </div>
                )}
              </div>
              {profile.bio && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">About</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{profile.bio}</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

