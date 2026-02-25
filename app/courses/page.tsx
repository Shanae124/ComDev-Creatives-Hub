'use client'

import { useRouter } from 'next/navigation'
import courseData from '@/content/courses/cdd-social-media.json'
import { useState } from 'react'

interface Lesson {
  title: string
  body: string
}

interface Module {
  title: string
  subtitle: string
  overview: string
  image: {
    src: string
    alt: string
  }
  lessons: Lesson[]
}

export default function CoursesPage() {
  const router = useRouter()
  const [expandedModule, setExpandedModule] = useState<number | null>(0)
  
  const modules = courseData.modules as Module[]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{courseData.title}</h1>
              <p className="text-gray-600 mt-2">{courseData.subtitle}</p>
              <p className="text-sm text-gray-500 mt-1">Facilitator: {courseData.facilitator}</p>
            </div>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Overview */}
        <section className="mb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {modules[0]?.overview || 'A comprehensive guide to social media marketing for creative entrepreneurs.'}
              </p>
              <p className="text-gray-700 leading-relaxed">
                This course covers everything from branding foundations to advanced content strategies. Every module includes practical lessons and real-world applications you can implement immediately.
              </p>
            </div>

            {/* Course Stats Card */}
            <div className="card p-6 h-fit">
              <h3 className="font-semibold text-gray-900 mb-4">Course Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Total Modules</div>
                  <div className="font-semibold text-gray-900">{modules.length} modules</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Time Commitment</div>
                  <div className="font-semibold text-gray-900">6 hours/week</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Sessions</div>
                  <div className="font-semibold text-gray-900">2 × 3 hours per week</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Format</div>
                  <div className="font-semibold text-gray-900">Live cohort + On-demand</div>
                </div>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full mt-6 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="card overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900">
                <span>Do I need design experience?</span>
                <span className="text-gray-500">▼</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                No. This course is designed for creative entrepreneurs with little to no design background. We'll teach you the fundamentals of visual design, branding, and social media marketing from the ground up.
              </div>
            </details>

            <details className="card overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900">
                <span>What materials or tools do I need?</span>
                <span className="text-gray-500">▼</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                A smartphone or camera (for product photography), a computer, and access to free design tools. All recommended tools and resources are provided in the course.
              </div>
            </details>

            <details className="card overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900">
                <span>Can I go through the course at my own pace?</span>
                <span className="text-gray-500">▼</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                Yes! All course materials are available on-demand. While we have optional live cohort sessions for community and feedback, you can work through the modules on your own schedule.
              </div>
            </details>

            <details className="card overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900">
                <span>What will I have at the end?</span>
                <span className="text-gray-500">▼</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                A complete portfolio of work you can show to clients, a clear understanding of social media strategy for product-based businesses, and practical skills you can implement immediately.
              </div>
            </details>
          </div>
        </section>
      </main>
    </div>
  )
}
