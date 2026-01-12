"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Trash2, Copy, Eye } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/auth-store"

const courses = [
  {
    id: 1,
    title: "Advanced Threat Detection",
    branch: "Protexxa Defender",
    status: "Published",
    enrollments: 245,
    lastUpdated: "2026-01-05",
  },
  {
    id: 2,
    title: "Network Security Fundamentals",
    branch: "CyberNations",
    status: "Published",
    enrollments: 412,
    lastUpdated: "2026-01-03",
  },
  {
    id: 3,
    title: "Internal Security Protocols",
    branch: "Protexxa Internal",
    status: "Draft",
    enrollments: 0,
    lastUpdated: "2026-01-08",
  },
]

export function CourseManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [branchFilter, setBranchFilter] = useState("all")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const token = useAuthStore((s) => s.token)

  async function handleImport() {
    if (!file) return alert('Select an IMSCC file first')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('imscc', file)
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const res = await fetch(`${apiBase}/import-course`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Import failed')
      alert('Import completed: ' + (json.course?.title || json.message))
      setFile(null)
    } catch (err: any) {
      alert('Import error: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="mt-2 text-muted-foreground">Create and manage courses across all training branches</p>
        </div>
        <Link href="/admin/courses/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Course
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>Manage your course catalog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".imscc,application/zip"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Button onClick={handleImport} disabled={uploading}>
                {uploading ? 'Importing…' : 'Import IMSCC'}
              </Button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="defender">Protexxa Defender</SelectItem>
                <SelectItem value="cybernations">CyberNations</SelectItem>
                <SelectItem value="internal">Protexxa Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {course.branch}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.status === "Published" ? "default" : "secondary"}>{course.status}</Badge>
                    </TableCell>
                    <TableCell>{course.enrollments}</TableCell>
                    <TableCell className="text-muted-foreground">{course.lastUpdated}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
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
        </CardContent>
      </Card>
    </div>
  )
}
