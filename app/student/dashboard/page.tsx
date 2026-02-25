'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Course {
  id: number
  title: string
  description: string
  instructor_name: string
  progress?: number
}

const navigationItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: 'home' },
  { label: 'Courses', href: '/courses', icon: 'book' },
  { label: 'Design Studio', href: '/tools/design-studio', icon: 'palette' },
  { label: 'Resources', href: '/resources', icon: 'lightbulb' },
  { label: 'Community', href: '/community', icon: 'users' },
  { label: 'Portfolio', href: '/student/portfolio', icon: 'star' },
]

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      const response = await fetch('/api/courses/my/enrollments', {
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 shadow-sm
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:top-auto lg:shadow-none
        z-40
      `}>
        <nav className="p-6 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              <span className="text-lg">
                {item.icon === 'home' && '🏠'}
                {item.icon === 'book' && '📚'}
                {item.icon === 'palette' && '🎨'}
                {item.icon === 'lightbulb' && '💡'}
                {item.icon === 'users' && '👥'}
                {item.icon === 'star' && '⭐'}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-30">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-semibold text-gray-900">{user.firstName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8">
          {/* Welcome Banner */}
          <div className="mb-8 card p-8 bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back, {user.firstName}!</h2>
            <p className="text-gray-700">
              You're on track with the Social Media Marketing for Crafters course. Keep creating and sharing your work to build your portfolio.
            </p>
          </div>

          {/* Active Course Section */}
          {!loading && courses.length > 0 && (
            <section className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Course</h3>
              <div className="grid gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="card p-6 hover:shadow-md transition cursor-pointer" onClick={() => router.push('/courses')}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h4>
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        <div className="text-sm text-gray-600">
                          Instructor: <span className="font-semibold text-gray-900">{course.instructor_name}</span>
                        </div>
                      </div>
                      {course.progress !== undefined && (
                        <div className="md:w-40">
                          <div className="text-sm font-semibold text-gray-900 mb-2">{course.progress}% Complete</div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary-600 to-primary-500 h-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <button className="mt-4 px-4 py-2 text-primary-600 font-semibold hover:bg-primary-50 rounded-lg transition">
                      Continue Learning →
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <section className="mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => router.push('/courses')}
                className="card p-6 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-xl font-bold mb-3">
                  📚
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Course Content</h4>
                <p className="text-sm text-gray-600">View lessons, projects, and materials</p>
              </button>

              <button
                onClick={() => router.push('/tools/design-studio')}
                className="card p-6 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-xl font-bold mb-3">
                  🎨
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Design Studio</h4>
                <p className="text-sm text-gray-600">Create and edit your designs</p>
              </button>

              <button
                onClick={() => router.push('/resources')}
                className="card p-6 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-xl font-bold mb-3">
                  💡
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Resources</h4>
                <p className="text-sm text-gray-600">Templates, guides, and tools</p>
              </button>
            </div>
          </section>

          {/* Community Section */}
          <section className="mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Connect & Collaborate</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => router.push('/community')}
                className="card p-6 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl font-bold mb-3">
                  👥
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Community Forum</h4>
                <p className="text-sm text-gray-600">Ask questions, get feedback, and support peers</p>
              </button>

              <button
                onClick={() => router.push('/student/portfolio')}
                className="card p-6 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl font-bold mb-3">
                  ⭐
                </div>
                <h4 className="font-bold text-gray-900 mb-1">My Portfolio</h4>
                <p className="text-sm text-gray-600">Showcase your best creative work</p>
              </button>
            </div>
          </section>

          {/* Learning Path Section */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Path</h3>
            <div className="card p-6">
              <div className="space-y-6">
                {/* Week 1 */}
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      ✓
                    </div>
                    <div className="w-1 h-12 bg-gray-200 my-2"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <h4 className="font-bold text-gray-900">Week 1: Brand & Visual Identity</h4>
                    <p className="text-sm text-gray-600 mt-1">Create your brand kit including logo, color palette, and product mockups</p>
                    <div className="mt-3 text-sm text-primary-600 font-semibold">Completed</div>
                  </div>
                </div>

                {/* Week 2 */}
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="w-1 h-12 bg-gray-200 my-2"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <h4 className="font-bold text-gray-900">Week 2: Content Strategy & Copywriting</h4>
                    <p className="text-sm text-gray-600 mt-1">Build your 30-day content calendar and master conversion-focused captions</p>
                    <button onClick={() => router.push('/courses')} className="mt-3 text-sm text-primary-600 font-semibold hover:underline">
                      Continue →
                    </button>
                  </div>
                </div>

                {/* Week 3 */}
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="w-1 h-12 bg-gray-200 my-2"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <h4 className="font-bold text-gray-900">Week 3: Platform Growth & Engagement</h4>
                    <p className="text-sm text-gray-600 mt-1">Master Instagram Reels, TikTok trends, and Pinterest for discovery</p>
                  </div>
                </div>

                {/* Week 4 */}
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Week 4: Portfolio & Launch Strategy</h4>
                    <p className="text-sm text-gray-600 mt-1">Showcase your work and create your 90-day growth roadmap</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
