"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, CheckCircle2, TrendingUp } from "lucide-react"
import { StatsCards } from "@/components/stats-cards"
import { CourseGrid } from "@/components/course-grid"
import { Shield } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

export function DashboardContent() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || "Learner"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {"Continue your cybersecurity journey. You're making great progress!"}
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">Advanced Network Security</h3>
                      <p className="text-sm text-muted-foreground">Firewall Configuration & IDS</p>
                    </div>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Chapter 4 of 8</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-2">
                      <Play className="h-4 w-4" />
                      Continue
                    </Button>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      2h 15m left
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Learning Streak
            </CardTitle>
            <CardDescription>Keep up the momentum!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">days in a row</div>
            </div>
            <div className="flex justify-center gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={cn("h-8 w-8 rounded-md", i < 5 ? "bg-secondary" : "bg-muted")} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-1 text-sm">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">New personal best!</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CourseGrid />
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
