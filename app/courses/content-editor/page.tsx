'use client'

import React, { useState } from 'react'
import { Edit2, Save, Eye, Code, Plus, Trash2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface CourseSection {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  content: string
  type: 'text' | 'video' | 'assignment' | 'quiz'
  order: number
}

export default function CourseContentEditor() {
  const [sections, setSections] = useState<CourseSection[]>([
    {
      id: '1',
      title: 'Introduction to the Course',
      description: 'Welcome and course overview',
      lessons: [
        {
          id: '1-1',
          title: 'Course Overview',
          content: '<h2>Welcome!</h2><p>This course will cover the fundamentals...</p>',
          type: 'text',
          order: 1,
        },
        {
          id: '1-2',
          title: 'Course Requirements',
          content: '<h2>What You Need</h2><ul><li>Basic computer knowledge</li><li>Internet connection</li></ul>',
          type: 'text',
          order: 2,
        },
      ],
    },
    {
      id: '2',
      title: 'Core Concepts',
      description: 'Learn the main ideas',
      lessons: [
        {
          id: '2-1',
          title: 'Concept 1',
          content: '<h2>Understanding Concept 1</h2><p>This is fundamental to...</p>',
          type: 'text',
          order: 1,
        },
      ],
    },
  ])

  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  const handleEditSectionTitle = (sectionId: string, newTitle: string) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s))
    )
  }

  const handleEditLessonContent = (sectionId: string, lessonId: string, newContent: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === lessonId ? { ...l, content: newContent } : l
              ),
            }
          : s
      )
    )
  }

  const handleAddLesson = (sectionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  id: `${sectionId}-${Date.now()}`,
                  title: 'New Lesson',
                  content: '<h2>New Lesson</h2><p>Add content here...</p>',
                  type: 'text',
                  order: s.lessons.length + 1,
                },
              ],
            }
          : s
      )
    )
  }

  const handleDeleteLesson = (sectionId: string, lessonId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.filter((l) => l.id !== lessonId),
            }
          : s
      )
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/courses" className="text-blue-500 hover:text-blue-600 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Back to Courses
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Course Content Editor
            </h1>
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? 'default' : 'outline'}
              className="gap-2"
            >
              {editMode ? (
                <>
                  <Eye className="w-4 h-4" />
                  View Mode
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit Mode
                </>
              )}
            </Button>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {editMode ? 'Click on any content to edit it inline.' : 'View your course content'}
          </p>
        </div>

        {/* Course Structure */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                {editMode && editingSection === section.id ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      handleEditSectionTitle(section.id, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onBlur={() => setEditingSection(null)}
                    autoFocus
                  />
                ) : (
                  <div
                    className={`cursor-pointer group ${editMode ? 'hover:bg-white/50 dark:hover:bg-slate-700/50 p-2 rounded' : ''}`}
                    onClick={() => editMode && setEditingSection(section.id)}
                  >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {section.description}
                    </p>
                    {editMode && (
                      <p className="text-xs text-blue-500 mt-1">Click to edit</p>
                    )}
                  </div>
                )}
              </div>

              {/* Lessons */}
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {section.lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className={`p-6 ${editMode ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {editMode && editingLesson === lesson.id ? (
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => {
                              setSections(
                                sections.map((s) =>
                                  s.id === section.id
                                    ? {
                                        ...s,
                                        lessons: s.lessons.map((l) =>
                                          l.id === lesson.id
                                            ? { ...l, title: e.target.value }
                                            : l
                                        ),
                                      }
                                    : s
                                )
                              )
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onBlur={() => setEditingLesson(null)}
                            autoFocus
                          />
                        ) : (
                          <h3
                            className={`text-lg font-semibold text-slate-900 dark:text-white ${editMode ? 'cursor-pointer hover:text-blue-500' : ''}`}
                            onClick={() => editMode && setEditingLesson(lesson.id)}
                          >
                            {idx + 1}. {lesson.title}
                          </h3>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Type: <span className="capitalize font-medium">{lesson.type}</span>
                        </p>
                      </div>
                      {editMode && (
                        <Button
                          onClick={() => handleDeleteLesson(section.id, lesson.id)}
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      )}
                    </div>

                    {/* Content */}
                    {editMode && editingLesson === lesson.id ? (
                      <textarea
                        value={lesson.content}
                        onChange={(e) =>
                          handleEditLessonContent(
                            section.id,
                            lesson.id,
                            e.target.value
                          )
                        }
                        className="w-full h-48 p-4 font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        placeholder="Enter lesson content (HTML supported)..."
                      />
                    ) : (
                      <div
                        className={`prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 ${editMode ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-3 rounded' : ''}`}
                        onClick={() => editMode && setEditingLesson(lesson.id)}
                      >
                        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        {editMode && (
                          <p className="text-xs text-blue-500 mt-2">Click to edit</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Lesson Button */}
              {editMode && (
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={() => handleAddLesson(section.id)}
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full"
                  >
                    <Plus className="w-4 h-4" />
                    Add Lesson
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        {editMode && (
          <div className="mt-8 flex gap-4 justify-center">
            <Button className="gap-2 px-8">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setEditMode(false)}>
              Done Editing
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
