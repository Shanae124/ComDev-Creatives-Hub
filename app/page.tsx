"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import axios from "axios"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  Play,
  BarChart3,
  Mail,
} from "lucide-react"

interface Instructor {
  id: number
  name: string
  email: string
  bio?: string
  avatar_url?: string
  course_count: number
  student_count: number
}

export default function HomePage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loadingInstructors, setLoadingInstructors] = useState(true)

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get("/instructors")
        setInstructors(response.data || [])
      } catch (err) {
        console.error("Failed to load instructors:", err)
        setInstructors([])
      } finally {
        setLoadingInstructors(false)
      }
    }

    fetchInstructors()
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ProtexxaLearn
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 space-y-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Professional Learning
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Management System
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Comprehensive course management and online learning platform for instructors and students.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start Learning <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative h-96 md:h-full hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl" />
            <div className="absolute inset-4 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl border border-primary/10" />
            <div className="flex items-center justify-center h-full">
              <div className="relative">
                <BookOpen className="h-32 w-32 text-primary/20 absolute -inset-8" />
                <div className="text-8xl">📚</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold">Platform Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Full-featured LMS with course management, assessments, and progress tracking
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: "Course Management",
              description: "Create and organize courses with modules, lessons, and content",
            },
            {
              icon: Users,
              title: "User Management",
              description: "Role-based access for admins, instructors, and students",
            },
            {
              icon: BarChart3,
              title: "Analytics & Reporting",
              description: "Track progress, grades, and completion status",
            },
            {
              icon: Award,
              title: "Assessments & Grading",
              description: "Quizzes, assignments, and automated grading system",
            },
            {
              icon: Play,
              title: "SCORM Support",
              description: "Import and deliver SCORM-compliant content packages",
            },
            {
              icon: TrendingUp,
              title: "Progress Tracking",
              description: "Real-time tracking of student engagement and completion",
            },
          ].map((feature, i) => (
            <Card key={i} className="border-2 hover:border-primary/50 transition-all">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Meet Your Instructors Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold">Our Instructors</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Course creators and subject matter experts
          </p>
        </div>

        {loadingInstructors ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-4">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : instructors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">Instructors will be featured here soon</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors.map((instructor) => (
              <Card
                key={instructor.id}
                className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/50 group"
              >
                {/* Avatar Background */}
                <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-5 transition-opacity" />
                </div>

                {/* Content */}
                <CardHeader className="relative -mt-12 space-y-4">
                  {/* Avatar Circle */}
                  <div className="relative w-fit">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 ring-4 ring-background">
                      <div className="h-full w-full rounded-full bg-muted flex items-center justify-center text-4xl">
                        {instructor.avatar_url ? (
                          <img
                            src={instructor.avatar_url}
                            alt={instructor.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          instructor.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{instructor.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-primary/80">
                      <Award className="h-4 w-4" />
                      Expert Instructor
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {instructor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{instructor.bio}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{instructor.course_count}</div>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">{instructor.student_count}</div>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button className="w-full gap-2 group" asChild>
                    <a href="/register">
                      <span>View Courses</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>

                  {/* Contact */}
                  {instructor.email && (
                    <a
                      href={`mailto:${instructor.email}`}
                      className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Contact
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-8">
        <Card className="border-2 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader className="text-center space-y-4">
            <h3 className="text-3xl font-bold">Get Started</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create an account to access courses and learning materials
            </p>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Create Account <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold">ProtexxaLearn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Learning Management System Platform
            </p>
          </div>
          {[
            { title: "Product", links: ["Courses", "Instructors", "Pricing"] },
            { title: "Company", links: ["About", "Blog", "Careers"] },
            { title: "Learn", links: ["Documentation", "Help Center", "Contact"] },
          ].map((col, i) => (
            <div key={i} className="space-y-3">
              <h4 className="font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 ProtexxaLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
