"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  MessageSquare,
  Wrench,
  Calendar,
  FileText,
  Link as LinkIcon,
  Award,
  BarChart,
  Shield,
  Database,
  Bell,
  Globe
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "ProtexxaLearn",
    siteUrl: "",
    allowRegistration: true,
    requireEmailVerification: false,
    defaultCourseAvailability: "immediate",
    maxFileUploadSize: 50,
    sessionTimeout: 480,
    maintenanceMode: false,
    enableDiscussions: true,
    enableAnnouncements: true,
    enableAssignments: true,
    enableQuizzes: true,
    enableGrades: true,
    enableAttendance: true,
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSave = async (section: string) => {
    setLoading(true)
    try {
      // API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated
      alert(`${section} settings saved successfully!`)
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Course Administration</h1>
        <p className="text-muted-foreground">Manage your LMS settings, courses, users, and system tools</p>
      </div>

      <Tabs defaultValue="site" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="site">Site Setup</TabsTrigger>
          <TabsTrigger value="learner">Learner Management</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="tools">Admin Tools</TabsTrigger>
        </TabsList>

        {/* SITE SETUP TAB */}
        <TabsContent value="site" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* System Settings */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Settings className="h-6 w-6 mb-2 text-blue-500" />
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure global system settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/system')}>
                  Configure
                </Button>
              </CardContent>
            </Card>

            {/* Site Configuration */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-6 w-6 mb-2 text-green-500" />
                <CardTitle>Site Configuration</CardTitle>
                <CardDescription>Basic site settings and branding</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/site-config')}>
                  Configure Site
                </Button>
              </CardContent>
            </Card>

            {/* Availability Dates */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-6 w-6 mb-2 text-green-500" />
                <CardTitle>Availability Dates</CardTitle>
                <CardDescription>Default date settings for courses</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/availability')}>
                  Manage Dates
                </Button>
              </CardContent>
            </Card>

            {/* Course Builder */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-6 w-6 mb-2 text-purple-500" />
                <CardTitle>Course Builder</CardTitle>
                <CardDescription>Template and course structure tools</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/course-builder')}>
                  Build Courses
                </Button>
              </CardContent>
            </Card>

            {/* Content Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-6 w-6 mb-2 text-orange-500" />
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage course content and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/content')}>
                  Manage Content
                </Button>
              </CardContent>
            </Card>

            {/* Calendar Settings */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-6 w-6 mb-2 text-red-500" />
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Academic calendar and events</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/calendar')}>
                  Configure Calendar
                </Button>
              </CardContent>
            </Card>

            {/* External Tools */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-6 w-6 mb-2 text-cyan-500" />
                <CardTitle>External Learning Tools</CardTitle>
                <CardDescription>Integrate third-party platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/external-tools')}>
                  Configure Tools
                </Button>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-6 w-6 mb-2 text-indigo-500" />
                <CardTitle>FAQ</CardTitle>
                <CardDescription>Frequently asked questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/faq')}>
                  Manage FAQ
                </Button>
              </CardContent>
            </Card>

            {/* Glossary */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-6 w-6 mb-2 text-pink-500" />
                <CardTitle>Glossary</CardTitle>
                <CardDescription>Course terminology and definitions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/glossary')}>
                  Manage Glossary
                </Button>
              </CardContent>
            </Card>

            {/* Import/Export */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Database className="h-6 w-6 mb-2 text-yellow-500" />
                <CardTitle>Import / Export</CardTitle>
                <CardDescription>Course and content migration</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/import-export')}>
                  Import/Export
                </Button>
              </CardContent>
            </Card>

            {/* Links */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <LinkIcon className="h-6 w-6 mb-2 text-teal-500" />
                <CardTitle>Links</CardTitle>
                <CardDescription>Quick links and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/links')}>
                  Manage Links
                </Button>
              </CardContent>
            </Card>

            {/* File Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-6 w-6 mb-2 text-gray-500" />
                <CardTitle>Manage Files</CardTitle>
                <CardDescription>File storage and organization</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/settings/files')}>
                  Manage Files
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LEARNER MANAGEMENT TAB */}
        <TabsContent value="learner" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-6 w-6 mb-2 text-blue-500" />
                <CardTitle>Classlist</CardTitle>
                <CardDescription>View and manage enrolled students</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/learners/classlist')}>
                  View Classlist
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ClipboardCheck className="h-6 w-6 mb-2 text-green-500" />
                <CardTitle>Attendance</CardTitle>
                <CardDescription>Track student attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/learners/attendance')}>
                  Manage Attendance
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart className="h-6 w-6 mb-2 text-purple-500" />
                <CardTitle>Class Progress</CardTitle>
                <CardDescription>Monitor student progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/learners/progress')}>
                  View Progress
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-6 w-6 mb-2 text-orange-500" />
                <CardTitle>Groups</CardTitle>
                <CardDescription>Manage student groups</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/learners/groups')}>
                  Manage Groups
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ASSESSMENT TAB */}
        <TabsContent value="assessment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ClipboardCheck className="h-6 w-6 mb-2 text-blue-500" />
                <CardTitle>Assignments</CardTitle>
                <CardDescription>Create and manage assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/assignments')}>
                  Manage Assignments
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-6 w-6 mb-2 text-green-500" />
                <CardTitle>Quizzes</CardTitle>
                <CardDescription>Create and manage quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/quizzes')}>
                  Manage Quizzes
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart className="h-6 w-6 mb-2 text-purple-500" />
                <CardTitle>Grades</CardTitle>
                <CardDescription>Gradebook and grading tools</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/grades')}>
                  Manage Grades
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="h-6 w-6 mb-2 text-yellow-500" />
                <CardTitle>Awards</CardTitle>
                <CardDescription>Badges and certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/awards')}>
                  Manage Awards
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ClipboardCheck className="h-6 w-6 mb-2 text-red-500" />
                <CardTitle>Rubrics</CardTitle>
                <CardDescription>Grading rubrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/rubrics')}>
                  Manage Rubrics
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ClipboardCheck className="h-6 w-6 mb-2 text-cyan-500" />
                <CardTitle>Checklists</CardTitle>
                <CardDescription>Learning checklists</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/checklists')}>
                  Manage Checklists
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-6 w-6 mb-2 text-indigo-500" />
                <CardTitle>Competencies</CardTitle>
                <CardDescription>Skills and competencies</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/competencies')}>
                  Manage Competencies
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-6 w-6 mb-2 text-pink-500" />
                <CardTitle>Self Assessments</CardTitle>
                <CardDescription>Student self-evaluation</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/self-assessment')}>
                  Manage Self Assessments
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-6 w-6 mb-2 text-teal-500" />
                <CardTitle>Surveys</CardTitle>
                <CardDescription>Course surveys and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/surveys')}>
                  Manage Surveys
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ClipboardCheck className="h-6 w-6 mb-2 text-gray-500" />
                <CardTitle>Quick Eval</CardTitle>
                <CardDescription>Fast evaluation tools</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/assessment/quick-eval')}>
                  Quick Eval
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* COMMUNICATION TAB */}
        <TabsContent value="communication" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bell className="h-6 w-6 mb-2 text-blue-500" />
                <CardTitle>Announcements</CardTitle>
                <CardDescription>Course-wide announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/communication/announcements')}>
                  Manage Announcements
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-6 w-6 mb-2 text-green-500" />
                <CardTitle>Discussions</CardTitle>
                <CardDescription>Forums and discussions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/communication/discussions')}>
                  Manage Discussions
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Wrench className="h-6 w-6 mb-2 text-purple-500" />
                <CardTitle>Intelligent Agents</CardTitle>
                <CardDescription>Automated messaging and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/communication/agents')}>
                  Configure Agents
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ADMIN TOOLS TAB */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Database className="h-6 w-6 mb-2 text-blue-500" />
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Backup and restore</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/tools/database')}>
                  Manage Database
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-6 w-6 mb-2 text-green-500" />
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/users')}>
                  Manage Users
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart className="h-6 w-6 mb-2 text-purple-500" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>System-wide reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/tools/analytics')}>
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-6 w-6 mb-2 text-red-500" />
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Access control and security</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/tools/security')}>
                  Configure Security
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Wrench className="h-6 w-6 mb-2 text-orange-500" />
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>Logs and system health</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/tools/maintenance')}>
                  System Tools
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Settings className="h-6 w-6 mb-2 text-cyan-500" />
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>Platform-wide configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/admin/tools/global-settings')}>
                  Global Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
