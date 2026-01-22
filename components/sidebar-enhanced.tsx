"use client"

import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  FileText,
  MessageSquare,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Briefcase,
  Layers,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [open, setOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "My Courses", icon: BookOpen },
    { href: "/assignments", label: "Assignments", icon: FileText },
    { href: "/grades", label: "Grades", icon: BarChart3 },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/announcements", label: "Announcements", icon: Bell },
    { href: "/discussions", label: "Discussions", icon: MessageSquare },
  ]

  const instructorLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/instructor", label: "My Courses", icon: BookOpen },
    { href: "/instructor/assignments", label: "Assignments", icon: FileText },
    { href: "/instructor/students", label: "Students", icon: GraduationCap },
    { href: "/instructor/grading", label: "Grading", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin", label: "System Admin", icon: Briefcase },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  const links = user?.role === "admin" ? adminLinks : user?.role === "instructor" ? instructorLinks : studentLinks

  const LinkItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => (
    <Link href={href}>
      <Button
        variant={isActive(href) ? "default" : "ghost"}
        className="w-full justify-start gap-2"
        onClick={() => setOpen(false)}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden md:inline">{label}</span>
      </Button>
    </Link>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-16 left-4 z-40"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 md:w-auto border-r border-border bg-card transition-all duration-300 z-30 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* User Info */}
          <div className="p-4 border-b border-border space-y-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-2">
            {links.map((link) => (
              <LinkItem key={link.href} {...link} />
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => {
                logout()
                setOpen(false)
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
