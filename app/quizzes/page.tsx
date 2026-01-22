'use client'

import React, { useState } from 'react'
import {
  Puzzle,
  Plus,
  Edit2,
  Eye,
  Trash2,
  Copy,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'Chapter 1 Quiz',
      course: 'Math 101',
      questions: 10,
      timeLimit: 30,
      attempts: 'Unlimited',
      status: 'published',
      created: '2024-01-15',
    },
    {
      id: 2,
      title: 'Mid-Term Exam',
      course: 'Math 101',
      questions: 25,
      timeLimit: 60,
      attempts: '1',
      status: 'published',
      created: '2024-01-10',
    },
    {
      id: 3,
      title: 'Practice Questions',
      course: 'English 101',
      questions: 15,
      timeLimit: 45,
      attempts: '3',
      status: 'draft',
      created: '2024-01-18',
    },
  ])

  const [selectedTab, setSelectedTab] = useState('all')
  const [showQuizEditor, setShowQuizEditor] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const [quizForm, setQuizForm] = useState({
    title: '',
    course: '',
    description: '',
    timeLimit: 30,
    attempts: 'Unlimited',
    shuffleQuestions: false,
    showCorrectAnswers: true,
    questions: [
      { id: 1, type: 'multiple-choice', question: '', options: ['', '', '', ''], correct: 0 },
    ],
  })

  const handleAddQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        { id: quizForm.questions.length + 1, type: 'multiple-choice', question: '', options: ['', '', '', ''], correct: 0 },
      ],
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quizzes & Tests</h1>
            <p className="text-slate-600 dark:text-slate-400">Create and manage assessments</p>
          </div>
          <Button onClick={() => setShowQuizEditor(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Quiz
          </Button>
        </div>

        {!showQuizEditor ? (
          <>
            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Quizzes ({quizzes.length})</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Quizzes List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{quiz.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{quiz.course}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      quiz.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {quiz.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Questions</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{quiz.questions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Time Limit</p>
                      <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.timeLimit} min
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Attempts</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{quiz.attempts}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Created</p>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{quiz.created}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Results
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Quiz Editor
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedQuiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h2>
              <Button variant="outline" onClick={() => setShowQuizEditor(false)}>
                Back
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Chapter 1 Quiz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Course</label>
                <select
                  value={quizForm.course}
                  onChange={(e) => setQuizForm({ ...quizForm, course: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a course</option>
                  <option value="Math 101">Math 101</option>
                  <option value="English 101">English 101</option>
                  <option value="History 101">History 101</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={quizForm.timeLimit}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  min="5"
                  max="480"
                />
              </div>
            </div>

            {/* Questions Editor */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Questions</h3>
              <div className="space-y-6">
                {quizForm.questions.map((question, index) => (
                  <div key={question.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-slate-900 dark:text-white">Question {index + 1}</h4>
                      <Button size="sm" variant="outline" className="text-red-600">
                        Remove
                      </Button>
                    </div>

                    <input
                      type="text"
                      placeholder="Enter question"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                    />

                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correct === optIndex}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleAddQuestion} variant="outline" className="mt-6 gap-2">
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={quizForm.shuffleQuestions} />
                <span className="text-slate-700 dark:text-slate-300">Shuffle Questions</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={quizForm.showCorrectAnswers} />
                <span className="text-slate-700 dark:text-slate-300">Show Correct Answers</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Allowed Attempts</label>
                <select
                  value={quizForm.attempts}
                  onChange={(e) => setQuizForm({ ...quizForm, attempts: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                >
                  <option value="1">1</option>
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="gap-2">
                Save Quiz
              </Button>
              <Button variant="outline">Save as Draft</Button>
              <Button variant="outline">Publish</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
