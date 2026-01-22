"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"

interface UserForm {
  id?: string
  email: string
  name: string
  role: "student" | "instructor" | "admin"
  status: "active" | "inactive" | "suspended"
}

export default function AdminUserPage({ params }: { params: { id?: string } }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const userId = params?.id
  const isNew = !userId || userId === "new"

  const [formData, setFormData] = useState<UserForm>({
    email: "",
    name: "",
    role: "student",
    status: "active",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (!isNew && userId) {
      const fetchUser = async () => {
        try {
          const token = useAuthStore.getState().token
          const response = await fetch(`/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            setFormData(await response.json())
          }
        } catch (err) {
          setError("Failed to load user")
        } finally {
          setLoading(false)
        }
      }
      fetchUser()
    }
  }, [userId, isNew])

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      const token = useAuthStore.getState().token
      const method = isNew ? "POST" : "PUT"
      const url = isNew ? "/api/admin/users" : `/api/admin/users/${userId}`

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/users")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save user")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {isNew ? "Create User" : "Edit User"}
              </h1>
              <p className="text-muted-foreground">
                {isNew ? "Add a new user to the system" : "Update user information"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save User"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
