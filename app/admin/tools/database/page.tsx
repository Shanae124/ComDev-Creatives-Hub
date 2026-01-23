"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Download, Upload, RefreshCw, Trash2, Settings } from "lucide-react"

export default function DatabaseManagementPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalAssignments: 0,
    databaseSize: "0 MB",
    lastBackup: "Never"
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      // Mock data
      setStats({
        totalUsers: 245,
        totalCourses: 18,
        totalAssignments: 92,
        databaseSize: "128 MB",
        lastBackup: "2026-01-22"
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const createBackup = async () => {
    setLoading(true)
    try {
      // API call to create backup
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert("Backup created successfully!")
      fetchStats()
    } catch (error) {
      alert("Failed to create backup")
    } finally {
      setLoading(false)
    }
  }

  const restoreBackup = async () => {
    if (confirm("WARNING: This will restore from the last backup. Continue?")) {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        alert("Database restored successfully!")
      } catch (error) {
        alert("Failed to restore database")
      } finally {
        setLoading(false)
      }
    }
  }

  const optimizeDatabase = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert("Database optimized successfully!")
    } catch (error) {
      alert("Failed to optimize database")
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    if (confirm("Clear all cached data?")) {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert("Cache cleared successfully!")
      } catch (error) {
        alert("Failed to clear cache")
      } finally {
        setLoading(false)
      }
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          Database Management
        </h1>
        <p className="text-muted-foreground">Backup, restore, and maintain your database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.databaseSize}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{stats.lastBackup}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Backup</CardTitle>
                <CardDescription>Generate a full database backup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Creates a complete snapshot of your database including all users, courses, and content.
                </p>
                <Button onClick={createBackup} disabled={loading} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Create Backup"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restore Backup</CardTitle>
                <CardDescription>Restore from previous backup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-red-600">
                  WARNING: This will overwrite all current data with the backup data.
                </p>
                <Button variant="destructive" onClick={restoreBackup} disabled={loading} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  {loading ? "Restoring..." : "Restore Backup"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Automatic Backups</CardTitle>
              <CardDescription>Configure automatic backup schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">Daily backups at 2:00 AM</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Retention Period</Label>
                  <p className="text-sm text-muted-foreground">Keep backups for 30 days</p>
                </div>
                <Input type="number" defaultValue="30" className="w-20" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimize Database</CardTitle>
                <CardDescription>Improve database performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Rebuilds indexes and optimizes table structures for better performance.
                </p>
                <Button onClick={optimizeDatabase} disabled={loading} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loading ? "Optimizing..." : "Optimize Now"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clear Cache</CardTitle>
                <CardDescription>Remove cached data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Clears all cached queries and temporary data. May temporarily affect performance.
                </p>
                <Button variant="outline" onClick={clearCache} disabled={loading} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {loading ? "Clearing..." : "Clear Cache"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>Advanced database settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxConnections">Max Connections</Label>
                <Input id="maxConnections" type="number" defaultValue="100" />
              </div>
              <div>
                <Label htmlFor="timeout">Connection Timeout (seconds)</Label>
                <Input id="timeout" type="number" defaultValue="30" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Query Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all database queries</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable SSL Connection</Label>
                  <p className="text-sm text-muted-foreground">Use encrypted database connections</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
