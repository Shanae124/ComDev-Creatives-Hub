"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { courseAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { BookOpen, User, Calendar, ArrowLeft, FileText, Users, Clock } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

interface Course {
  id: number
  title: string
  description: string
  content_html: string
  status: string
  instructor_name: string
  created_at: string
  thumbnail_url?: string
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  const loadCourse = async () => {
    setLoading(true)
    try {
      const response = await courseAPI.getById(courseId as string)
      setCourse(response.data)
    } catch (err: any) {
      setError("Failed to load course")
      console.error(err)
    } finally {
      setLoading(false)
    }
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
            {/* Course Info */}
            <div className="lg:col-span-2">
              <Badge className="mb-4">{course.status}</Badge>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{course.instructor_name || "System"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(course.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Self-paced</span>
                </div>
              </div>
            </div>

            {/* Sidebar Card */}
            <div>
              <Card>
                {course.thumbnail_url && (
                  <div 
                    className="h-48 bg-cover bg-center rounded-t-lg"
                    style={{ backgroundImage: `url(${course.thumbnail_url})` }}
                  />
                )}
                <CardContent className="pt-6 space-y-4">
                  {isAuthenticated ? (
                    <>
                      <Button className="w-full" size="lg">
                        Enroll Now
                      </Button>
                      <Button variant="outline" className="w-full">
                        Add to Wishlist
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => router.push("/register")}
                    >
                      Sign Up to Enroll
                    </Button>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">Self-paced</span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
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
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Master the fundamentals and advanced concepts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Build real-world projects and applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Gain hands-on experience through practical exercises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Receive certification upon completion</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>Full HTML content with custom styling</CardDescription>
              </CardHeader>
              <CardContent>
                {course.content_html ? (
                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none 
                              prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                              prose-p:text-muted-foreground prose-p:leading-relaxed
                              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                              prose-strong:text-foreground prose-strong:font-semibold
                              prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                              prose-pre:bg-muted prose-pre:border prose-pre:border-border
                              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4
                              prose-ul:list-disc prose-ol:list-decimal
                              prose-img:rounded-lg prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{ __html: course.content_html }}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No course content available yet.</p>
                    <p className="text-sm mt-2">Check back later for updates!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                    {course.instructor_name?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{course.instructor_name || "Unknown"}</h3>
                    <p className="text-sm text-muted-foreground">Professional Instructor</p>
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
