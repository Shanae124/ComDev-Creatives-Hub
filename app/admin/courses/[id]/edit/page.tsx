"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { courseAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const courseId = params.id
  const editorRef = useRef<HTMLDivElement>(null)
  
  const [course, setCourse] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  const loadCourse = async () => {
    try {
      const response = await courseAPI.getById(courseId as string)
      const data = response.data
      setCourse(data)
      setTitle(data.title || "")
      setDescription(data.description || "")
      setContent(data.content_html || "")
    } catch (err) {
      console.error("Failed to load course", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const htmlContent = editorRef.current?.innerHTML || content
      await courseAPI.update(courseId as string, {
        title,
        description,
        content_html: htmlContent,
      })
      alert("Course saved successfully!")
    } catch (err) {
      console.error("Save failed:", err)
      alert("Failed to save course")
    } finally {
      setSaving(false)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const insertHTML = (html: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      const fragment = range.createContextualFragment(html)
      range.insertNode(fragment)
    }
  }

  const addButton = () => {
    insertHTML(`<button style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; margin: 8px 0;" onclick="alert('Button clicked!')">Click Me</button>`)
  }

  const addNavigation = () => {
    insertHTML(`
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px; border-radius: 12px; margin: 24px 0;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;" onclick="alert('Section 1')">Introduction</button>
          <button style="background: transparent; color: white; padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;" onclick="alert('Section 2')">Technical Writing</button>
          <button style="background: transparent; color: white; padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;" onclick="alert('Section 3')">Communication</button>
        </div>
      </div>
    `)
  }

  const addVideo = () => {
    const url = prompt("Enter YouTube or video URL:")
    if (url) {
      let embedUrl = url
      if (url.includes("youtube.com/watch")) {
        const videoId = url.split("v=")[1]?.split("&")[0]
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      }
      insertHTML(`<iframe width="100%" height="400" src="${embedUrl}" frameborder="0" allowfullscreen style="border-radius: 8px; margin: 16px 0;"></iframe>`)
    }
  }

  const addIframe = () => {
    const url = prompt("Enter webpage URL to embed:")
    if (url) {
      insertHTML(`<iframe src="${url}" width="100%" height="600" frameborder="0" style="border-radius: 8px; margin: 16px 0;"></iframe>`)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Course"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Info */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                  className="text-lg font-semibold"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief course description"
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div>
              <Label>Page Content</Label>
              
              {/* Toolbar */}
              <div className="border rounded-t-lg bg-muted p-2 flex flex-wrap gap-1">
                {/* Text Formatting */}
                <select
                  className="px-2 py-1 border rounded text-sm"
                  onChange={(e) => execCommand("formatBlock", e.target.value)}
                  defaultValue=""
                >
                  <option value="">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="h4">Heading 4</option>
                </select>

                <select
                  className="px-2 py-1 border rounded text-sm"
                  onChange={(e) => execCommand("fontSize", e.target.value)}
                  defaultValue="3"
                >
                  <option value="1">10px</option>
                  <option value="2">13px</option>
                  <option value="3">16px</option>
                  <option value="4">18px</option>
                  <option value="5">24px</option>
                  <option value="6">32px</option>
                  <option value="7">48px</option>
                </select>

                <div className="h-6 w-px bg-border mx-1" />

                <Button size="sm" variant="ghost" onClick={() => execCommand("bold")} title="Bold">
                  <strong>B</strong>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => execCommand("italic")} title="Italic">
                  <em>I</em>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => execCommand("underline")} title="Underline">
                  <u>U</u>
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <Button size="sm" variant="ghost" onClick={() => execCommand("justifyLeft")} title="Align Left">
                  ☰
                </Button>
                <Button size="sm" variant="ghost" onClick={() => execCommand("justifyCenter")} title="Center">
                  ☷
                </Button>
                <Button size="sm" variant="ghost" onClick={() => execCommand("justifyRight")} title="Align Right">
                  ☰
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <Button size="sm" variant="ghost" onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
                  • List
                </Button>
                <Button size="sm" variant="ghost" onClick={() => execCommand("insertOrderedList")} title="Numbered List">
                  1. List
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <input
                  type="color"
                  className="w-8 h-8 border rounded cursor-pointer"
                  onChange={(e) => execCommand("foreColor", e.target.value)}
                  title="Text Color"
                />
                <input
                  type="color"
                  className="w-8 h-8 border rounded cursor-pointer"
                  onChange={(e) => execCommand("backColor", e.target.value)}
                  title="Background Color"
                />

                <div className="h-6 w-px bg-border mx-1" />

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const url = prompt("Enter link URL:")
                    if (url) execCommand("createLink", url)
                  }}
                  title="Insert Link"
                >
                  🔗
                </Button>

                <Button size="sm" variant="ghost" onClick={addVideo} title="Embed Video">
                  🎥
                </Button>

                <Button size="sm" variant="ghost" onClick={addIframe} title="Embed Webpage">
                  🌐
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <Button size="sm" variant="secondary" onClick={addButton} title="Add Button">
                  Button
                </Button>

                <Button size="sm" variant="secondary" onClick={addNavigation} title="Add Navigation">
                  Nav Tabs
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Clear all content?")) {
                      if (editorRef.current) editorRef.current.innerHTML = ""
                    }
                  }}
                  title="Clear"
                >
                  🗑️
                </Button>
              </div>

              {/* Editor Area */}
              <div
                ref={editorRef}
                contentEditable
                className="min-h-[500px] border border-t-0 rounded-b-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary"
                dangerouslySetInnerHTML={{ __html: content }}
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                style={{
                  lineHeight: "1.6",
                  fontSize: "16px",
                }}
              />
            </div>

            {/* Quick Insert Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Insert Templates</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertHTML(`
                    <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 48px 32px; border-radius: 12px; margin: 24px 0; text-align: center;">
                      <h1 style="font-size: 48px; font-weight: bold; margin-bottom: 16px;">Course Title</h1>
                      <p style="font-size: 20px; opacity: 0.9;">Master the skills you need to succeed</p>
                    </div>
                  `)}
                >
                  Hero Banner
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertHTML(`
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 24px 0;">
                      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
                        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Feature 1</h3>
                        <p style="color: #6b7280;">Description of this feature</p>
                      </div>
                      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
                        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Feature 2</h3>
                        <p style="color: #6b7280;">Description of this feature</p>
                      </div>
                      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
                        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Feature 3</h3>
                        <p style="color: #6b7280;">Description of this feature</p>
                      </div>
                    </div>
                  `)}
                >
                  Feature Grid
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertHTML(`
                    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;">
                      <strong style="color: #1e40af;">💡 Pro Tip:</strong>
                      <p style="margin: 8px 0 0 0; color: #1e3a8a;">Add your helpful tip or note here</p>
                    </div>
                  `)}
                >
                  Info Box
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertHTML(`
                    <div style="background: #1e293b; color: white; padding: 24px; border-radius: 12px; margin: 24px 0;">
                      <h2 style="font-size: 32px; font-weight: bold; margin-bottom: 24px; color: #06b6d4;">Course Introduction</h2>
                      <p style="font-size: 18px; line-height: 1.8; margin-bottom: 16px;">Welcome to this comprehensive course. In this program, you'll learn:</p>
                      <ul style="list-style: none; padding: 0;">
                        <li style="padding: 8px 0; font-size: 16px;">✓ Core concepts and fundamentals</li>
                        <li style="padding: 8px 0; font-size: 16px;">✓ Hands-on practical exercises</li>
                        <li style="padding: 8px 0; font-size: 16px;">✓ Real-world applications</li>
                      </ul>
                    </div>
                  `)}
                >
                  Course Intro
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
