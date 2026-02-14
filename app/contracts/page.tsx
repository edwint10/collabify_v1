"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Eye, Edit, Trash2, Copy } from "lucide-react"
import Link from "next/link"

interface Contract {
  id: string
  campaign_id?: string
  type: 'nda' | 'contract'
  content: string
  signed_by_creator: boolean
  signed_by_brand: boolean
  signed_at?: string
  created_at: string
  updated_at: string
}

export default function ContractsPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/')
      return
    }
    setUserId(userId)
    fetchContracts(userId)
  }, [router])

  const fetchContracts = async (userId: string) => {
    try {
      const response = await fetch(`/api/contracts?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch contracts')
      }

      const data = await response.json()
      setContracts(data.contracts || [])
    } catch (err: any) {
      console.error('Error fetching contracts:', err)
      setError(err.message || 'Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (contract: Contract) => {
    if (contract.signed_by_creator && contract.signed_by_brand) {
      return <Badge className="bg-green-100 text-green-800">Fully Signed</Badge>
    }
    if (contract.signed_by_creator || contract.signed_by_brand) {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Signatures</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Unsigned</Badge>
  }

  const getTypeBadge = (type: string) => {
    return type === 'nda' ? (
      <Badge variant="outline">NDA</Badge>
    ) : (
      <Badge variant="outline">Contract</Badge>
    )
  }

  const filteredContracts = contracts.filter(contract => {
    if (typeFilter !== 'all' && contract.type !== typeFilter) return false
    if (statusFilter === 'signed' && !(contract.signed_by_creator && contract.signed_by_brand)) return false
    if (statusFilter === 'pending' && !(contract.signed_by_creator || contract.signed_by_brand)) return false
    if (statusFilter === 'unsigned' && (contract.signed_by_creator || contract.signed_by_brand)) return false
    return true
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading contracts...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-gray-500 mt-1">Manage your contracts and NDAs</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Contracts</CardTitle>
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="nda">NDA</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="signed">Fully Signed</SelectItem>
                  <SelectItem value="pending">Pending Signatures</SelectItem>
                  <SelectItem value="unsigned">Unsigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">No contracts found</p>
            <p className="text-sm text-gray-400 mb-6">
              {typeFilter === "all" && statusFilter === "all"
                ? "You haven't created any contracts or NDAs yet"
                : `No contracts match the selected filters`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredContracts.map((contract) => {
            // Extract preview text from content
            const contentPreview = contract.content.length > 200
              ? contract.content.substring(0, 200) + '...'
              : contract.content

            return (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeBadge(contract.type)}
                        {getStatusBadge(contract)}
                        <span className="text-sm text-gray-500">
                          {new Date(contract.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                        {contentPreview}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/contracts/${contract.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      {!contract.signed_by_creator || !contract.signed_by_brand ? (
                        <Link href={`/contracts/${contract.id}/sign`}>
                          <Button variant="outline" size="sm">
                            Sign
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}




