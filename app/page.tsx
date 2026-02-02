"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  ArrowRight,
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

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
