"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Search,
  ThumbsUp,
  Reply,
  Bookmark,
  Eye,
  Pin,
  Trash2,
} from "lucide-react"
import Link from "next/link"

interface Discussion {
  id: string
  title: string
  course: string
  author: string
  content: string
  replies: number
  views: number
  likes: number
  pinned: boolean
  created: string
  tags: string[]
}


export default function DiscussionsPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [searchTerm, setSearchTerm] = useState("")
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const token = useAuthStore.getState().token
        const response = await fetch("/api/discussions", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          setDiscussions(await response.json())
        }
      } catch (error) {
        console.error("Error fetching discussions:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchDiscussions()
    }
  }, [isAuthenticated])

  const filteredDiscussions = discussions.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pinnedDiscussions = filteredDiscussions.filter((d) => d.pinned)
  const regularDiscussions = filteredDiscussions.filter((d) => !d.pinned)

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Class Discussions</h1>
            <p className="text-muted-foreground">Engage with classmates and instructors</p>
          </div>
          <Button>New Discussion</Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Discussions</TabsTrigger>
            <TabsTrigger value="my">My Posts</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground py-8 text-center">Loading discussions...</p>
            ) : pinnedDiscussions.length === 0 && regularDiscussions.length === 0 ? (
              <Card className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">No discussions yet</p>
              </Card>
            ) : (
              <>
                {/* Pinned Discussions */}
                {pinnedDiscussions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Pin className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Pinned</h3>
                    </div>
                    {pinnedDiscussions.map((discussion) => (
                      <Link
                        key={discussion.id}
                        href={`/discussions/${discussion.id}`}
                      >
                        <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start gap-2">
                                  <Pin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                  <div className="flex-1">
                                    <p className="font-semibold hover:text-primary transition-colors">
                                      {discussion.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      by {discussion.author} in {discussion.course}
                                    </p>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {discussion.content}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {discussion.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="text-right space-y-2 text-xs text-muted-foreground shrink-0">
                                <div className="flex items-center gap-1 justify-end">
                                  <Eye className="h-4 w-4" />
                                  {discussion.views}
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                  <MessageSquare className="h-4 w-4" />
                                  {discussion.replies}
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                  <ThumbsUp className="h-4 w-4" />
                                  {discussion.likes}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Regular Discussions */}
                {regularDiscussions.length > 0 && (
                  <div className="space-y-3">
                    {pinnedDiscussions.length > 0 && (
                      <h3 className="font-semibold text-sm text-muted-foreground mt-6">
                        Recent Discussions
                      </h3>
                    )}
                    {regularDiscussions.map((discussion) => (
                      <Link
                        key={discussion.id}
                        href={`/discussions/${discussion.id}`}
                      >
                        <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex-1 space-y-2">
                                <div>
                                  <p className="font-semibold hover:text-primary transition-colors">
                                    {discussion.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    by {discussion.author} in {discussion.course}
                                  </p>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {discussion.content}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {discussion.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="text-right space-y-2 text-xs text-muted-foreground shrink-0">
                                <div className="flex items-center gap-1 justify-end">
                                  <Eye className="h-4 w-4" />
                                  {discussion.views}
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                  <MessageSquare className="h-4 w-4" />
                                  {discussion.replies}
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                  <ThumbsUp className="h-4 w-4" />
                                  {discussion.likes}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
