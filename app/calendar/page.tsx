"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Video, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: number
  title: string
  date: Date
  startTime?: string
  endTime?: string
  type: "assignment" | "meeting" | "deadline" | "class"
  description?: string
  location?: string
  color?: string
}

// Sample events - replace with API calls later
const sampleEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Networking Assignment Due",
    date: new Date(2026, 0, 28),
    startTime: "11:59 PM",
    type: "deadline",
    description: "Complete networking fundamentals assignment",
    color: "red"
  },
  {
    id: 2,
    title: "Office Hours",
    date: new Date(2026, 0, 27),
    startTime: "2:00 PM",
    endTime: "3:00 PM",
    type: "meeting",
    location: "Online - Zoom",
    color: "blue"
  },
  {
    id: 3,
    title: "Live Session: Security Basics",
    date: new Date(2026, 0, 29),
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    type: "class",
    location: "Virtual Classroom",
    color: "purple"
  },
  {
    id: 4,
    title: "Quiz: Module 3",
    date: new Date(2026, 0, 30),
    startTime: "9:00 AM",
    type: "assignment",
    description: "Complete Module 3 quiz on time",
    color: "orange"
  },
]

export default function CalendarPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents)
  const [view, setView] = useState<"month" | "agenda">("month")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "deadline": return "bg-red-500"
      case "meeting": return "bg-blue-500"
      case "class": return "bg-purple-500"
      case "assignment": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "deadline": return "destructive"
      case "meeting": return "default"
      case "class": return "secondary"
      case "assignment": return "outline"
      default: return "outline"
    }
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2 border border-border/50 bg-muted/20 min-h-[100px]" />
      )
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isCurrentDay = isToday(date)
      const isSelected = isSelectedDate(date)

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={cn(
            "p-2 border border-border/50 min-h-[100px] cursor-pointer transition-all hover:bg-accent/50",
            isCurrentDay && "bg-primary/5 border-primary/30",
            isSelected && "ring-2 ring-primary bg-primary/10"
          )}
        >
          <div className="flex flex-col h-full">
            <span
              className={cn(
                "text-sm font-semibold mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                isCurrentDay && "bg-primary text-primary-foreground"
              )}
            >
              {day}
            </span>
            <div className="space-y-1 flex-1 overflow-hidden">
              {dayEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded text-white truncate",
                    getEventTypeColor(event.type)
                  )}
                  title={event.title}
                >
                  {event.startTime && <span className="mr-1">{event.startTime}</span>}
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground px-1.5">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return days
  }

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">Manage your schedule and deadlines</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setView(view === "month" ? "agenda" : "month")}>
              {view === "month" ? "Agenda View" : "Month View"}
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {view === "month" ? (
                  <div className="space-y-2">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-0">
                      {dayNames.map(day => (
                        <div key={day} className="p-2 text-center font-semibold text-sm border border-border/50 bg-muted/50">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-0">
                      {renderCalendarDays()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="flex gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center justify-center min-w-[60px] border-r pr-3">
                          <span className="text-2xl font-bold">{event.date.getDate()}</span>
                          <span className="text-xs text-muted-foreground uppercase">
                            {monthNames[event.date.getMonth()].slice(0, 3)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold">{event.title}</h4>
                            <Badge variant={getEventTypeBadge(event.type) as any}>
                              {event.type}
                            </Badge>
                          </div>
                          {event.startTime && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {event.startTime}
                              {event.endTime && ` - ${event.endTime}`}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {selectedDate ? (
                    <>
                      {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                    </>
                  ) : (
                    "Select a Date"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).length > 0 ? (
                      getEventsForDate(selectedDate).map(event => (
                        <div key={event.id} className="p-3 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm">{event.title}</h4>
                            <Badge variant={getEventTypeBadge(event.type) as any} className="text-xs">
                              {event.type}
                            </Badge>
                          </div>
                          {event.startTime && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.startTime}
                              {event.endTime && ` - ${event.endTime}`}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              {event.type === "meeting" || event.type === "class" ? (
                                <Video className="w-3 h-3" />
                              ) : (
                                <MapPin className="w-3 h-3" />
                              )}
                              {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No events scheduled
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Click on a date to view events
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
                <CardDescription>Next events on your schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-start gap-2 text-sm p-2 rounded hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5", getEventTypeColor(event.type))} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {monthNames[event.date.getMonth()].slice(0, 3)} {event.date.getDate()}
                          {event.startTime && ` • ${event.startTime}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
