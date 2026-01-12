import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Award, Target } from "lucide-react"

const stats = [
  {
    title: "Courses Enrolled",
    value: "8",
    change: "+2 this month",
    icon: BookOpen,
    color: "text-primary",
  },
  {
    title: "Hours Learned",
    value: "47.5",
    change: "+12.5 this week",
    icon: Clock,
    color: "text-secondary",
  },
  {
    title: "Certifications",
    value: "3",
    change: "2 in progress",
    icon: Award,
    color: "text-accent",
  },
  {
    title: "Completion Rate",
    value: "87%",
    change: "+5% from last month",
    icon: Target,
    color: "text-chart-2",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
