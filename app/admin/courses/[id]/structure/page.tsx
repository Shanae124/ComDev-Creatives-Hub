"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen, Plus, Settings, FileText, Video, Edit, ArrowLeft, Home, BarChart3
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

interface Module {
  id: number
  title: string
  description?: string
  lesson_count?: number
}

export default function CourseStructurePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id
  const [loading, setLoading] = useState(true)
  const [courseTitle, setCourseTitle] = useState("")
  const [modules, setModules] = useState<Module[]>([])

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "admin" && user?.role !== "instructor") {
      router.push("/courses")
      return
    }

    loadCourseData()
  }, [courseId, isAuthenticated])

  const loadCourseData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/courses/${courseId}`
      )
      if (response.ok) {
        const course = await response.json()
        setCourseTitle(course.title)
      }

      const modulesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/courses/${courseId}/modules`
      )
      if (modulesResponse.ok) {
        const data = await modulesResponse.json()
        setModules(data)
      }
    } catch (error) {
      console.error("Failed to load course:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course structure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Course Builder</h1>
              <p className="text-muted-foreground">{courseTitle}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{modules.length}</p>
                    <p className="text-sm text-muted-foreground">Modules</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {modules.reduce((sum, m) => sum + (m.lesson_count || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Lessons</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Video className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Videos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common course management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Course Content
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/courses/${courseId}/lessons`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Manage Lessons
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/courses/${courseId}/videos`)}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Manage Videos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Structure</CardTitle>
                    <CardDescription>Hierarchical view of modules and lessons</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {modules.length > 0 ? (
                  <div className="space-y-3">
                    {modules.map((module, index) => (
                      <div key={module.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                {index + 1}
                              </span>
                              <h3 className="font-semibold text-lg">{module.title}</h3>
                            </div>
                            {module.description && (
                              <p className="text-sm text-muted-foreground ml-8">{module.description}</p>
                            )}
                            <div className="flex gap-4 mt-3 ml-8 text-xs text-muted-foreground">
                              <span>{module.lesson_count || 0} lessons</span>
                              <span>•</span>
                              <span>Added recently</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Delete</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No modules yet. Create your first module to get started.</p>
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Module
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Advanced settings and options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => router.push(`/admin/courses/${courseId}/lessons`)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Edit Lessons</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => router.push(`/admin/courses/${courseId}/videos`)}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    <span>Manage Videos</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Course Settings</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Home className="w-4 h-4 mr-2" />
                    <span>Preview Course</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Analytics</CardTitle>
                <CardDescription>Enrollment and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">0%</p>
                    <p className="text-sm text-muted-foreground">Average Completion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Active Learners</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
