"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { LayoutDashboard, BookOpen, Calendar, Shield, Video } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) return null

  const items = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/meetings", label: "Meet", icon: Video },
    { href: "/calendar", label: "Calendar", icon: Calendar },
  ] as { href: string; label: string; icon: any }[]

  if (user?.role === "instructor" || user?.role === "admin") {
    items.push({ href: "/admin", label: "Admin", icon: Shield })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60 lg:hidden">
      <div className="mx-auto max-w-7xl grid grid-cols-4 gap-1 p-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname?.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 rounded-md text-xs",
                active ? "text-primary" : "text-slate-600 dark:text-slate-300"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "" : "opacity-80")} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
