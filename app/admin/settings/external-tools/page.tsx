'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { adminAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Video, Presentation, Link as LinkIcon } from 'lucide-react'
import apiClient from '@/lib/api'

export default function ExternalToolsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [tools, setTools] = useState({
    zoom_meeting_url: '',
    google_meet_url: '',
    whiteboard_url: '', // e.g., Excalidraw/Miro board link
    boards_provider: '', // e.g., 'excalidraw' | 'miro'
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    const load = async () => {
      try {
        const { data } = await apiClient.get('/admin/settings')
        setTools({
          zoom_meeting_url: data.zoom_meeting_url || '',
          google_meet_url: data.google_meet_url || '',
          whiteboard_url: data.whiteboard_url || '',
          boards_provider: data.boards_provider || '',
        })
      } catch (e) {
        console.error('Failed to fetch settings', e)
      }
    }
    load()
  }, [user, router])

  const saveSettings = async () => {
    setLoading(true)
    try {
      await apiClient.put('/admin/settings', tools)
      alert('External tools saved!')
    } catch (e) {
      console.error('Failed to save settings', e)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">External Learning Tools</h1>
        <p className="text-muted-foreground">Configure video meetings and collaborative boards</p>
      </div>

      <Tabs defaultValue="meetings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="boards">Boards</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Video className="w-5 h-5" /> Video Meetings</CardTitle>
              <CardDescription>Paste provider links used by instructors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Zoom Meeting URL</label>
                <Input value={tools.zoom_meeting_url} onChange={(e) => setTools({ ...tools, zoom_meeting_url: e.target.value })} placeholder="https://zoom.us/j/XXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Google Meet URL</label>
                <Input value={tools.google_meet_url} onChange={(e) => setTools({ ...tools, google_meet_url: e.target.value })} placeholder="https://meet.google.com/XXXXX" />
              </div>
              <Button onClick={saveSettings} disabled={loading} className="mt-2">{loading ? 'Saving...' : 'Save'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Presentation className="w-5 h-5" /> Collaborative Boards</CardTitle>
              <CardDescription>Configure shared whiteboards for classes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Boards Provider</label>
                <Input value={tools.boards_provider} onChange={(e) => setTools({ ...tools, boards_provider: e.target.value })} placeholder="excalidraw or miro" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Board URL</label>
                <Input value={tools.whiteboard_url} onChange={(e) => setTools({ ...tools, whiteboard_url: e.target.value })} placeholder="https://excalidraw.com/#room=..." />
              </div>
              <Button onClick={saveSettings} disabled={loading} className="mt-2">{loading ? 'Saving...' : 'Save'}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
        <LinkIcon className="w-4 h-4" /> You can surface these links in course pages and announcements.
      </div>
    </div>
  )
}
