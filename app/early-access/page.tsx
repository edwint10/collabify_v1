"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EarlyAccessPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const router = useRouter()

  const isLocked = lockoutSeconds > 0

  useEffect(() => {
    if (lockoutSeconds <= 0) return
    const timer = setTimeout(() => setLockoutSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [lockoutSeconds])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || isLocked) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: code.trim() }),
      })

      const data = await res.json()

      if (data.valid) {
        router.push("/signup")
      } else {
        if (res.status === 429) {
          const seconds = parseInt(data.error?.match(/(\d+)s/)?.[1] ?? "60", 10)
          setLockoutSeconds(seconds)
        }
        setError(data.error || "Invalid access code")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [code, isLocked, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-black py-12 px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Early Access</CardTitle>
            <CardDescription>
              Enter your access code to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Access Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter your 6-digit code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setError(null)
                  }}
                  required
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!code.trim() || isLoading || isLocked}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : isLocked ? (
                  `Try again in ${lockoutSeconds}s`
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
