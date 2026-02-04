'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InstructorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Instructor Hub</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user.firstName || 'Instructor'}!</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h2>
          <p className="text-gray-700">
            Use the links below to preview course content, update lesson materials, and open the
            design studio for demonstrations.
          </p>
        </section>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/courses')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">📘</div>
            <h3 className="font-bold text-lg mb-1">Course Content</h3>
            <p className="text-xs text-gray-600">Preview lessons and weekly breakdowns</p>
          </button>

          <button
            onClick={() => router.push('/tools/design-studio')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">🎛️</div>
            <h3 className="font-bold text-lg mb-1">Design Studio</h3>
            <p className="text-xs text-gray-600">Live demos and template creation</p>
          </button>

          <button
            onClick={() => router.push('/resources')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-bold text-lg mb-1">Resources</h3>
            <p className="text-xs text-gray-600">Prompts, checklists, and guides</p>
          </button>

          <button
            onClick={() => router.push('/slides')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">🖼️</div>
            <h3 className="font-bold text-lg mb-1">Class Slides</h3>
            <p className="text-xs text-gray-600">Decks and session visuals</p>
          </button>

          <button
            onClick={() => router.push('/community')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-bold text-lg mb-1">Community Support</h3>
            <p className="text-xs text-gray-600">FAQs and troubleshooting intake</p>
          </button>

          <button
            onClick={() => router.push('/manual')}
            className="bg-white p-6 rounded-2xl shadow-md text-left border border-gray-100 card-hover"
          >
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-bold text-lg mb-1">Training Manual</h3>
            <p className="text-xs text-gray-600">Instructor notes and course guide</p>
          </button>
        </div>
      </main>
    </div>
  )
}
