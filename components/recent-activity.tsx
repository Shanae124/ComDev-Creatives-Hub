"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  timestamp: Date
  read: boolean
}

interface RecentActivityProps {
  notifications?: Notification[]
}

export function RecentActivity({ notifications = [] }: RecentActivityProps) {
  const typeColors = {
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-sm">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`transition-colors ${!notification.read ? "border-l-4 border-l-blue-500" : ""}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${typeColors[notification.type]}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
