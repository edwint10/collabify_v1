"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  Megaphone,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick actions"
  },
  {
    name: "Matches",
    href: "/matches",
    icon: Users,
    description: "Discover and connect"
  },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageSquare,
    description: "Conversations"
  },
  {
    name: "Campaigns",
    href: "/campaigns",
    icon: Megaphone,
    description: "Manage campaigns"
  },
  {
    name: "Contracts",
    href: "/contracts",
    icon: FileText,
    description: "Contracts & NDAs"
  },
]

export default function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'creator' | 'brand' | null
    const id = localStorage.getItem('userId')
    setUserRole(role)
    setUserId(id)
  }, [])

  const handleLogout = async () => {
    // Sign out from Supabase Auth
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    
    // Clear localStorage
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    
    // Redirect to home
    router.push('/')
  }

  // Don't show nav on home page, signup, login, or profile creation
  if (pathname === '/' || pathname === '/signup' || pathname === '/login' || pathname?.startsWith('/profile/')) {
    return null
  }

  // Don't show nav if user is not logged in
  if (!userId || !userRole) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline-block">
              Hyperbrandz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  title={item.description}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-transform",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute -bottom-px left-2 right-2 h-0.5 bg-primary-foreground rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Side - Profile & Logout */}
          <div className="flex items-center gap-2">
            <Link
              href={userId ? `/user/${userId}` : '/dashboard'}
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname?.startsWith('/user/')
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex text-gray-700 hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className={cn(
                      "text-xs mt-0.5",
                      isActive ? "text-primary-foreground/80" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
            <div className="pt-4 border-t mt-4 space-y-1">
              <Link
                href={userId ? `/user/${userId}` : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

