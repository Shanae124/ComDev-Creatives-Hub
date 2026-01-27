"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Plus, Edit, Trash2, ChevronDown, ChevronUp, ArrowLeft, Play, FileText,
  Video as VideoIcon, Puzzle, BookOpen, Save, X, Copy
} from "lucide-react"

interface Module {
  id: number
  title: string
  description?: string
  sort_order: number
  lessons?: Lesson[]
}

interface Lesson {
  id: number
  module_id: number
  title: string
  content_html: string
  lesson_type: "reading" | "video" | "quiz" | "assignment" | "interactive"
  sort_order: number
  duration_minutes?: number
}

export default function LessonManagementPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id

  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [showNewLessonDialog, setShowNewLessonDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)
  const [newLessonModule, setNewLessonModule] = useState<number | null>(null)
  const [contentEditor, setContentEditor] = useState("")

  const LESSON_TYPES = [
    { value: "reading", label: "📖 Reading", icon: FileText },
    { value: "video", label: "🎥 Video", icon: VideoIcon },
    { value: "quiz", label: "❓ Quiz", icon: Puzzle },
    { value: "assignment", label: "✏️ Assignment", icon: BookOpen },
    { value: "interactive", label: "🎮 Interactive", icon: Play },
  ]

  useEffect(() => {
    loadCourseStructure()
  }, [courseId])

  const loadCourseStructure = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/courses/${courseId}/modules`
      )
      if (response.ok) {
        const data = await response.json()
        setModules(data)
        
        // Load all lessons
        const allLessons: Lesson[] = []
        data.forEach((module: Module) => {
          if (module.lessons) {
            allLessons.push(...module.lessons)
          }
        })
        setLessons(allLessons)
        
        // Expand first module by default
        if (data.length > 0) {
          setExpandedModules(new Set([data[0].id]))
        }
      }
    } catch (error) {
      console.error("Failed to load course structure:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const handleNewLesson = (moduleId: number) => {
    setNewLessonModule(moduleId)
    setEditingLesson(null)
    setContentEditor("")
    setShowNewLessonDialog(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setContentEditor(lesson.content_html)
    setSelectedLesson(lesson)
  }

  const handleSaveLesson = async () => {
    if (!editingLesson || (!editingLesson.id && !newLessonModule)) return

    try {
      if (editingLesson.id) {
        // Update existing lesson
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/lessons/${editingLesson.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: editingLesson.title,
              content_html: contentEditor,
              lesson_type: editingLesson.lesson_type,
              duration_minutes: editingLesson.duration_minutes,
            }),
          }
        )

        if (response.ok) {
          const updated = await response.json()
          setLessons((prev) =>
            prev.map((l) => (l.id === editingLesson.id ? updated : l))
          )
          setSelectedLesson(updated)
        }
      } else {
        // Create new lesson
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/lessons`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              module_id: newLessonModule,
              title: editingLesson.title,
              content_html: contentEditor,
              lesson_type: editingLesson.lesson_type,
              duration_minutes: editingLesson.duration_minutes || 15,
              sort_order: (lessons.filter((l) => l.module_id === newLessonModule).length || 0) + 1,
            }),
          }
        )

        if (response.ok) {
          const newLesson = await response.json()
          setLessons((prev) => [...prev, newLesson])
          loadCourseStructure() // Reload to update module structure
        }
      }

      setShowNewLessonDialog(false)
      setEditingLesson(null)
      setContentEditor("")
    } catch (error) {
      console.error("Failed to save lesson:", error)
    }
  }

  const handleDeleteLesson = async () => {
    if (!lessonToDelete?.id) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/lessons/${lessonToDelete.id}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        setLessons((prev) => prev.filter((l) => l.id !== lessonToDelete.id))
        setSelectedLesson(null)
        loadCourseStructure()
      }
    } catch (error) {
      console.error("Failed to delete lesson:", error)
    }

    setShowDeleteDialog(false)
    setLessonToDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course structure...</p>
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
              <h1 className="text-3xl font-bold">Lesson Management</h1>
              <p className="text-muted-foreground">Organize and edit course lessons</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module Navigation Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Modules</CardTitle>
                <CardDescription>{modules.length} modules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ScrollArea className="h-96">
                  {modules.map((module) => (
                    <div key={module.id} className="space-y-1 pr-4 mb-2">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors text-left"
                      >
                        <span className="font-medium text-sm truncate">{module.title}</span>
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>

                      {expandedModules.has(module.id) && (
                        <div className="ml-2 space-y-1">
                          {module.lessons?.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLesson(lesson)}
                              className={cn(
                                "w-full flex items-center gap-2 p-2 rounded text-left text-xs truncate transition-colors",
                                selectedLesson?.id === lesson.id
                                  ? "bg-primary/20 text-primary"
                                  : "hover:bg-muted"
                              )}
                            >
                              {lesson.lesson_type === "video" && <Video className="w-3 h-3" />}
                              {lesson.lesson_type === "reading" && <FileText className="w-3 h-3" />}
                              {lesson.lesson_type === "quiz" && <Quiz className="w-3 h-3" />}
                              <span>{lesson.title}</span>
                            </button>
                          ))}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleNewLesson(module.id)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Lesson
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Lesson Content Editor */}
          <div className="lg:col-span-3 space-y-6">
            {selectedLesson ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle>{selectedLesson.title}</CardTitle>
                        <CardDescription>
                          {LESSON_TYPES.find((t) => t.value === selectedLesson.lesson_type)?.label}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditLesson(selectedLesson)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setLessonToDelete(selectedLesson)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Type</Label>
                          <p className="font-medium capitalize">{selectedLesson.lesson_type}</p>
                        </div>
                        {selectedLesson.duration_minutes && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Duration</Label>
                            <p className="font-medium">{selectedLesson.duration_minutes} minutes</p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          Preview
                        </Label>
                        <iframe
                          srcDoc={selectedLesson.content_html}
                          className="w-full border rounded-lg bg-white"
                          style={{ minHeight: "400px", height: "500px" }}
                          sandbox="allow-scripts allow-same-origin allow-forms"
                          title={selectedLesson.title}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">
                    Select a lesson from the sidebar to view or edit its content
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Lesson Dialog */}
      <Dialog open={showNewLessonDialog || !!editingLesson} onOpenChange={(open) => {
        if (!open) {
          setShowNewLessonDialog(false)
          setEditingLesson(null)
          setContentEditor("")
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson?.id ? "Edit Lesson" : "Create New Lesson"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson?.id
                ? "Update lesson details and content"
                : "Add a new lesson to this module"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Title</Label>
              <Input
                id="lesson-title"
                placeholder="Enter lesson title..."
                value={editingLesson?.title || ""}
                onChange={(e) =>
                  setEditingLesson((prev) => (prev ? { ...prev, title: e.target.value } : null))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-type">Type</Label>
                <Select
                  value={editingLesson?.lesson_type || "reading"}
                  onValueChange={(value) =>
                    setEditingLesson((prev) =>
                      prev ? { ...prev, lesson_type: value as any } : null
                    )
                  }
                >
                  <SelectTrigger id="lesson-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LESSON_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  min="1"
                  placeholder="15"
                  value={editingLesson?.duration_minutes || ""}
                  onChange={(e) =>
                    setEditingLesson((prev) =>
                      prev ? { ...prev, duration_minutes: parseInt(e.target.value) || 0 } : null
                    )
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lesson-content">Content (HTML)</Label>
              <Textarea
                id="lesson-content"
                placeholder="<h2>Lesson Title</h2><p>Your content here...</p>"
                value={contentEditor}
                onChange={(e) => setContentEditor(e.target.value)}
                className="font-mono text-xs min-h-32"
              />
            </div>

            {contentEditor && (
              <div>
                <Label className="text-xs text-muted-foreground">Preview</Label>
                <iframe
                  srcDoc={contentEditor}
                  className="w-full border rounded-lg bg-white"
                  style={{ minHeight: "200px", height: "300px" }}
                  sandbox="allow-scripts allow-same-origin"
                  title="Content Preview"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewLessonDialog(false)
                setEditingLesson(null)
                setContentEditor("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveLesson} disabled={!editingLesson?.title}>
              <Save className="w-4 h-4 mr-2" />
              Save Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{lessonToDelete?.title}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLesson} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ")
}
