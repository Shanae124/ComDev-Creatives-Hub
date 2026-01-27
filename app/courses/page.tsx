"use client"

import { useEffect, useState, type MouseEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { courseAPI, enrollmentAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import { CourseCardSkeleton } from "@/components/skeleton-loader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Star, Users, Clock, ArrowRight, Settings, Eye, Filter, Grid, List } from "lucide-react"
import Link from "next/link"

interface Course {
  id: number
  title: string
  description: string
  instructor_name?: string
  status?: string
  content_html?: string
  total_enrollments?: number
  module_count?: number
  enrolled?: number | boolean
  duration?: string
  rating?: number
  level?: "beginner" | "intermediate" | "advanced"
  progress?: number
}

export default function CoursesPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [searchTerm, setSearchTerm] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"enrolled" | "browse">("enrolled")
  const [error, setError] = useState<string | null>(null)
  const [enrollingId, setEnrollingId] = useState<number | null>(null)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getAll()
        const data: Course[] = response.data || []
        setCourses(data)
        setEnrolledCourses(data.filter((c) => Boolean((c as any).enrolled)))
        setError(null)
      } catch (err: any) {
        console.error("Error fetching courses:", err)
        setError("Failed to load courses")
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchCourses()
    }
  }, [isAuthenticated])

  const filteredCourses = (viewMode === "enrolled" ? enrolledCourses : courses)
    .filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterLevel === "all" || course.level === filterLevel)
    )
    .sort((a, b) => {
      if (sortBy === "recent") return (b.id || 0) - (a.id || 0)
      if (sortBy === "title") return a.title.localeCompare(b.title)
      if (sortBy === "progress" && a.progress !== undefined && b.progress !== undefined) {
        return (b.progress || 0) - (a.progress || 0)
      }
      return 0
    })

  const handleEnroll = async (course: Course, e: MouseEvent) => {
    e.preventDefault()
    if (!user?.id) return
    try {
      setEnrollError(null)
      setEnrollingId(course.id)
      await enrollmentAPI.enroll(user.id, course.id)
      setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, enrolled: true } : c)))
      setEnrolledCourses((prev) => {
        const already = prev.some((c) => c.id === course.id)
        return already ? prev : [...prev, { ...course, enrolled: true }]
      })
      setViewMode("enrolled")
    } catch (err: any) {
      console.error("Enroll failed", err)
      setEnrollError("Unable to enroll right now. Please try again.")
    } finally {
      setEnrollingId(null)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            {viewMode === "enrolled" ? "My Courses" : "Browse Courses"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {viewMode === "enrolled"
              ? "Access your enrolled courses and track progress"
              : "Discover new courses to expand your knowledge"}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "enrolled" ? "default" : "outline"}
              onClick={() => setViewMode("enrolled")}
            >
              My Courses ({enrolledCourses.length})
            </Button>
            <Button
              variant={viewMode === "browse" ? "default" : "outline"}
              onClick={() => setViewMode("browse")}
            >
              Browse All
            </Button>
            {user?.role === 'instructor' && (
              <Link href="/courses/content-editor">
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Content
                </Button>
              </Link>
            )}
          </div>
        </div>

        {enrollError && (
          <div className="text-sm text-destructive" role="alert">
            {enrollError}
          </div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : error ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <p className="text-lg font-semibold">We hit a snag</p>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40" />
              <p className="text-lg font-semibold">
                {viewMode === "enrolled" ? "No courses enrolled" : "No courses found"}
              </p>
              <p className="text-muted-foreground">
                {viewMode === "enrolled"
                  ? "Start your learning journey by browsing available courses"
                  : "Try adjusting your search terms"}
              </p>
              {viewMode === "enrolled" && (
                <Button onClick={() => setViewMode("browse")} className="mt-4">
                  Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="h-full hover:shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden group border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
                {/* Image/Placeholder - clickable */}
                <Link href={`/courses/${course.id}`}>
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    <div className="h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>

                <CardHeader>
                  <Link href={`/courses/${course.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 hover:text-primary transition-colors">{course.title}</CardTitle>
                      {course.level && (
                        <Badge
                          variant={
                            course.level === "beginner"
                              ? "outline"
                              : course.level === "intermediate"
                                ? "secondary"
                                : "default"
                          }
                          className="shrink-0"
                        >
                          {course.level}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {course.instructor_name && (
                    <p className="text-sm text-muted-foreground">by {course.instructor_name}</p>
                  )}

                  {/* Progress Bar - for enrolled courses */}
                  {course.enrolled && course.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{Math.round(course.progress)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {course.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                    )}
                    {typeof course.total_enrollments === "number" && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.total_enrollments || 0}
                      </div>
                    )}
                    {course.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-2">
                    {course.enrolled ? (
                      <Link href={`/courses/${course.id}`} className="flex-1">
                        <Button className="w-full">
                          View Course
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Button
                          className="flex-1"
                          onClick={(e) => {
                            e.preventDefault()
                            handleEnroll(course, e)
                          }}
                          disabled={enrollingId === course.id}
                        >
                          {enrollingId === course.id ? "Enrolling..." : "Enroll"}
                        </Button>
                        <Link href={`/courses/${course.id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
