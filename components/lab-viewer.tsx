"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Clock, 
  Zap, 
  Download, 
  Share2, 
  Flag,
  BarChart3,
  AlertCircle 
} from "lucide-react"

interface Lab {
  id: number
  title: string
  description: string
  lab_type: string
  html_content: string
  html_file_url?: string
  status: string
  duration_minutes?: number
  difficulty: string
  objectives: string[]
  resources: any[]
}

interface LabViewerProps {
  labId: string
  courseId: string
}

export default function LabViewer({ labId, courseId }: LabViewerProps) {
  const [lab, setLab] = useState<Lab | null>(null)
  const [loading, setLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    fetchLab()
    
    // Track time spent
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [labId])

  const fetchLab = async () => {
    try {
      const response = await fetch(`/api/labs/${labId}`)
      const data = await response.json()
      setLab(data)
    } catch (error) {
      console.error("Failed to fetch lab:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadLab = () => {
    if (!lab) return
    
    const element = document.createElement("a")
    const file = new Blob([lab.html_content], { type: "text/html" })
    element.href = URL.createObjectURL(file)
    element.download = `${lab.title.replace(/\s+/g, "-")}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              Loading lab environment...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!lab) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-destructive">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              Lab not found
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create a safe iframe with the HTML content
  const iframeHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      </style>
    </head>
    <body>
      ${lab.html_content}
      <script>
        // Allow parent window communication (optional)
        window.addEventListener('message', (event) => {
          if (event.data.type === 'lab-data') {
            console.log('Lab data:', event.data);
          }
        });
      </script>
    </body>
    </html>
  `

  const iframeBlob = new Blob([iframeHTML], { type: "text/html" })
  const iframeUrl = URL.createObjectURL(iframeBlob)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Lab Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{lab.title}</CardTitle>
              <CardDescription className="mt-2">{lab.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{lab.lab_type}</Badge>
              <Badge 
                variant={
                  lab.difficulty === 'beginner' ? 'secondary' :
                  lab.difficulty === 'intermediate' ? 'default' :
                  'destructive'
                }
              >
                {lab.difficulty}
              </Badge>
              <Badge variant={lab.status === 'published' ? 'default' : 'outline'}>
                {lab.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-6">
            {lab.duration_minutes && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{lab.duration_minutes} minutes estimated</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span>Time spent: {formatTime(timeSpent)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Lab Content and Info */}
      <Tabs defaultValue="lab" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lab">
            <Zap className="h-4 w-4 mr-2" />
            Lab Activity
          </TabsTrigger>
          <TabsTrigger value="objectives">
            <BookOpen className="h-4 w-4 mr-2" />
            Objectives
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Download className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Lab Activity Tab */}
        <TabsContent value="lab">
          <Card>
            <CardContent className="pt-6">
              {/* Full-page iframe for the lab */}
              <div className="border rounded-lg overflow-hidden bg-white" style={{ height: "800px" }}>
                <iframe
                  key={iframeKey}
                  src={iframeUrl}
                  title={lab.title}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
                  style={{ display: "block" }}
                />
              </div>
              
              {/* Lab Controls */}
              <div className="flex gap-2 justify-between items-center mt-6">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIframeKey(prev => prev + 1)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Refresh Lab
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={downloadLab}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Flag className="h-4 w-4 mr-2" />
                    Get Help
                  </Button>
                  <Button>
                    <Share2 className="h-4 w-4 mr-2" />
                    Submit Completion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Objectives Tab */}
        <TabsContent value="objectives">
          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
              <CardDescription>What you'll learn from this lab</CardDescription>
            </CardHeader>
            <CardContent>
              {lab.objectives && lab.objectives.length > 0 ? (
                <ul className="space-y-3">
                  {lab.objectives.map((objective, idx) => (
                    <li key={idx} className="flex gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No objectives listed</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Additional materials and references</CardDescription>
            </CardHeader>
            <CardContent>
              {lab.resources && lab.resources.length > 0 ? (
                <div className="space-y-2">
                  {lab.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{resource.title}</div>
                        <div className="text-sm text-muted-foreground">{resource.description}</div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No additional resources</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
