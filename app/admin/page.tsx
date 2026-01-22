"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Settings,
  Lock,
  Unlock,
  Mail,
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  email: string
  name: string
  role: "student" | "instructor" | "admin"
  status: "active" | "inactive" | "suspended"
  createdAt: string
  lastLogin?: string
  coursesEnrolled?: number
}

interface CourseAdmin {
  id: string
  title: string
  instructor: string
  students: number
  status: "active" | "archived"
  createdAt: string
}

interface SystemStats {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  totalAssignments: number
  activeNow: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<CourseAdmin[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = useAuthStore.getState().token
        const headers = { Authorization: `Bearer ${token}` }

        const [usersRes, coursesRes, statsRes] = await Promise.all([
          fetch("/api/admin/users", { headers }),
          fetch("/api/admin/courses", { headers }),
          fetch("/api/admin/stats", { headers }),
        ])

        if (usersRes.ok) setUsers(await usersRes.json())
        if (coursesRes.ok) setCourses(await coursesRes.json())
        if (statsRes.ok) setStats(await statsRes.json())
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.role === "admin") {
      fetchData()
    }
  }, [isAuthenticated, user])

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-destructive/10 text-destructive">Admin</Badge>
      case "instructor":
        return <Badge className="bg-primary/10 text-primary">Instructor</Badge>
      case "student":
        return <Badge variant="outline">Student</Badge>
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-destructive/10 text-destructive">Suspended</Badge>
      default:
        return null
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">System management and configuration</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* System Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalCourses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{stats.totalEnrollments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">{stats.totalAssignments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{stats.activeNow}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="activity">System Activity</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button asChild>
                <Link href="/admin/users/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New User
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="text-muted-foreground py-8 text-center">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <Card className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </Card>
              ) : (
                filteredUsers.map((userItem) => (
                  <Card key={userItem.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{userItem.name}</p>
                            {getRoleBadge(userItem.role)}
                            {getStatusBadge(userItem.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{userItem.email}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Created: {new Date(userItem.createdAt).toLocaleDateString()}</span>
                            {userItem.lastLogin && (
                              <span>Last login: {new Date(userItem.lastLogin).toLocaleDateString()}</span>
                            )}
                            {userItem.coursesEnrolled !== undefined && (
                              <span>{userItem.coursesEnrolled} courses enrolled</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/users/${userItem.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {userItem.status === "active" ? (
                            <Button size="sm" variant="ghost">
                              <Lock className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost">
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search courses..." className="pl-10" />
              </div>
              <Button asChild>
                <Link href="/admin/courses/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <p className="text-muted-foreground">Loading courses...</p>
              ) : courses.length === 0 ? (
                <Card className="col-span-full text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">No courses found</p>
                </Card>
              ) : (
                courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <Badge variant={course.status === "active" ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">Instructor: {course.instructor}</p>
                        <p className="text-muted-foreground">Students: {course.students}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(course.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link href={`/admin/courses/${course.id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Activity Log</CardTitle>
                <CardDescription>Recent system events and user actions</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">Activity log coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
