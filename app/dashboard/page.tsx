"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { courseAPI, enrollmentAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { QuickActions } from "@/components/quick-actions"
import { EmptyState } from "@/components/empty-state"
import { CourseProgressRing } from "@/components/course-progress-ring"
import { BarChart3, BookOpen, Calendar, Clock, Users, TrendingUp, ArrowRight, FolderTree, Shield, Eye, Target, Award } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [courses, setCourses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          courseAPI.getAll(),
          enrollmentAPI.getAll(),
        ])
        setCourses(coursesRes.data || [])
        setEnrollments(enrollmentsRes.data || [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  const isInstructor = user?.role === "instructor" || user?.role === "admin"
  const myCourses = courses.filter((c) => c.created_by === user?.id)
  const enrolledCourses = courses.filter((c) => enrollments.some((e) => e.course_id === c.id && e.user_id === user?.id))

  // Calculate aggregate stats
  const totalProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolledCourses.length)
    : 0
  const completedCourses = enrolledCourses.filter((c) => (c.progress || 0) >= 100).length
  const inProgressCourses = enrolledCourses.filter((c) => (c.progress || 0) > 0 && (c.progress || 0) < 100).length

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-16 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground text-lg">
          {isInstructor ? "Manage your courses and track student progress" : "Continue your learning journey"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {isInstructor ? "My Courses" : "Enrolled"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isInstructor ? myCourses.length : enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active courses</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isInstructor ? "Students" : "Progress"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isInstructor ? enrollments.length : "0%"}</div>
            <p className="text-xs text-muted-foreground mt-1">{isInstructor ? "Total enrolled" : "Overall"}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              {isInstructor ? "Total Students" : "In Progress"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isInstructor ? enrollments.length : inProgressCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">{isInstructor ? "Across all courses" : "Active courses"}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">{isInstructor ? "Published courses" : "Courses finished"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview for Students */}
      {!isInstructor && enrolledCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Learning Progress</CardTitle>
            <CardDescription>Overall completion across all enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <CourseProgressRing progress={totalProgress} size="lg" />
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold">{completedCourses} of {enrolledCourses.length} courses</span>
                  </div>
                  <Progress value={(completedCourses / enrolledCourses.length) * 100} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedCourses}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{inProgressCourses}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{enrolledCourses.length - completedCourses - inProgressCourses}</div>
                    <div className="text-xs text-muted-foreground">Not Started</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses and Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{isInstructor ? "My Courses" : "Your Courses"}</CardTitle>
                  <CardDescription>
                    {isInstructor
                      ? "Manage and monitor your courses"
                      : `${enrolledCourses.length} course${enrolledCourses.length !== 1 ? "s" : ""}`}
                  </CardDescription>
                </div>
                <Link href="/courses">
                  <Button variant="outline" size="sm" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (isInstructor ? myCourses : enrolledCourses).length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">No courses yet</p>
                  <Button className="mt-4" asChild>
                    <Link href="/courses">{isInstructor ? "Create a course" : "Browse courses"}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(isInstructor ? myCourses : enrolledCourses).slice(0, 5).map((course) => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold group-hover:text-primary transition-colors">{course.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                          </div>
                          <Badge variant="secondary" className="capitalize text-xs">
                            {course.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Hub */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation Hub</CardTitle>
              <CardDescription>Jump to key areas quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { href: '/courses', label: 'Courses', icon: <BookOpen className="h-4 w-4" /> },
                  { href: '/calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
                  { href: '/announcements', label: 'Announcements', icon: <Users className="h-4 w-4" /> },
                  { href: '/assignments', label: 'Assignments', icon: <Clock className="h-4 w-4" /> },
                  { href: '/grades', label: 'Grades', icon: <BarChart3 className="h-4 w-4" /> },
                  { href: '/submissions', label: 'Submissions', icon: <TrendingUp className="h-4 w-4" /> },
                  { href: '/portal/student', label: 'Student Portal', icon: <Users className="h-4 w-4" /> },
                  ...(isInstructor
                    ? [
                        { href: '/admin', label: 'Admin', icon: <Shield className="h-4 w-4" /> },
                        { href: '/admin/impersonate', label: 'Impersonate', icon: <Eye className="h-4 w-4" /> },
                        { href: '/portal/admin', label: 'Admin Portal', icon: <Shield className="h-4 w-4" /> },
                        { href: '/admin/settings/external-tools', label: 'Meetings & Boards', icon: <Calendar className="h-4 w-4" /> },
                      ]
                    : []),
                ].map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className="p-3 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors flex items-center gap-2">
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <QuickActions />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Learning Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>✓ Complete lessons consistently for best results</li>
                <li>✓ Take notes while learning</li>
                <li>✓ Join discussion forums</li>
                <li>✓ Practice regularly to reinforce concepts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
