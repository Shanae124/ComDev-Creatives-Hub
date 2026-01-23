'use client'

import { useEffect, useState } from 'react'
import { settingsAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Presentation, Link as LinkIcon } from 'lucide-react'

export default function MeetingsPage() {
  const [tools, setTools] = useState<{ [k: string]: string }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await settingsAPI.getExternalTools()
        setTools(data || {})
      } catch (e) {
        console.error('Failed to load external tools', e)
        setTools({})
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Live Meetings & Boards</h1>
          <p className="text-slate-600 dark:text-slate-400">Join class sessions and collaborate on shared boards</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Video className="w-5 h-5" /> Meeting Links</CardTitle>
              <CardDescription>Use your instructor's preferred meeting link</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  {[1,2].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <MeetingLink label="Zoom" url={tools.zoom_meeting_url} />
                  <MeetingLink label="Google Meet" url={tools.google_meet_url} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Presentation className="w-5 h-5" /> Collaborative Board</CardTitle>
              <CardDescription>Open the shared whiteboard for your class</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-10 bg-muted rounded animate-pulse" />
              ) : tools.whiteboard_url ? (
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <a href={tools.whiteboard_url} target="_blank" rel="noreferrer" className="text-primary underline">
                    Open {tools.boards_provider || 'Board'}
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No board configured yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MeetingLink({ label, url }: { label: string; url?: string }) {
  if (!url) return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-muted-foreground">{label} link not set</p>
    </div>
  )
  return (
    <div className="p-4 border rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4" />
        <span className="font-medium">{label}</span>
      </div>
      <Button asChild variant="outline">
        <a href={url} target="_blank" rel="noreferrer">Join</a>
      </Button>
    </div>
  )
}
