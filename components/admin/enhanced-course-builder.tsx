"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { courseAPI, moduleAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, FileUp, BookOpen, Loader2 } from "lucide-react"

export function EnhancedCourseBuilder() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  // Course form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contentHtml, setContentHtml] = useState("")
  const [status, setStatus] = useState("draft")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  // Module state
  const [courseId, setCourseId] = useState<number | null>(null)
  const [modules, setModules] = useState<Array<{ id: number; title: string; description: string }>>([])
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleDesc, setModuleDesc] = useState("")

  // File upload state
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string }>>([])

  // Create course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("Course title is required")
      return
    }

    setLoading(true)
    try {
      const response = await courseAPI.create({
        title,
        description,
        content_html: contentHtml,
        status,
        thumbnail_url: thumbnailUrl,
      })

      setCourseId(response.data.id)
      setSuccess(`✅ Course "${title}" created successfully! You can now add modules below.`)
      
      // Scroll to modules tab
      setTimeout(() => {
        const modulesTab = document.querySelector('[value="modules"]')
        if (modulesTab) {
          (modulesTab as HTMLElement).click()
        }
      }, 500)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create course")
    } finally {
      setLoading(false)
    }
  }

  // Add module
  const handleAddModule = async () => {
    if (!moduleTitle.trim() || !courseId) {
      setError("Module title and course are required")
      return
    }

    setLoading(true)
    try {
      const response = await moduleAPI.create({
        course_id: courseId,
        title: moduleTitle,
        description: moduleDesc,
      })

      setModules([
        ...modules,
        {
          id: response.data.id,
          title: moduleTitle,
          description: moduleDesc,
        },
      ])
      setModuleTitle("")
      setModuleDesc("")
      setSuccess("Module added successfully!")
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add module")
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async () => {
    if (!fileToUpload || !courseId) {
      setError("Select a file and ensure course is created")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", fileToUpload)
      formData.append("courseId", courseId.toString())

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await response.json()
      setUploadedFiles([
        ...uploadedFiles,
        {
          name: fileToUpload.name,
          url: data.url,
        },
      ])
      setFileToUpload(null)
      setSuccess("File uploaded successfully!")
    } catch (err: any) {
      setError(err.message || "File upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Course</h1>
        <p className="text-slate-400">Build and manage your training content with modules and files</p>
      </div>

      <Tabs defaultValue="course" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="course" className="text-slate-300 data-[state=active]:text-white">
            <BookOpen className="w-4 h-4 mr-2" />
            Course Info
          </TabsTrigger>
          <TabsTrigger value="modules" className="text-slate-300 data-[state=active]:text-white" disabled={!courseId}>
            <Plus className="w-4 h-4 mr-2" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="files" className="text-slate-300 data-[state=active]:text-white" disabled={!courseId}>
            <FileUp className="w-4 h-4 mr-2" />
            Files
          </TabsTrigger>
        </TabsList>

        {/* Course Tab */}
        <TabsContent value="course" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Course Details</CardTitle>
              <CardDescription>Create the foundation of your course</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                {error && (
                  <Alert className="bg-red-950 border-red-700">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-950 border-green-700">
                    <AlertDescription className="text-green-200">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">
                    Course Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Advanced Threat Detection"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">
                    Course Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail" className="text-slate-300">
                    Thumbnail URL (optional)
                  </Label>
                  <Input
                    id="thumbnail"
                    placeholder="https://example.com/image.jpg"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-300">
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="draft" className="text-white">
                        Draft
                      </SelectItem>
                      <SelectItem value="published" className="text-white">
                        Published
                      </SelectItem>
                      <SelectItem value="archived" className="text-white">
                        Archived
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-slate-300">
                    Course Content (HTML)
                    <span className="ml-2 text-xs text-slate-400">Supports full HTML with styling</span>
                  </Label>
                  
                  {/* HTML Toolbar */}
                  <div className="flex flex-wrap gap-2 p-2 bg-slate-800 border border-slate-600 rounded-lg mb-2">
                    <button
                      type="button"
                      onClick={() => setContentHtml(contentHtml + '<h1>Heading 1</h1>\n')}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentHtml(contentHtml + '<h2>Heading 2</h2>\n')}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentHtml(contentHtml + '<p>Paragraph text here...</p>\n')}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white"
                    >
                      P
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentHtml(contentHtml + '<strong>Bold text</strong> ')}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white font-bold"
                    >
                      Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentHtml(contentHtml + '<em>Italic text</em> ')}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white italic"
                    >
                      Italic
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentHtml(contentHtml + '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n')}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white"
                    >
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentHtml(contentHtml + '<blockquote>Quote text</blockquote>\n')}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white"
                    >
                      Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentHtml(contentHtml + '<code>Code snippet</code> ')}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white font-mono"
                    >
                      Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentHtml(contentHtml + '<div class="bg-blue-500/10 border border-blue-500 rounded-lg p-4 my-4">\n  <h3>Info Box</h3>\n  <p>Content here...</p>\n</div>\n')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white"
                    >
                      Info Box
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs text-white ml-auto"
                    >
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                  </div>

                  <Textarea
                    id="content"
                    placeholder="<h2>Introduction</h2><p>Your content here...</p>"
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 min-h-32 font-mono text-sm"
                  />

                  {/* Live Preview */}
                  {showPreview && contentHtml && (
                    <div className="mt-2">
                      <Label className="text-slate-300 text-xs mb-2 block">Live Preview:</Label>
                      <div className="border border-slate-600 rounded-lg p-4 bg-slate-800/50 max-h-96 overflow-y-auto">
                        <div 
                          className="prose prose-slate dark:prose-invert max-w-none 
                                    prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                                    prose-p:text-slate-300 prose-p:leading-relaxed
                                    prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                                    prose-strong:text-slate-100 prose-strong:font-semibold
                                    prose-code:bg-slate-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-slate-200
                                    prose-pre:bg-slate-700 prose-pre:border prose-pre:border-slate-600
                                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4
                                    prose-ul:list-disc prose-ol:list-decimal"
                          dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Add Modules</CardTitle>
              <CardDescription>Organize your course into modules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="bg-red-950 border-red-700">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-950 border-green-700">
                  <AlertDescription className="text-green-200">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="moduleName" className="text-slate-300">
                  Module Title *
                </Label>
                <Input
                  id="moduleName"
                  placeholder="e.g., Module 1: Fundamentals"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moduleDesc" className="text-slate-300">
                  Module Description
                </Label>
                <Textarea
                  id="moduleDesc"
                  placeholder="Describe the module content..."
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 min-h-20"
                />
              </div>

              <Button
                onClick={handleAddModule}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </>
                )}
              </Button>

              {modules.length > 0 && (
                <div className="space-y-2 mt-6">
                  <h3 className="text-white font-semibold">Added Modules:</h3>
                  {modules.map((mod) => (
                    <div key={mod.id} className="bg-slate-700 p-3 rounded border border-slate-600">
                      <p className="text-white font-medium">{mod.title}</p>
                      {mod.description && <p className="text-slate-400 text-sm">{mod.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Upload Course Files</CardTitle>
              <CardDescription>Add resources, videos, documents, and media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="bg-red-950 border-red-700">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-950 border-green-700">
                  <AlertDescription className="text-green-200">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="file" className="text-slate-300">
                  Select File
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png,.gif,.mp4,.zip"
                    className="bg-slate-700 border-slate-600 text-slate-300"
                  />
                  <Button
                    onClick={handleFileUpload}
                    disabled={uploading || !fileToUpload}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold whitespace-nowrap"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-6">
                  <h3 className="text-white font-semibold">Uploaded Files:</h3>
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-700 p-3 rounded border border-slate-600 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-slate-400 text-xs break-all">{file.url}</p>
                      </div>
                      <FileUp className="w-5 h-5 text-cyan-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {courseId && (
        <Card className="bg-green-950 border-green-700">
          <CardContent className="pt-6">
            <p className="text-green-200 font-semibold">
              ✅ Course Created! (ID: {courseId}) - You can now add modules and upload files
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
