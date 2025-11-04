"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import SignaturePad from "@/components/contracts/signature-pad"

interface Contract {
  id: string
  campaign_id?: string
  type: 'nda' | 'contract'
  content: string
  signed_by_creator: boolean
  signed_by_brand: boolean
  signed_at?: string
  created_at: string
}

export default function SignContractPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.contractId as string

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null)
  const [signature, setSignature] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSigned, setIsSigned] = useState(false)

  const fetchContract = useCallback(async () => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`)
      if (!response.ok) {
        throw new Error('Failed to load contract')
      }

      const data = await response.json()
      const contractData = data.contract

      setContract(contractData)

      // Check if already signed by this user
      const currentUserRole = localStorage.getItem('userRole') as 'creator' | 'brand' | null
      const isAlreadySigned = currentUserRole === 'creator'
        ? contractData.signed_by_creator
        : contractData.signed_by_brand

      if (isAlreadySigned) {
        setIsSigned(true)
      }
    } catch (err: any) {
      console.error('Error loading contract:', err)
      setError(err.message || 'Failed to load contract')
    } finally {
      setLoading(false)
    }
  }, [contractId])

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const userRole = localStorage.getItem('userRole') as 'creator' | 'brand' | null

    if (!userId || !userRole) {
      router.push('/')
      return
    }

    setUserId(userId)
    setUserRole(userRole)
    fetchContract()
  }, [contractId, router, fetchContract])

  const handleSignatureSave = (signatureData: string) => {
    setSignature(signatureData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signature || !name || !userId) {
      alert('Please provide your signature and name')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          signature,
          name
        })
      })

      if (!response.ok) {
        throw new Error('Failed to sign contract')
      }

      setIsSigned(true)
      // Refresh contract data
      await fetchContract()
    } catch (err: any) {
      console.error('Error signing contract:', err)
      alert(`Failed to sign contract: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (error || !contract || !userId) {
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

  const isAlreadySigned = userRole === 'creator'
    ? contract.signed_by_creator
    : contract.signed_by_brand

  const otherPartySigned = userRole === 'creator'
    ? contract.signed_by_brand
    : contract.signed_by_creator

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign Contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contract Content */}
          <div>
            <h3 className="font-semibold mb-2">Contract Content</h3>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm">{contract.content}</pre>
            </div>
          </div>

          {/* Signature Status */}
          <div className="space-y-2">
            <h3 className="font-semibold">Signature Status</h3>
            <div className="flex items-center gap-2">
              {userRole === 'creator' ? (
                <>
                  <span>Creator:</span>
                  {contract.signed_by_creator ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </>
              ) : (
                <>
                  <span>Brand:</span>
                  {contract.signed_by_brand ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {userRole === 'creator' ? (
                <>
                  <span>Brand:</span>
                  {contract.signed_by_brand ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </>
              ) : (
                <>
                  <span>Creator:</span>
                  {contract.signed_by_creator ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </>
              )}
            </div>
            {isFullySigned && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-semibold">Contract fully signed!</p>
                {contract.signed_at && (
                  <p className="text-sm text-green-600">
                    Signed on: {new Date(contract.signed_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Signature Form */}
          {!isAlreadySigned && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label>Your Signature *</Label>
                <SignaturePad
                  onSign={handleSignatureSave}
                  disabled={isSubmitting}
                />
                {signature && (
                  <div className="mt-2">
                    <Image src={signature} alt="Signature preview" width={300} height={150} className="border rounded p-2 bg-white max-w-xs" />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={!signature || !name || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Signing..." : "Sign Contract"}
                </Button>
              </div>
            </form>
          )}

          {isAlreadySigned && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 font-semibold">You have already signed this contract</p>
              <p className="text-sm text-blue-600 mt-1">
                {otherPartySigned
                  ? "Both parties have signed. Contract is complete."
                  : "Waiting for the other party to sign."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


