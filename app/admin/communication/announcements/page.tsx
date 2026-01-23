"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bell, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface Announcement {
  id: number
  title: string
  content: string
  author: string
  date: string
  priority: "normal" | "urgent"
  pinned: boolean
  views: number
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "normal" as "normal" | "urgent",
    pinned: false
  })

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      router.push('/dashboard')
      return
    }
    fetchAnnouncements()
  }, [user])

  const fetchAnnouncements = async () => {
    try {
      // Mock data
      setAnnouncements([
        {
          id: 1,
          title: "Welcome to ProtexxaLearn!",
          content: "We're excited to have you in our learning platform...",
          author: "Admin",
          date: "2026-01-20",
          priority: "normal",
          pinned: true,
          views: 150
        },
        {
          id: 2,
          title: "Important: Course Schedule Update",
          content: "Please note the changes to next week's schedule...",
          author: "Admin",
          date: "2026-01-22",
          priority: "urgent",
          pinned: true,
          views: 98
        }
      ])
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  const createAnnouncement = async () => {
    // API call to create
    console.log("Creating announcement:", newAnnouncement)
    setIsCreateOpen(false)
    setNewAnnouncement({ title: "", content: "", priority: "normal", pinned: false })
  }

  const deleteAnnouncement = async (id: number) => {
    if (confirm("Delete this announcement?")) {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    }
  }

  const togglePin = async (id: number) => {
    setAnnouncements(prev =>
      prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a)
    )
  }

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) return null

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Announcements
          </h1>
          <p className="text-muted-foreground">Manage course-wide announcements</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
              <DialogDescription>Post a new announcement to all students</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Enter announcement content"
                  rows={6}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newAnnouncement.pinned}
                    onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, pinned: checked })}
                  />
                  <Label>Pin to top</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Priority:</Label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={createAnnouncement}>Post Announcement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading announcements...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {announcement.pinned && <Badge variant="outline">Pinned</Badge>}
                        <span className="font-medium">{announcement.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{announcement.author}</TableCell>
                    <TableCell>{new Date(announcement.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={announcement.priority === "urgent" ? "destructive" : "default"}>
                        {announcement.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {announcement.views}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(announcement.id)}
                      >
                        {announcement.pinned ? "Unpin" : "Pin"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(announcement.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
