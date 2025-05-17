"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Monitor,
  Menu,
  Home,
  Package,
  ClipboardList,
  Bell,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Megaphone,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useMobile } from "@/hooks/use-mobile"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isMobile = useMobile()
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Fetch unread notifications count
  useEffect(() => {
    if (user) {
      // This would be replaced with an actual API call
      setUnreadNotifications(3) // Example value
    }
  }, [user])

  type NavItem = {
    name: string
    href: string
    icon: React.ComponentType<any>
    badge?: number
  }

  const navigation: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Orders", href: "/dashboard/orders", icon: ClipboardList },
    { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: unreadNotifications },
  ]

  // Admin-only navigation items
  const adminNavigation: NavItem[] = [
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Statistics", href: "/dashboard/statistics", icon: BarChart3 },
  ]

  const isAdmin = user?.role === "admin"
  const isManager = user?.role === "manager" || isAdmin

  const navItems = [...navigation, ...(isAdmin ? adminNavigation : [])]

  const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "U"

  const NavLinks = () => (
    <>
      <div className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start">
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
              {item.badge ? (
                <Badge className="ml-auto" variant="destructive">
                  {item.badge}
                </Badge>
              ) : null}
            </Button>
          </Link>
        ))}
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <Link href="/dashboard/settings">
          <Button variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"} className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-primary" />
            <span className="font-bold">CompService</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center space-x-2 mb-6">
                <Monitor className="h-5 w-5 text-primary" />
                <span className="font-bold">CompService</span>
              </div>
              <div className="flex items-center space-x-3 mb-6">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user?.username}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="hidden lg:block w-64 border-r bg-card h-screen sticky top-0">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-8">
                <Monitor className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">CompService</span>
              </div>
              <div className="flex items-center space-x-3 mb-6">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user?.username}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <NavLinks />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
