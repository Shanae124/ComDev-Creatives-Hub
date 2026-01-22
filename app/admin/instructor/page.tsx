"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  BookOpen,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  MessageSquare,
  FileText,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  status: "draft" | "published" | "archived"
  students: number
  averageGrade: number
  assignments: number
  lastUpdated: string
}

interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  submissions: number
  graded: number
}

interface StudentProgress {
  id: string
  name: string
  email: string
  averageGrade: number
  coursesEnrolled: number
  assignmentsCompleted: number
  lastActive: string
}

export default function InstructorDashboard() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user?.role !== "instructor" && user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = useAuthStore.getState().token
        const headers = { Authorization: `Bearer ${token}` }

        const [coursesRes, assignmentsRes, studentsRes] = await Promise.all([
          fetch("/api/instructor/courses", { headers }),
          fetch("/api/instructor/assignments", { headers }),
          fetch("/api/instructor/students", { headers }),
        ])

        if (coursesRes.ok) setCourses(await coursesRes.json())
        if (assignmentsRes.ok) setAssignments(await assignmentsRes.json())
        if (studentsRes.ok) setStudents(await studentsRes.json())
      } catch (error) {
        console.error("Error fetching instructor data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-success/10 text-success">Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return null
    }
  }

  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0)
  const pendingGrading = assignments.reduce((sum, a) => sum + (a.submissions - a.graded), 0)

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
            <h1 className="text-4xl font-bold tracking-tight">Instructor Dashboard</h1>
            <p className="text-muted-foreground">Manage courses, students, and assignments</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {courses.filter((c) => c.status === "published").length} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Grading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{pendingGrading}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Student Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {students.length > 0
                  ? (students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length).toFixed(1)
                  : "—"}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <p className="text-muted-foreground">Loading courses...</p>
              ) : courses.length === 0 ? (
                <Card className="col-span-full text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground mb-4">No courses yet</p>
                  <Button>Create First Course</Button>
                </Card>
              ) : (
                courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        {getStatusBadge(course.status)}
                      </div>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Students: {course.students}</span>
                          <span className="font-semibold text-primary">{course.averageGrade.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Assignments: {course.assignments}</span>
                          <span className="text-xs text-muted-foreground">
                            Updated: {new Date(course.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link href={`/instructor/courses/${course.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link href={`/instructor/courses/${course.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="space-y-3">
              {loading ? (
                <p className="text-muted-foreground">Loading assignments...</p>
              ) : assignments.length === 0 ? (
                <Card className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">No assignments yet</p>
                </Card>
              ) : (
                assignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <Link
                            href={`/instructor/assignments/${assignment.id}`}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {assignment.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">{assignment.course}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-2">
                            {assignment.submissions > assignment.graded && (
                              <Badge variant="secondary" className="text-xs">
                                {assignment.submissions - assignment.graded} Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assignment.graded}/{assignment.submissions} graded
                          </p>
                          <Button size="sm" asChild>
                            <Link href={`/instructor/assignments/${assignment.id}/grade`}>
                              Grade
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="space-y-3">
              {loading ? (
                <p className="text-muted-foreground">Loading students...</p>
              ) : students.length === 0 ? (
                <Card className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">No students yet</p>
                </Card>
              ) : (
                students.map((student) => (
                  <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            <span>{student.coursesEnrolled} courses</span>
                            <span>{student.assignmentsCompleted} assignments completed</span>
                            <span>Last active: {new Date(student.lastActive).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className={`text-2xl font-bold ${student.averageGrade >= 70 ? "text-success" : "text-warning"}`}>
                            {student.averageGrade.toFixed(1)}%
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/instructor/students/${student.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
