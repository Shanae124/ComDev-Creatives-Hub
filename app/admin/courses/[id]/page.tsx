"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { courseAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Users, FileText, BarChart3, Settings, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  content_html?: string
  status: "draft" | "published" | "archived"
  students: number
  assignments: number
  createdAt: string
}

export default function AdminCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string
  const isNew = !courseId || courseId === "new"

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (isNew) {
      setCourse({
        id: "",
        title: "",
        description: "",
        content_html: "",
        status: "draft",
        students: 0,
        assignments: 0,
        createdAt: new Date().toISOString(),
      })
      setLoading(false)
      return
    }

    if (courseId) {
      const fetchCourse = async () => {
        try {
          const response = await courseAPI.getById(courseId)
          const data = response.data
          setCourse({
            id: String(data.id),
            title: data.title || "",
            description: data.description || "",
            content_html: data.content_html || "",
            status: (data.status as Course["status"]) || "draft",
            students: data.total_enrollments || 0,
            assignments: data.assignments || 0,
            createdAt: data.created_at || new Date().toISOString(),
          })
        } catch (error) {
          console.error("Error fetching course:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchCourse()
    }
  }, [courseId, isNew])

  const updateField = (key: keyof Course, value: any) => {
    setCourse((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleSave = async () => {
    if (!course) return

    setSaving(true)
    try {
      const payload = {
        title: course.title,
        description: course.description,
        content_html: course.content_html,
        status: course.status,
      }

      if (isNew) {
        await courseAPI.create(payload)
      } else {
        await courseAPI.update(courseId, payload)
      }

      router.push("/admin?tab=courses")
    } catch (error) {
      console.error("Error saving course:", error)
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {isNew ? "Create Course" : "Edit Course"}
              </h1>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : (
          <>
            {/* Course Overview */}
            {!isNew && course && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{course.students}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{course.assignments}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={course.status === "active" ? "default" : "secondary"}>
                      {course.status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">{new Date(course.createdAt).toLocaleDateString()}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                {!isNew && <TabsTrigger value="students">Students</TabsTrigger>}
                {!isNew && <TabsTrigger value="assignments">Assignments</TabsTrigger>}
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Course Title</Label>
                      <Input
                        id="title"
                        placeholder="Introduction to Python"
                        value={course?.title || ""}
                        onChange={(e) => setCourse(course ? { ...course, title: e.target.value } : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Course description"
                        value={course?.description || ""}
                        onChange={(e) =>
                          setCourse(course ? { ...course, description: e.target.value } : null)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={course?.status}
                        onValueChange={(value: any) => updateField("status", value)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 flex gap-2">
                      <Button onClick={handleSave} disabled={saving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? "Saving..." : "Save Course"}
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/admin">Cancel</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>Edit HTML content that renders on the course page.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      rows={18}
                      placeholder="Enter HTML content"
                      value={course?.content_html || ""}
                      onChange={(e) => updateField("content_html", e.target.value)}
                    />
                    <div className="border rounded-md p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        Live Preview
                      </div>
                      <div
                        className="prose prose-slate dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: course?.content_html || "<p>No content yet.</p>" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {!isNew && (
                <>
                  <TabsContent value="students">
                    <Card>
                      <CardHeader>
                        <CardTitle>Enrolled Students</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground">Student list coming soon</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="assignments">
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Assignments</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground">Assignments list coming soon</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
