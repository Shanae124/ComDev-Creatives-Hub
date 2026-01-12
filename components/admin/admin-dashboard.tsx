"use client"

import { useState, useEffect } from "react"
import { courseAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye, Download, Users, BookOpen } from "lucide-react"
import Link from "next/link"

interface Course {
  id: number
  title: string
  description: string
  status: "draft" | "published" | "archived"
  created_by: number
  instructor_name?: string
  created_at: string
}

export function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all")
  const [error, setError] = useState("")
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await courseAPI.getAllAdmin()
      setCourses(response.data)
    } catch (err: any) {
      setError("Failed to load courses")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return

    try {
      await courseAPI.delete(id)
      setCourses(courses.filter((c) => c.id !== id))
    } catch (err) {
      setError("Failed to delete course")
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await courseAPI.update(id, { status: newStatus })
      setCourses(courses.map((c) => (c.id === id ? { ...c, status: newStatus as any } : c)))
    } catch (err) {
      setError("Failed to update course status")
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-700"
      case "draft":
        return "bg-yellow-500/20 text-yellow-700"
      case "archived":
        return "bg-gray-500/20 text-gray-700"
      default:
        return "bg-blue-500/20 text-blue-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Course Management Hub</h1>
          <p className="text-slate-400 mt-1">Create, manage, and organize your training courses</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold">
            <Plus className="w-4 h-4" />
            New Course
          </Button>
        </Link>
      </div>

      {error && (
        <Alert className="bg-red-950 border-red-700">
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Total Courses</p>
              <p className="text-3xl font-bold text-white">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Published</p>
              <p className="text-3xl font-bold text-green-400">{courses.filter((c) => c.status === "published").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Drafts</p>
              <p className="text-3xl font-bold text-yellow-400">{courses.filter((c) => c.status === "draft").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Quick Actions</p>
              <div className="flex gap-1 justify-center mt-2">
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  Import
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              />
            </div>
            <div className="flex gap-2">
              {["all", "draft", "published", "archived"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status as any)}
                  className={statusFilter === status ? "bg-blue-600" : "bg-slate-700 text-slate-300"}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Courses</CardTitle>
          <CardDescription>Manage your complete course catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400">No courses found</p>
              <Link href="/admin/courses/new">
                <Button className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Title</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Instructor</TableHead>
                    <TableHead className="text-slate-300">Enrollments</TableHead>
                    <TableHead className="text-slate-300">Modules</TableHead>
                    <TableHead className="text-slate-300">Created</TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course: any) => (
                    <TableRow key={course.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-medium text-white max-w-xs">
                        <div className="truncate">{course.title}</div>
                        {course.description && (
                          <div className="text-xs text-slate-400 truncate mt-1">{course.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getStatusColor(course.status)} border-0 cursor-pointer hover:opacity-80`}
                          onClick={() => {
                            const statuses = ['draft', 'published', 'archived'];
                            const currentIndex = statuses.indexOf(course.status);
                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                            handleStatusChange(course.id, nextStatus);
                          }}
                        >
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{course.instructor_name || "System"}</TableCell>
                      <TableCell className="text-slate-300">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrollment_count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">{course.module_count || 0}</TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(course.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-300">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem 
                              onClick={() => window.location.href = `/courses/${course.id}`}
                              className="text-slate-300 focus:bg-slate-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => window.location.href = `/admin/courses/${course.id}/edit`}
                              className="text-slate-300 focus:bg-slate-700"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700">
                              <Users className="w-4 h-4 mr-2" />
                              Enrollments ({course.enrollment_count || 0})
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(course.id, 'published')}
                              className="text-green-400 focus:bg-slate-700"
                            >
                              Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-400 focus:bg-slate-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-blue-950 border-blue-700">
        <CardHeader>
          <CardTitle className="text-blue-200">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-100 space-y-2">
          <p>• Click "New Course" to create a course with modules and upload files</p>
          <p>• Use the search and filters to quickly find courses</p>
          <p>• Change course status to publish or archive courses</p>
          <p>• Export courses for backup or sharing with team members</p>
        </CardContent>
      </Card>
    </div>
  )
}
