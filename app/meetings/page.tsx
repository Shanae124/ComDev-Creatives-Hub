'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Phone, Calendar, Users, Clock, MapPin } from 'lucide-react'

interface Meeting {
  id: number
  course_id: number
  course_title: string
  title: string
  scheduled_at: string
  duration_minutes: number
  meeting_url?: string
  meeting_type: 'zoom' | 'google_meet' | 'teams' | 'other'
  description?: string
  instructor_name: string
}

export default function MeetingsPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchMeetings()
  }, [isAuthenticated, router])

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/meetings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setMeetings(data || [])
      } else {
        setError("Failed to load meetings")
      }
    } catch (err) {
      console.error("Failed to fetch meetings:", err)
      setError("Failed to load meetings")
    } finally {
      setLoading(false)
    }
  }

  const isUpcoming = (meetingDate: string) => {
    return new Date(meetingDate) > new Date()
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMetingTypeBadge = (type: string) => {
    const badges: { [key: string]: string } = {
      'zoom': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'google_meet': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'teams': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
    return badges[type] || badges['other']
  }

  const upcomingMeetings = meetings.filter(m => isUpcoming(m.scheduled_at))
  const pastMeetings = meetings.filter(m => !isUpcoming(m.scheduled_at))

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Live Meetings</h1>
          <p className="text-muted-foreground">Join your class sessions and office hours</p>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading meetings...</p>
          </div>
        ) : (
          <>
            {/* Upcoming Meetings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Upcoming Meetings</h2>
                <Badge>{upcomingMeetings.length}</Badge>
              </div>

              {upcomingMeetings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Video className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming meetings scheduled</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{meeting.title}</h3>
                              <Badge className={getMetingTypeBadge(meeting.meeting_type)}>
                                {meeting.meeting_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{meeting.course_title}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(meeting.scheduled_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(meeting.scheduled_at)}
                              </div>
                              {meeting.duration_minutes && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {meeting.duration_minutes} min
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {meeting.instructor_name}
                              </div>
                            </div>

                            {meeting.description && (
                              <p className="text-sm text-muted-foreground italic">{meeting.description}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {meeting.meeting_url ? (
                              <Button asChild size="lg" className="gap-2">
                                <a href={meeting.meeting_url} target="_blank" rel="noreferrer">
                                  <Video className="h-4 w-4" />
                                  Join Meeting
                                </a>
                              </Button>
                            ) : (
                              <Button disabled size="lg" className="gap-2">
                                <Phone className="h-4 w-4" />
                                Meeting Link TBA
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Past Meetings */}
            {pastMeetings.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Past Meetings</h2>
                  <Badge variant="outline">{pastMeetings.length}</Badge>
                </div>

                <div className="grid gap-4">
                  {pastMeetings.map((meeting) => (
                    <Card key={meeting.id} className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-muted-foreground">{meeting.title}</h3>
                              <Badge variant="outline" className={getMetingTypeBadge(meeting.meeting_type)}>
                                {meeting.meeting_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{meeting.course_title}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(meeting.scheduled_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(meeting.scheduled_at)}
                              </div>
                            </div>
                          </div>

                          {meeting.meeting_url && (
                            <Button asChild variant="outline" size="sm">
                              <a href={meeting.meeting_url} target="_blank" rel="noreferrer">
                                Join Recording
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

