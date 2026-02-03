'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Course {
  id: number
  title: string
  description: string
  instructor_name: string
  progress?: number
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadEnrolledCourses()
  }, [])

  const loadEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/courses/my/enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">ComDev Creatives Hub</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user.firstName}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <div className="bg-gradient-to-r from-primary-600 to-community-purple rounded-2xl p-8 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">All‑in‑One Access Hub</h2>
                <p className="text-white/90">
                  Learn, create, and grow your brand with hands‑on content and creator tools.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/15 rounded-xl px-4 py-3">
                  <div className="text-sm text-white/80">Active Course</div>
                  <div className="font-semibold">Social Media for Crafters</div>
                </div>
                <div className="bg-white/15 rounded-xl px-4 py-3">
                  <div className="text-sm text-white/80">Progress</div>
                  <div className="font-semibold">In Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hub Quick Access */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <button
            onClick={() => router.push('/courses')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">📘</div>
            <h3 className="font-bold text-lg mb-1">Course Content</h3>
            <p className="text-xs text-gray-600">Weekly lessons, demos, and projects</p>
            <div className="mt-4">
              <span className="inline-flex px-3 py-1 text-xs bg-primary-600 text-white rounded-lg">Open</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/tools')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">🧰</div>
            <h3 className="font-bold text-lg mb-1">Tools & Apps</h3>
            <p className="text-xs text-gray-600">Everything you need to create and post</p>
            <div className="mt-4">
              <span className="inline-flex px-3 py-1 text-xs bg-primary-600 text-white rounded-lg">Open</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/student/portfolio')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-bold text-lg mb-1">Portfolio</h3>
            <p className="text-xs text-gray-600">Showcase your best work</p>
            <div className="mt-4">
              <span className="inline-flex px-3 py-1 text-xs bg-primary-600 text-white rounded-lg">Open</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/student/discussions')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-bold text-lg mb-1">Community</h3>
            <p className="text-xs text-gray-600">Get feedback and support</p>
            <div className="mt-4">
              <span className="inline-flex px-3 py-1 text-xs bg-primary-600 text-white rounded-lg">Open</span>
            </div>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <button
            onClick={() => router.push('/resources')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-bold text-lg mb-1">Interactive Resources</h3>
            <p className="text-xs text-gray-600">Prompts, checklists, templates</p>
            <div className="mt-4">
              <span className="inline-flex px-3 py-1 text-xs bg-primary-600 text-white rounded-lg">Open</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/slides')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">🖼️</div>
            <h3 className="font-bold text-lg mb-1">Class Slides</h3>
            <p className="text-xs text-gray-600">Weekly decks and worksheets</p>
            <div className="mt-4">
              <span className="inline-flex px-3 py-1 text-xs bg-primary-600 text-white rounded-lg">Open</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/community')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">🛠️</div>
            <h3 className="font-bold text-lg mb-1">Cricut Fixes</h3>
            <p className="text-xs text-gray-600">How‑tos and troubleshooting</p>
            <div className="mt-4">
              <span className="inline-flex px-3 py-1 text-xs bg-primary-600 text-white rounded-lg">Open</span>
            </div>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <button
            onClick={() => router.push('/manual')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-bold text-lg mb-1">Training Manual</h3>
            <p className="text-xs text-gray-600">Full course guide and modules</p>
            <div className="mt-4">
              <span className="inline-flex px-3 py-1 text-xs bg-primary-600 text-white rounded-lg">Open</span>
            </div>
          </button>
          <div className="bg-gradient-to-r from-primary-600 to-community-green rounded-2xl p-6 text-white shadow-md">
            <div className="text-sm text-white/80">Quick Tip</div>
            <div className="text-lg font-semibold">Consistency builds trust.</div>
            <div className="text-xs text-white/90">Post with a plan and keep visuals clean.</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6">You're not enrolled in any courses. Start learning today!</p>
            <button
              onClick={() => router.push('/courses')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 cursor-pointer"
                onClick={() => router.push(`/courses/${course.id}`)}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Instructor: {course.instructor_name}</span>
                </div>
                {course.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/student/submissions')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-lg mb-1">My Submissions</h3>
            <p className="text-sm text-gray-600">View your project submissions and grades</p>
          </button>

          <button
            onClick={() => router.push('/student/portfolio')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-bold text-lg mb-1">My Portfolio</h3>
            <p className="text-sm text-gray-600">Showcase your best creative work</p>
          </button>

          <button
            onClick={() => router.push('/student/discussions')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-lg mb-1">Discussions</h3>
            <p className="text-sm text-gray-600">Connect with peers and instructors</p>
          </button>
        </div>
      </main>
    </div>
  )
}
