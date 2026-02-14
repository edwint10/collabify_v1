"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, X } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

interface MatchFilters {
  minReach?: number
  maxReach?: number
  vertical?: string
  verified?: boolean
  adSpendRange?: string
  search?: string
  // New filters for brands viewing creators
  platform?: string
  minFollowersIg?: number
  maxFollowersIg?: number
  minFollowersTiktok?: number
  maxFollowersTiktok?: number
  hasPortfolio?: boolean
  // New filters for creators viewing brands
  hasPreviousCampaigns?: boolean
}

interface FiltersProps {
  role: 'creator' | 'brand'
  onFiltersChange: (filters: MatchFilters) => void
}

function FiltersContent({ role, onFiltersChange }: FiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<MatchFilters>({
    minReach: searchParams.get('minReach') ? parseInt(searchParams.get('minReach')!) : undefined,
    maxReach: searchParams.get('maxReach') ? parseInt(searchParams.get('maxReach')!) : undefined,
    vertical: searchParams.get('vertical') || undefined,
    verified: searchParams.get('verified') === 'true',
    adSpendRange: searchParams.get('adSpendRange') || undefined,
    search: searchParams.get('search') || undefined,
    platform: searchParams.get('platform') || undefined,
    minFollowersIg: searchParams.get('minFollowersIg') ? parseInt(searchParams.get('minFollowersIg')!) : undefined,
    maxFollowersIg: searchParams.get('maxFollowersIg') ? parseInt(searchParams.get('maxFollowersIg')!) : undefined,
    minFollowersTiktok: searchParams.get('minFollowersTiktok') ? parseInt(searchParams.get('minFollowersTiktok')!) : undefined,
    maxFollowersTiktok: searchParams.get('maxFollowersTiktok') ? parseInt(searchParams.get('maxFollowersTiktok')!) : undefined,
    hasPortfolio: searchParams.get('hasPortfolio') === 'true',
    hasPreviousCampaigns: searchParams.get('hasPreviousCampaigns') === 'true',
  })

  // Remove the useEffect that calls onFiltersChange on every filter change
  // The URL update will trigger the parent component to refetch

  const updateFilters = (newFilters: Partial<MatchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)

    // Update URL parameters
    const params = new URLSearchParams()
    if (updated.minReach) params.set('minReach', updated.minReach.toString())
    if (updated.maxReach) params.set('maxReach', updated.maxReach.toString())
    if (updated.vertical) params.set('vertical', updated.vertical)
    if (updated.verified) params.set('verified', 'true')
    if (updated.adSpendRange) params.set('adSpendRange', updated.adSpendRange)
    if (updated.search) params.set('search', updated.search)
    if (updated.platform) params.set('platform', updated.platform)
    if (updated.minFollowersIg) params.set('minFollowersIg', updated.minFollowersIg.toString())
    if (updated.maxFollowersIg) params.set('maxFollowersIg', updated.maxFollowersIg.toString())
    if (updated.minFollowersTiktok) params.set('minFollowersTiktok', updated.minFollowersTiktok.toString())
    if (updated.maxFollowersTiktok) params.set('maxFollowersTiktok', updated.maxFollowersTiktok.toString())
    if (updated.hasPortfolio) params.set('hasPortfolio', 'true')
    if (updated.hasPreviousCampaigns) params.set('hasPreviousCampaigns', 'true')

    router.push(`?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setFilters({})
    router.push('?', { scroll: false })
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Matches</CardTitle>
            <CardDescription>Narrow down your search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder={role === 'creator' ? "Search by company name..." : "Search by handle or bio..."}
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value || undefined })}
              />
            </div>

            {/* Reach Filters (for creators viewing brands) */}
            {role === 'creator' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minReach">Min Reach</Label>
                  <Input
                    id="minReach"
                    type="number"
                    placeholder="0"
                    value={filters.minReach || ''}
                    onChange={(e) => updateFilters({ minReach: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxReach">Max Reach</Label>
                  <Input
                    id="maxReach"
                    type="number"
                    placeholder="1000000"
                    value={filters.maxReach || ''}
                    onChange={(e) => updateFilters({ maxReach: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
            )}

            {/* Vertical Filter */}
            {role === 'creator' && (
              <div className="space-y-2">
                <Label htmlFor="vertical">Industry Vertical</Label>
                <Select
                  value={filters.vertical || 'all'}
                  onValueChange={(value) => updateFilters({ vertical: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger id="vertical">
                    <SelectValue placeholder="All verticals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All verticals</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="fitness">Fitness & Health</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Ad Spend Range Filter (for creators viewing brands) */}
            {role === 'creator' && (
              <div className="space-y-2">
                <Label htmlFor="adSpendRange">Ad Spend Range</Label>
                <Select
                  value={filters.adSpendRange || 'all'}
                  onValueChange={(value) => updateFilters({ adSpendRange: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger id="adSpendRange">
                    <SelectValue placeholder="All ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ranges</SelectItem>
                    <SelectItem value="under-1k">Under $1,000</SelectItem>
                    <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="over-100k">Over $100,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Platform Filter (for brands viewing creators) */}
            {role === 'brand' && (
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={filters.platform || 'all'}
                  onValueChange={(value) => updateFilters({ platform: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All platforms</SelectItem>
                    <SelectItem value="instagram">Instagram only</SelectItem>
                    <SelectItem value="tiktok">TikTok only</SelectItem>
                    <SelectItem value="both">Both platforms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Instagram Followers Filters (for brands viewing creators) */}
            {role === 'brand' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minFollowersIg">Min Instagram Followers</Label>
                  <Input
                    id="minFollowersIg"
                    type="number"
                    placeholder="0"
                    value={filters.minFollowersIg || ''}
                    onChange={(e) => updateFilters({ minFollowersIg: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFollowersIg">Max Instagram Followers</Label>
                  <Input
                    id="maxFollowersIg"
                    type="number"
                    placeholder="10000000"
                    value={filters.maxFollowersIg || ''}
                    onChange={(e) => updateFilters({ maxFollowersIg: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
            )}

            {/* TikTok Followers Filters (for brands viewing creators) */}
            {role === 'brand' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minFollowersTiktok">Min TikTok Followers</Label>
                  <Input
                    id="minFollowersTiktok"
                    type="number"
                    placeholder="0"
                    value={filters.minFollowersTiktok || ''}
                    onChange={(e) => updateFilters({ minFollowersTiktok: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFollowersTiktok">Max TikTok Followers</Label>
                  <Input
                    id="maxFollowersTiktok"
                    type="number"
                    placeholder="10000000"
                    value={filters.maxFollowersTiktok || ''}
                    onChange={(e) => updateFilters({ maxFollowersTiktok: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
            )}

            {/* Has Portfolio Filter (for brands viewing creators) */}
            {role === 'brand' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPortfolio"
                  checked={filters.hasPortfolio || false}
                  onCheckedChange={(checked) => updateFilters({ hasPortfolio: checked as boolean })}
                />
                <Label htmlFor="hasPortfolio" className="cursor-pointer">
                  Has portfolio
                </Label>
              </div>
            )}

            {/* Has Previous Campaigns Filter (for creators viewing brands) */}
            {role === 'creator' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPreviousCampaigns"
                  checked={filters.hasPreviousCampaigns || false}
                  onCheckedChange={(checked) => updateFilters({ hasPreviousCampaigns: checked as boolean })}
                />
                <Label htmlFor="hasPreviousCampaigns" className="cursor-pointer">
                  Has previous campaigns
                </Label>
              </div>
            )}

            {/* Verification Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified || false}
                onCheckedChange={(checked) => updateFilters({ verified: checked as boolean })}
              />
              <Label htmlFor="verified" className="cursor-pointer">
                Verified only
              </Label>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function Filters({ role, onFiltersChange }: FiltersProps) {
  return (
    <Suspense fallback={
      <div className="mb-6">
        <Button variant="outline" disabled>
          <Filter className="h-4 w-4 mr-2" />
          Loading filters...
        </Button>
      </div>
    }>
      <FiltersContent role={role} onFiltersChange={onFiltersChange} />
    </Suspense>
  )
}

