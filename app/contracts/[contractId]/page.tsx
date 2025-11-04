"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Edit } from "lucide-react"
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

export default function ContractViewPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.contractId as string

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null)

  const fetchContract = useCallback(async () => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`)
      if (!response.ok) {
        throw new Error('Failed to load contract')
      }

      const data = await response.json()
      setContract(data.contract)
    } catch (err: any) {
      console.error('Error loading contract:', err)
      setError(err.message || 'Failed to load contract')
    } finally {
      setLoading(false)
    }
  }, [contractId])

  useEffect(() => {
    const userRole = localStorage.getItem('userRole') as 'creator' | 'brand' | null
    setUserRole(userRole)
    fetchContract()
  }, [fetchContract])

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading contract...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error || 'Contract not found'}</p>
              <Button onClick={() => router.push('/contracts')}>
                Back to Contracts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isFullySigned = contract.signed_by_creator && contract.signed_by_brand

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/contracts')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contracts
        </Button>
        {!isFullySigned && (
          <Link href={`/contracts/${contractId}/sign`}>
            <Button>
              Sign Contract
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {contract.type === 'nda' ? 'Non-Disclosure Agreement' : 'Contract'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {contract.type === 'nda' ? (
                <Badge variant="outline">NDA</Badge>
              ) : (
                <Badge variant="outline">Contract</Badge>
              )}
              {isFullySigned ? (
                <Badge className="bg-green-100 text-green-800">Fully Signed</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">Pending Signatures</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Signature Status */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Signature Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Creator:</span>
                {contract.signed_by_creator ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600">Signed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Not signed</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Brand:</span>
                {contract.signed_by_brand ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600">Signed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Not signed</span>
                  </>
                )}
              </div>
              {isFullySigned && contract.signed_at && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    Fully signed on: {new Date(contract.signed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contract Content */}
          <div>
            <h3 className="font-semibold mb-2">Contract Content</h3>
            <div className="border rounded-lg p-4 bg-white max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm">{contract.content}</pre>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <p>Created: {new Date(contract.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(contract.updated_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


