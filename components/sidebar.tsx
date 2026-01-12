"use client"

import { BookOpen, LayoutDashboard, Settings, GraduationCap, BarChart3, Users, FolderTree, Plus, MessageSquare, ClipboardList, Award, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/auth-store"

const studentNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Assignments", href: "/assignments", icon: ClipboardList },
  { name: "Grades", href: "/grades", icon: Award },
  { name: "Calendar", href: "/calendar", icon: Calendar },
]

const instructorNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Courses", href: "/admin/courses", icon: FolderTree },
  { name: "Create Course", href: "/admin/courses/new", icon: Plus },
  { name: "Announcements", href: "/announcements", icon: MessageSquare },
  { name: "Student Submissions", href: "/submissions", icon: ClipboardList },
  { name: "Grading", href: "/grading", icon: Award },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
]

const adminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Course Management", href: "/admin/courses", icon: FolderTree },
  { name: "All Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard")
  const user = useAuthStore((state) => state.user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  // Determine which navigation to show based on user role
  let navigationItems = studentNavigation
  let sectionLabel = "Student"
  
  if (user?.role === "instructor") {
    navigationItems = instructorNavigation
    sectionLabel = "Instructor"
  } else if (user?.role === "admin") {
    navigationItems = adminNavigation
    sectionLabel = "Administrator"
  }

  return (
    <aside className="hidden w-72 border-r border-border bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <Image src="/logo.png" alt="Protexxa" width={48} height={48} className="shrink-0" />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Protexxa
            </span>
            <span className="text-xs text-muted-foreground font-medium">Learning Platform</span>
          </div>
        </div>

        <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{sectionLabel}</h3>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.name
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveItem(item.name)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <Separator />

          <div className="space-y-1">
            <Link
              href="/settings"
              onClick={() => setActiveItem("Settings")}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                activeItem === "Settings"
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold">{user?.name}</p>
              <p>{user?.email}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
              <span>Powered by</span>
              <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Protexxa
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
