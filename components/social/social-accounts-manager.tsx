"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram, Video, Youtube, Twitter, RefreshCw, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface SocialAccount {
  id: string
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'tiktok_business'
  platform_user_id: string
  username?: string
  is_active: boolean
  metadata?: any
  created_at: string
}

interface SocialAccountsManagerProps {
  userId: string
}

const platformConfig = {
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Connect your Instagram account to sync your content and metrics',
  },
  tiktok: {
    name: 'TikTok',
    icon: Video,
    color: 'bg-black',
    description: 'Connect your TikTok account to sync your videos and analytics',
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600',
    description: 'Connect your YouTube channel to sync your videos and subscribers',
  },
  twitter: {
    name: 'Twitter/X',
    icon: Twitter,
    color: 'bg-blue-400',
    description: 'Connect your Twitter account to sync your tweets and followers',
  },
  tiktok_business: {
    name: 'TikTok Business',
    icon: Video,
    color: 'bg-blue-600',
    description: 'Connect your TikTok Business account for advanced analytics',
  },
}

export default function SocialAccountsManager({ userId }: SocialAccountsManagerProps) {
  const router = useRouter()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [userId])

  const fetchAccounts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/social-accounts?userId=${userId}`, {
        headers: {
          'X-User-Id': userId,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch social accounts')
      }

      const data = await response.json()
      setAccounts(data.accounts || [])
    } catch (err: any) {
      console.error('Error fetching accounts:', err)
      setError(err.message || 'Failed to load social accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (platform: string) => {
    // Redirect to OAuth flow
    window.location.href = `/api/auth/${platform}?userId=${userId}`
  }

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return
    }

    try {
      const response = await fetch(`/api/social-accounts?userId=${userId}&accountId=${accountId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': userId,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect account')
      }

      // Refresh accounts list
      fetchAccounts()
    } catch (err: any) {
      console.error('Error disconnecting account:', err)
      setError(err.message || 'Failed to disconnect account')
    }
  }

  const handleSync = async (accountId: string) => {
    setSyncing(accountId)
    setError(null)

    try {
      const response = await fetch('/api/social-accounts/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ userId, accountId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync account')
      }

      // Refresh accounts list
      fetchAccounts()
    } catch (err: any) {
      console.error('Error syncing account:', err)
      setError(err.message || 'Failed to sync account')
    } finally {
      setSyncing(null)
    }
  }

  const getConnectedAccount = (platform: string) => {
    return accounts.find(acc => acc.platform === platform)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Accounts</CardTitle>
          <CardDescription>Connect your social media accounts to sync data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">Loading accounts...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Media Accounts</CardTitle>
          <CardDescription>Connect your social media accounts to sync data and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(platformConfig).map(([platform, config]) => {
              const Icon = config.icon
              const connectedAccount = getConnectedAccount(platform)

              return (
                <div
                  key={platform}
                  className={`border rounded-lg p-4 ${connectedAccount ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{config.name}</h3>
                        {connectedAccount && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Connected</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {connectedAccount && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(connectedAccount.id)}
                          disabled={syncing === connectedAccount.id}
                        >
                          <RefreshCw className={`h-4 w-4 ${syncing === connectedAccount.id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(connectedAccount.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{config.description}</p>

                  {connectedAccount ? (
                    <div className="space-y-2 text-sm">
                      {connectedAccount.username && (
                        <p className="text-gray-700">
                          <span className="font-medium">Username:</span> {connectedAccount.username}
                        </p>
                      )}
                      {connectedAccount.metadata && (
                        <div className="text-gray-600">
                          {connectedAccount.metadata.followers_count && (
                            <p>Followers: {connectedAccount.metadata.followers_count.toLocaleString()}</p>
                          )}
                          {connectedAccount.metadata.subscriber_count && (
                            <p>Subscribers: {connectedAccount.metadata.subscriber_count.toLocaleString()}</p>
                          )}
                        </div>
                      )}
                      {!connectedAccount.is_active && (
                        <p className="text-amber-600 text-xs">Account is inactive</p>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(platform)}
                      className="w-full"
                    >
                      Connect {config.name}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


