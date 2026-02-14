import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import VerificationBadge from "@/components/ui/verification-badge"
import { User, Building2, Instagram, Video, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import PostsFeed from "@/components/posts/posts-feed"

async function getProfile(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profiles/${userId}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: { userId: string }
}) {
  const data = await getProfile(params.userId)

  if (!data || !data.user) {
    notFound()
  }

  const { user, profile } = data

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Profile Image or Icon */}
                {profile?.profile_image_url ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={profile.profile_image_url}
                      alt={user.role === 'creator' ? 'Creator profile' : 'Brand profile'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className={`p-4 rounded-full ${
                    user.role === 'creator' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {user.role === 'creator' ? (
                      <User className="h-8 w-8 text-blue-600" />
                    ) : (
                      <Building2 className="h-8 w-8 text-purple-600" />
                    )}
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {user.role === 'creator' 
                      ? (profile?.instagram_handle ? `@${profile.instagram_handle}` : 'Creator Profile')
                      : (profile?.company_name || 'Brand Profile')}
                    <VerificationBadge verified={user.verified} />
                  </CardTitle>
                  <CardDescription>
                    {user.role === 'creator' 
                      ? 'Content Creator Profile' 
                      : 'Business/Brand Profile'}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {user.role === 'creator' && profile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
                {profile.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">Bio</h3>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
              </div>
            ) : user.role === 'brand' && profile ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Company Name</h3>
                  <p className="text-lg">{profile.company_name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
                {profile.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Profile not yet created</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Posts</CardTitle>
              <CardDescription>
                {user.role === 'creator' 
                  ? 'Latest updates and content'
                  : 'Company updates and announcements'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostsFeed 
                userId={user.id}
                showCreator={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

