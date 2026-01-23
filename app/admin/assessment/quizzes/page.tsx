"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Plus, Search, Edit, Trash2, Copy, BarChart } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Quiz {
  id: number
  title: string
  description: string
  questions: number
  duration: number
  attempts: number
  avgScore: number
  status: "published" | "draft"
  dueDate: string
}

export default function QuizzesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    questions: 10,
    duration: 30,
    dueDate: ""
  })

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      router.push('/dashboard')
      return
    }
    fetchQuizzes()
  }, [user])

  const fetchQuizzes = async () => {
    try {
      // Mock data
      setQuizzes([
        {
          id: 1,
          title: "Introduction to Programming",
          description: "Basic programming concepts",
          questions: 15,
          duration: 45,
          attempts: 28,
          avgScore: 78,
          status: "published",
          dueDate: "2026-02-01"
        },
        {
          id: 2,
          title: "Data Structures Quiz",
          description: "Arrays, linked lists, stacks, and queues",
          questions: 20,
          duration: 60,
          attempts: 15,
          avgScore: 82,
          status: "published",
          dueDate: "2026-02-10"
        },
        {
          id: 3,
          title: "Algorithm Analysis",
          description: "Big O notation and complexity",
          questions: 12,
          duration: 30,
          attempts: 0,
          avgScore: 0,
          status: "draft",
          dueDate: "2026-02-15"
        }
      ])
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

  const createQuiz = async () => {
    // API call to create quiz
    console.log("Creating quiz:", newQuiz)
    setIsCreateOpen(false)
    setNewQuiz({ title: "", description: "", questions: 10, duration: 30, dueDate: "" })
    // Refresh quizzes
  }

  const deleteQuiz = async (id: number) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      // API call to delete
      setQuizzes(prev => prev.filter(q => q.id !== id))
    }
  }

  const duplicateQuiz = async (id: number) => {
    const quiz = quizzes.find(q => q.id === id)
    if (quiz) {
      // API call to duplicate
      alert(`Duplicating quiz: ${quiz.title}`)
    }
  }

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) return null

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Quiz Management
          </h1>
          <p className="text-muted-foreground">Create and manage quizzes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
              <DialogDescription>Set up a new quiz for your students</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                  placeholder="Enter quiz description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questions">Number of Questions</Label>
                  <Input
                    id="questions"
                    type="number"
                    value={newQuiz.questions}
                    onChange={(e) => setNewQuiz({ ...newQuiz, questions: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newQuiz.duration}
                    onChange={(e) => setNewQuiz({ ...newQuiz, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newQuiz.dueDate}
                  onChange={(e) => setNewQuiz({ ...newQuiz, dueDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={createQuiz}>Create Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading quizzes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quiz.title}</div>
                        <div className="text-sm text-muted-foreground">{quiz.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{quiz.questions}</TableCell>
                    <TableCell>{quiz.duration} min</TableCell>
                    <TableCell>{quiz.attempts}</TableCell>
                    <TableCell>{quiz.avgScore > 0 ? `${quiz.avgScore}%` : "-"}</TableCell>
                    <TableCell>{new Date(quiz.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={quiz.status === "published" ? "default" : "secondary"}>
                        {quiz.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/assessment/quizzes/${quiz.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => duplicateQuiz(quiz.id)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/assessment/quizzes/${quiz.id}/stats`)}>
                          <BarChart className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteQuiz(quiz.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && filteredQuizzes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No quizzes found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
