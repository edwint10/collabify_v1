"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  Zap,
  BarChart3,
  Shield,
  MessagesSquare,
  FileCheck,
  Rocket,
  Sun,
  Moon
} from "lucide-react"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-white/70" />
      ) : (
        <Moon className="h-4 w-4 text-gray-600" />
      )}
    </button>
  )
}

function EmailSignupForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus("loading")
    try {
      const res = await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus("success")
        setMessage(data.message)
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error)
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
        <span className="font-medium text-gray-900 dark:text-white">{message}</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex items-center gap-0 rounded-full p-1.5 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 dark:backdrop-blur-md">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle") }}
          className="flex-1 px-5 py-3 bg-transparent text-sm outline-none min-w-0 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50"
          required
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full px-6 py-3 text-sm font-semibold shrink-0 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Get Early Access
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>
      {status === "error" && (
        <p className="text-xs mt-2 text-center text-red-500 dark:text-red-300">{message}</p>
      )}
    </div>
  )
}

const stats = [
  { value: "10x", label: "Faster matching" },
  { value: "85%", label: "Deal close rate" },
  { value: "50k+", label: "Creators" },
  { value: "$2M+", label: "Deals facilitated" },
]

const features = [
  {
    icon: Zap,
    title: "AI-Powered Matching",
    description: "Our algorithm analyzes audience data, engagement patterns, and brand fit to surface perfect creator matches in seconds.",
  },
  {
    icon: MessagesSquare,
    title: "Built-in Deal Room",
    description: "Negotiate, communicate, and close deals in one place. No more scattered email threads.",
  },
  {
    icon: FileCheck,
    title: "One-Click Contracts",
    description: "Generate, sign, and manage contracts and NDAs digitally. Legal made simple.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track campaign performance, engagement rates, and ROI with dashboards that update in real-time.",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Every creator and brand is verified. Work with confidence, every time.",
  },
  {
    icon: Rocket,
    title: "Launch in Days, Not Weeks",
    description: "From discovery to live campaign in record time. Streamlined workflows that eliminate the back-and-forth.",
  },
]

export default function SplashPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Hyperbrandz</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-white/40 hidden sm:block">Launching Soon</span>
            <a
              href="/early-access"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity"
            >
              Early Access
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20 dark:opacity-30">
          <div className="absolute top-20 left-0 w-72 h-72 bg-violet-500 dark:bg-violet-600 rounded-full blur-[128px]" />
          <div className="absolute top-40 right-0 w-72 h-72 bg-fuchsia-500 dark:bg-fuchsia-600 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-500 dark:bg-blue-600 rounded-full blur-[128px]" />
        </div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 backdrop-blur-sm text-xs text-gray-500 dark:text-white/70 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Now accepting early access applications
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              The operating system for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400">
                creator partnerships
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 dark:text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
              Match with the right creators. Close deals faster. Track everything in one place. Hyperbrandz is how modern brands scale influencer marketing.
            </p>

            <EmailSignupForm />

            <p className="mt-5 text-xs text-gray-400 dark:text-white/30">
              Free to start. No credit card required.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-black px-6 py-8 text-center">
                <div className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 dark:text-white/40 mt-1.5 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32 border-t border-gray-100 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-500 dark:text-violet-400 mb-3 uppercase tracking-wider">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to scale
            </h2>
            <p className="text-gray-500 dark:text-white/40 max-w-lg mx-auto">
              One platform to find creators, manage deals, and measure results. No more duct-taping tools together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-black p-8 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-5 group-hover:border-violet-300 dark:group-hover:border-violet-500/30 group-hover:bg-violet-50 dark:group-hover:bg-violet-500/10 transition-colors">
                    <Icon className="h-5 w-5 text-gray-500 dark:text-white/60 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 border-t border-gray-100 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <blockquote className="text-2xl sm:text-3xl font-medium leading-snug tracking-tight mb-8">
              &ldquo;Hyperbrandz cut our creator sourcing time from{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400">weeks to hours</span>
              . It&apos;s the tool we didn&apos;t know we needed.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
              <div className="text-left">
                <div className="text-sm font-medium">Sarah Chen</div>
                <div className="text-xs text-gray-400 dark:text-white/40">Head of Marketing, StyleCo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-gray-100 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="relative max-w-2xl mx-auto text-center">
            {/* Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-500/10 dark:bg-violet-600/20 rounded-full blur-[80px]" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to get started?
              </h2>
              <p className="text-gray-500 dark:text-white/40 mb-8 max-w-md mx-auto">
                Join the waitlist and be among the first to transform how you work with creators.
              </p>
              <EmailSignupForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-white/5 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">H</span>
            </div>
            <span className="text-sm font-medium text-gray-400 dark:text-white/60">Hyperbrandz</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-white/30">
            &copy; {new Date().getFullYear()} Hyperbrandz. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
