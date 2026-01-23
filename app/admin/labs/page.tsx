"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Zap, Plus, Edit, Trash2, Upload, Code, FileText } from "lucide-react"

interface Lab {
  id: number
  title: string
  description: string
  lab_type: string
  status: string
  difficulty: string
  course_id: number
  created_at: string
}

export default function LabManagementPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])

  const [newLab, setNewLab] = useState({
    course_id: "",
    module_id: "",
    title: "",
    description: "",
    lab_type: "interactive",
    html_content: "",
    difficulty: "intermediate",
    duration_minutes: ""
  })

  const [courseImport, setCourseImport] = useState({
    course_title: "",
    course_description: "",
    html_files: [] as File[]
  })

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      router.push('/dashboard')
      return
    }
    fetchLabs()
    fetchCourses()
  }, [user])

  const fetchLabs = async () => {
    try {
      const response = await fetch('/admin/labs')
      const data = await response.json()
      setLabs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch labs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/admin/courses')
      const data = await response.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    }
  }

  const fetchModules = async (courseId: string) => {
    try {
      const response = await fetch(`/courses/${courseId}/modules`)
      const data = await response.json()
      setModules(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch modules:", error)
    }
  }

  const handleCourseChange = (courseId: string) => {
    setNewLab({ ...newLab, course_id: courseId, module_id: "" })
    fetchModules(courseId)
  }

  const createLab = async () => {
    if (!newLab.course_id || !newLab.title) {
      alert("Course and title are required")
      return
    }

    try {
      const response = await fetch('/admin/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLab)
      })

      if (response.ok) {
        setIsCreateOpen(false)
        setNewLab({
          course_id: "",
          module_id: "",
          title: "",
          description: "",
          lab_type: "interactive",
          html_content: "",
          difficulty: "intermediate",
          duration_minutes: ""
        })
        fetchLabs()
        alert("Lab created successfully!")
      }
    } catch (error) {
      alert("Failed to create lab")
    }
  }

  const deleteLab = async (id: number) => {
    if (!confirm("Delete this lab?")) return

    try {
      await fetch(`/admin/labs/${id}`, { method: 'DELETE' })
      fetchLabs()
    } catch (error) {
      alert("Failed to delete lab")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setCourseImport({
      ...courseImport,
      html_files: Array.from(files)
    })
  }

  const importHTMLCourse = async () => {
    if (!courseImport.course_title || courseImport.html_files.length === 0) {
      alert("Course title and HTML files are required")
      return
    }

    try {
      // Process HTML files to extract content
      const modules_html = []

      for (const file of courseImport.html_files) {
        const text = await file.text()
        
        // Extract title and description from HTML
        const titleMatch = text.match(/<h1[^>]*>([^<]+)<\/h1>/)
        const descMatch = text.match(/<p[^>]*class="subtitle"[^>]*>([^<]+)<\/p>/)

        modules_html.push({
          title: titleMatch ? titleMatch[1].trim() : file.name,
          description: descMatch ? descMatch[1].trim() : "",
          html_content: text,
          objectives: []
        })
      }

      const response = await fetch('/admin/import-html-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_title: courseImport.course_title,
          course_description: courseImport.course_description,
          modules_html
        })
      })

      if (response.ok) {
        setIsUploadOpen(false)
        setCourseImport({
          course_title: "",
          course_description: "",
          html_files: []
        })
        fetchLabs()
        alert("Course imported successfully!")
      }
    } catch (error) {
      alert("Failed to import course")
      console.error(error)
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Lab Management
          </h1>
          <p className="text-muted-foreground">Create and manage interactive labs and activities</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Import HTML Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import HTML Course Pages</DialogTitle>
                <DialogDescription>Upload HTML files to create a complete course</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="course-title">Course Title</Label>
                  <Input
                    id="course-title"
                    value={courseImport.course_title}
                    onChange={(e) => setCourseImport({ ...courseImport, course_title: e.target.value })}
                    placeholder="e.g., DTS NETWORKING BASIC"
                  />
                </div>
                <div>
                  <Label htmlFor="course-desc">Course Description</Label>
                  <Textarea
                    id="course-desc"
                    value={courseImport.course_description}
                    onChange={(e) => setCourseImport({ ...courseImport, course_description: e.target.value })}
                    placeholder="Optional course description"
                  />
                </div>
                <div>
                  <Label htmlFor="html-files">HTML Files (each file = 1 module)</Label>
                  <Input
                    id="html-files"
                    type="file"
                    multiple
                    accept=".html"
                    onChange={handleFileUpload}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {courseImport.html_files.length} file(s) selected
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                <Button onClick={importHTMLCourse}>Import Course</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Lab
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Lab</DialogTitle>
                <DialogDescription>Add an interactive lab or activity</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course *</Label>
                    <Select value={newLab.course_id} onValueChange={handleCourseChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {modules.length > 0 && (
                    <div>
                      <Label htmlFor="module">Module</Label>
                      <Select value={newLab.module_id} onValueChange={(val) => setNewLab({ ...newLab, module_id: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                          {modules.map(module => (
                            <SelectItem key={module.id} value={module.id.toString()}>
                              {module.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="title">Lab Title *</Label>
                  <Input
                    id="title"
                    value={newLab.title}
                    onChange={(e) => setNewLab({ ...newLab, title: e.target.value })}
                    placeholder="Lab title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newLab.description}
                    onChange={(e) => setNewLab({ ...newLab, description: e.target.value })}
                    placeholder="Lab description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="lab-type">Lab Type</Label>
                    <Select value={newLab.lab_type} onValueChange={(val) => setNewLab({ ...newLab, lab_type: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interactive">Interactive</SelectItem>
                        <SelectItem value="simulation">Simulation</SelectItem>
                        <SelectItem value="practice">Practice</SelectItem>
                        <SelectItem value="hands-on">Hands-on</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={newLab.difficulty} onValueChange={(val) => setNewLab({ ...newLab, difficulty: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newLab.duration_minutes}
                      onChange={(e) => setNewLab({ ...newLab, duration_minutes: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="html">HTML Content</Label>
                  <Textarea
                    id="html"
                    value={newLab.html_content}
                    onChange={(e) => setNewLab({ ...newLab, html_content: e.target.value })}
                    placeholder="Paste HTML code here (or upload a file)"
                    rows={10}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={createLab}>Create Lab</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Labs Library</CardTitle>
          <CardDescription>All interactive labs and activities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading labs...</div>
          ) : labs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labs.map(lab => (
                  <TableRow key={lab.id}>
                    <TableCell className="font-medium">{lab.title}</TableCell>
                    <TableCell>{lab.course_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lab.lab_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lab.difficulty === 'beginner' ? 'secondary' : lab.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                        {lab.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lab.status === 'published' ? 'default' : 'outline'}>
                        {lab.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(lab.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/labs/${lab.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteLab(lab.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No labs created yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
