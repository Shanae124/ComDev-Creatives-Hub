"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus, Edit, Trash2, Play, ArrowLeft, Clock, Eye, Video as VideoIcon, ExternalLink, Link as LinkIcon
} from "lucide-react"

interface VideoLesson {
  id: number
  module_id: number
  title: string
  lesson_type: "video"
  video_url: string
  description?: string
  duration_minutes?: number
  thumbnail_url?: string
  sort_order: number
}

interface Module {
  id: number
  title: string
  description?: string
}

export default function VideoManagementPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id

  const [modules, setModules] = useState<Module[]>([])
  const [videos, setVideos] = useState<VideoLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoLesson | null>(null)
  const [selectedModule, setSelectedModule] = useState<string>("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<VideoLesson | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    duration_minutes: 15,
    module_id: "",
  })

  useEffect(() => {
    loadData()
  }, [courseId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load modules
      const modulesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/courses/${courseId}/modules`
      )
      if (modulesResponse.ok) {
        const data = await modulesResponse.json()
        setModules(data)
        if (data.length > 0 && !selectedModule) {
          setSelectedModule(String(data[0].id))
          setFormData((prev) => ({ ...prev, module_id: String(data[0].id) }))
        }
      }

      // Load videos (from lessons with type='video')
      const videoResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/courses/${courseId}/videos`
      )
      if (videoResponse.ok) {
        const videoData = await videoResponse.json()
        setVideos(videoData)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (video?: VideoLesson) => {
    if (video) {
      setEditingVideo(video)
      setFormData({
        title: video.title,
        description: video.description || "",
        video_url: video.video_url,
        duration_minutes: video.duration_minutes || 15,
        module_id: String(video.module_id),
      })
      setSelectedModule(String(video.module_id))
    } else {
      setEditingVideo(null)
      setFormData({
        title: "",
        description: "",
        video_url: "",
        duration_minutes: 15,
        module_id: selectedModule || "",
      })
    }
    setShowDialog(true)
  }

  const handleSaveVideo = async () => {
    if (!formData.title || !formData.video_url || !formData.module_id) {
      alert("Please fill in all required fields")
      return
    }

    try {
      if (editingVideo?.id) {
        // Update existing video
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/lessons/${editingVideo.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              content_html: `<div class="video-container"><iframe src="${formData.video_url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`,
              lesson_type: "video",
              duration_minutes: formData.duration_minutes,
            }),
          }
        )

        if (response.ok) {
          const updated = await response.json()
          setVideos((prev) =>
            prev.map((v) => (v.id === editingVideo.id ? { ...v, ...formData } : v))
          )
        }
      } else {
        // Create new video lesson
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/lessons`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              module_id: parseInt(formData.module_id),
              title: formData.title,
              content_html: `<div class="video-container"><iframe src="${formData.video_url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`,
              lesson_type: "video",
              duration_minutes: formData.duration_minutes,
              sort_order: (videos.length || 0) + 1,
            }),
          }
        )

        if (response.ok) {
          const newVideo = await response.json()
          setVideos((prev) => [...prev, newVideo])
        }
      }

      setShowDialog(false)
      setEditingVideo(null)
    } catch (error) {
      console.error("Failed to save video:", error)
      alert("Failed to save video. Please try again.")
    }
  }

  const handleDeleteVideo = async () => {
    if (!videoToDelete?.id) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/lessons/${videoToDelete.id}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== videoToDelete.id))
      }
    } catch (error) {
      console.error("Failed to delete video:", error)
      alert("Failed to delete video. Please try again.")
    }

    setShowDeleteDialog(false)
    setVideoToDelete(null)
  }

  const isValidYouTubeUrl = (url: string) => {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("youtube-nocookie.com")
    )
  }

  const isValidVimeoUrl = (url: string) => {
    return url.includes("vimeo.com")
  }

  const getVideoProvider = (url: string) => {
    if (isValidYouTubeUrl(url)) return "YouTube"
    if (isValidVimeoUrl(url)) return "Vimeo"
    return "Video"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Video Management</h1>
              <p className="text-muted-foreground">Add and manage video lessons</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Video Lesson
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{videos.length}</p>
                <p className="text-sm text-muted-foreground">Video Lessons</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{modules.length}</p>
                <p className="text-sm text-muted-foreground">Modules</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {videos.reduce((sum, v) => sum + (v.duration_minutes || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative bg-black h-32 flex items-center justify-center group">
                  <PlayIcon className="w-12 h-12 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={video.thumbnail_url || "https://via.placeholder.com/300x169?text=Video"}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {modules.find((m) => m.id === video.module_id)?.title || "Unknown Module"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {getVideoProvider(video.video_url)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  {video.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{video.duration_minutes || 15} minutes</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDialog(video)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setVideoToDelete(video)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <VideoIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No video lessons yet. Create one to get started!
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Video
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Video Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingVideo?.id ? "Edit Video" : "Add Video Lesson"}</DialogTitle>
            <DialogDescription>
              {editingVideo?.id
                ? "Update video details"
                : "Add a new video lesson to your course"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="module">Module *</Label>
              <Select
                value={formData.module_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, module_id: value }))
                }
              >
                <SelectTrigger id="module">
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={String(module.id)}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Video Title *</Label>
              <Input
                id="title"
                placeholder="Enter video title..."
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="video-url">Video URL *</Label>
              <div className="space-y-2">
                <Input
                  id="video-url"
                  placeholder="https://www.youtube.com/embed/... or https://vimeo.com/..."
                  value={formData.video_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, video_url: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Supports: YouTube, YouTube Nocookie, Vimeo, and other embed URLs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="15"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration_minutes: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the video content..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-24"
              />
            </div>

            {formData.video_url && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%", height: 0 }}>
                  <iframe
                    src={formData.video_url}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video Preview"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVideo} disabled={!formData.title || !formData.video_url}>
              {editingVideo?.id ? "Update Video" : "Create Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{videoToDelete?.title}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVideo} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function PlayIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
