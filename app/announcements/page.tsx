"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Search, Pin, BookOpen, AlertCircle, CalendarDays, User } from "lucide-react"
import Link from "next/link"

interface Announcement {
  id: string
  title: string
  content: string
  course: string
  instructor: string
  date: string
  pinned: boolean
  priority: "low" | "medium" | "high"
  type: "announcement" | "update" | "reminder"
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [searchTerm, setSearchTerm] = useState("")
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = useAuthStore.getState().token
        const response = await fetch("/api/announcements", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          setAnnouncements(await response.json())
        }
      } catch (error) {
        console.error("Error fetching announcements:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchAnnouncements()
    }
  }, [isAuthenticated])

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.pinned)
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.pinned)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "bg-warning/10 text-warning border-warning/20"
      case "low":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <AlertCircle className="h-4 w-4" />
      case "update":
        return <BookOpen className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with important course announcements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{announcements.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pinned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{pinnedAnnouncements.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {announcements.filter((a) => a.priority === "high").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Announcements */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground py-8 text-center">Loading announcements...</p>
          ) : pinnedAnnouncements.length === 0 && regularAnnouncements.length === 0 ? (
            <Card className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No announcements</p>
            </Card>
          ) : (
            <>
              {/* Pinned */}
              {pinnedAnnouncements.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Pinned Announcements</h3>
                  </div>

                  {pinnedAnnouncements.map((announcement) => (
                    <Card key={announcement.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(announcement.type)}
                                <h3 className="font-semibold">{announcement.title}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">{announcement.content}</p>
                            </div>
                            <Badge className={getPriorityColor(announcement.priority)} variant="outline">
                              {announcement.priority}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {announcement.course}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {announcement.instructor}
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              {new Date(announcement.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Regular */}
              {regularAnnouncements.length > 0 && (
                <div className="space-y-3">
                  {pinnedAnnouncements.length > 0 && (
                    <h3 className="font-semibold text-sm text-muted-foreground mt-6">Recent Announcements</h3>
                  )}

                  {regularAnnouncements.map((announcement) => (
                    <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(announcement.type)}
                                <h3 className="font-semibold">{announcement.title}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">{announcement.content}</p>
                            </div>
                            {announcement.priority !== "low" && (
                              <Badge className={getPriorityColor(announcement.priority)} variant="outline">
                                {announcement.priority}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {announcement.course}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {announcement.instructor}
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              {new Date(announcement.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
