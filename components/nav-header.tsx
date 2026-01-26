"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Bell, Search, Moon, Sun, Menu, LogOut, Settings, Users, X,
  LayoutDashboard, BookOpen, Calendar, Shield, Eye, Eye as EyeOff, MessageSquare, ClipboardList, Award, TrendingUp, Video, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function NavHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const impersonating = useAuthStore((state) => state.impersonating)
  const stopImpersonation = useAuthStore((state) => state.stopImpersonation)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const isInstructor = user?.role === "instructor" || user?.role === "admin"

  const studentNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "My Courses", icon: BookOpen },
    { href: "/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/grades", label: "Grades", icon: Award },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/meetings", label: "Meetings", icon: Video },
  ]

  const instructorNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/labs", label: "Labs", icon: Zap },
    { href: "/admin/impersonate", label: "Impersonate", icon: Eye },
    { href: "/admin/settings/external-tools", label: "Meetings", icon: Video },
    { href: "/submissions", label: "Submissions", icon: ClipboardList },
    { href: "/grading", label: "Grading", icon: Award },
  ]

  const navItems = isInstructor ? instructorNav : studentNav

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(href))

  if (!mounted) return null

  return (
    <>
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60 shadow-lg">
        <div className="px-4 md:px-6 py-4 max-w-7xl mx-auto">
          {/* Impersonation Banner */}
          {impersonating && (
            <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm">
                <Eye className="h-4 w-4" />
                <span>You are impersonating <strong>{user?.name}</strong></span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={async () => {
                  const { adminAPI } = await import("@/lib/api")
                  try {
                    const { data } = await adminAPI.stopImpersonation()
                    stopImpersonation(data.token)
                    router.push("/admin/impersonate")
                  } catch (err) {
                    console.error("Failed to stop impersonation", err)
                  }
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white border-0"
              >
                Stop Impersonating
              </Button>
            </div>
          )}

          <div className="flex h-16 items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo/Branding */}
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="hidden sm:inline font-bold text-foreground">ProtexxaLearn</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Button
                    variant={isActive(href) ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto flex-shrink-0">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" title="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover:bg-accent"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" title="Account menu">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users" className="cursor-pointer">
                        <Users className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive(href)
                      ? "bg-primary text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
