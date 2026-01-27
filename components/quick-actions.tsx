"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Search, Settings, Upload, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"

export function QuickActions() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isInstructor = user?.role === "instructor" || user?.role === "admin"

  const studentActions = [
    { label: "Browse Courses", icon: Search, href: "/courses", description: "Find new courses" },
    { label: "My Assignments", icon: BookOpen, href: "/assignments", description: "View pending work" },
    { label: "Calendar", icon: BookOpen, href: "/calendar", description: "Check schedule" },
  ]

  const instructorActions = [
    { label: "Create Course", icon: Plus, href: "/admin/courses/new", description: "Build new course" },
    { label: "Upload SCORM", icon: Upload, href: "/admin/scorm", description: "Add SCORM package" },
    { label: "Grade Submissions", icon: Users, href: "/grading", description: "Review student work" },
    { label: "Course Settings", icon: Settings, href: "/admin/settings", description: "Configure system" },
  ]

  const actions = isInstructor ? instructorActions : studentActions

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 px-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => router.push(action.href)}
            >
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2 shrink-0">
                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
