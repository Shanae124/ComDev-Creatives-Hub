"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { courseAPI, enrollmentAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { BookOpen, User, Calendar, ArrowLeft, FileText } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

interface Course {
  id: number
  title: string
  description: string
  content_html: string
  status: string
  instructor_name?: string
  created_at?: string
  thumbnail_url?: string
  enrolled?: boolean
}

interface Module {
  id: number
  title: string
  description?: string
  sort_order: number
  content_html?: string
  lessons?: Lesson[]
}

interface Lesson {
  id: number
  title: string
  content_html: string
  lesson_type: string
  sort_order: number
  duration_minutes?: number
}

interface ContentPage {
  id: string
  title: string
  type: "html" | "video" | "page"
  content?: string
  videoUrl?: string
  duration?: number
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    if (courseId) {
      loadCourse()
      loadModules()
    }
  }, [courseId, isAuthenticated])

  const loadCourse = async () => {
    setLoading(true)
    try {
      const response = await courseAPI.getById(courseId as string)
      setCourse(response.data)
      setEnrolled(Boolean(response.data.enrolled))
    } catch (err: any) {
      setError("Failed to load course")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadModules = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses/${courseId}/modules`
      )
      if (response.ok) {
        const data = await response.json()
        setModules(data)
        // Initialize first module content
        if (data.length > 0 && enrolled) {
          setSelectedContent({
            id: `module-${data[0].id}`,
            title: data[0].title,
            type: "page",
            content: data[0].description || data[0].content_html,
          })
        }
      }
    } catch (err) {
      console.error("Failed to load modules:", err)
    }
  }

  const handleEnroll = async () => {
    if (!user?.id || !courseId) return
    setEnrolling(true)
    try {
      await enrollmentAPI.enroll(user.id, Number(courseId))
      setEnrolled(true)
      setCourse((prev) => (prev ? { ...prev, enrolled: true } : null))
      loadModules()
    } catch (err: any) {
      console.error("Enrollment failed:", err)
      setError("Failed to enroll. Please try again.")
    } finally {
      setEnrolling(false)
    }
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const handleSelectLesson = (lesson: Lesson, moduleName: string) => {
    setSelectedContent({
      id: `lesson-${lesson.id}`,
      title: lesson.title,
      type: lesson.lesson_type === "video" ? "video" : "html",
      content: lesson.content_html,
      duration: lesson.duration_minutes,
    })
    setActiveTab("content-view")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error || "Course not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/courses")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 hover:bg-background/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge className="mb-4">{course.status}</Badge>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Instructor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(course.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{modules.length} Modules</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling || enrolled}
                  >
                    {enrolling ? "Enrolling..." : enrolled ? "Enrolled ✓" : "Enroll Now"}
                  </Button>
                  {enrolled && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab("content-view")}
                    >
                      Start Learning
                    </Button>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modules</span>
                      <span className="font-medium">{modules.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">All Levels</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language</span>
                      <span className="font-medium">English</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content-view" disabled={!enrolled}>Content</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Structure</CardTitle>
                <CardDescription>{modules.length} modules to master</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modules.map((module, index) => (
                    <div key={module.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium">{index + 1}. {module.title}</span>
                      </div>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mt-1 ml-6">{module.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content-view" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Course Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {modules.map((module) => (
                      <div key={module.id} className="space-y-1">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition-colors text-left"
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium truncate">{module.title}</span>
                        </button>

                        {expandedModules.has(module.id) && module.lessons && (
                          <div className="ml-6 space-y-1">
                            {module.lessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => handleSelectLesson(lesson, module.title)}
                                className="w-full flex items-center gap-2 p-2 rounded text-left text-sm hover:bg-primary/10 transition-colors"
                              >
                                {lesson.lesson_type === "video" ? (
                                  <Play className="w-3 h-3 text-primary" />
                                ) : (
                                  <FileText className="w-3 h-3 text-muted-foreground" />
                                )}
                                <span className="truncate text-xs">{lesson.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                {selectedContent ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>{selectedContent.title}</CardTitle>
                          {selectedContent.duration && (
                            <CardDescription className="flex items-center gap-1 mt-2">
                              <Clock className="w-4 h-4" />
                              {selectedContent.duration} minutes
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="outline">{selectedContent.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedContent.type === "video" && selectedContent.videoUrl ? (
                        <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%", height: 0 }}>
                          <iframe
                            src={selectedContent.videoUrl}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={selectedContent.title}
                          />
                        </div>
                      ) : selectedContent.content ? (
                        <iframe
                          srcDoc={selectedContent.content}
                          className="w-full border-0 rounded-lg"
                          style={{ minHeight: "600px", height: "100vh" }}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                          title={selectedContent.title}
                        />
                      ) : (
                        <p className="text-muted-foreground">No content available</p>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground text-center">
                        Select a module or lesson from the sidebar to view content
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instructor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Professional Instructor</h3>
                    <p className="text-sm text-muted-foreground">Expert in cybersecurity training</p>
                    <div className="flex gap-4 mt-4 text-sm">
                      <div>
                        <p className="font-semibold">15</p>
                        <p className="text-muted-foreground">Courses</p>
                      </div>
                      <div>
                        <p className="font-semibold">1,234</p>
                        <p className="text-muted-foreground">Students</p>
                      </div>
                      <div>
                        <p className="font-semibold">4.8</p>
                        <p className="text-muted-foreground">Rating</p>
                      </div>
                    </div>
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
