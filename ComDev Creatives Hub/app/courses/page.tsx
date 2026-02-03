'use client'

import { useRouter } from 'next/navigation'

export default function CoursesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Course Content</h1>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Back to Hub
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Course Overview */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Social Media Marketing for Crafters
          </h2>
          <p className="text-gray-700 mb-4">
            A 4‑week, hands‑on course focused on branding, promotion, and client engagement for
            the event décor industry using Cricut design and social platforms.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>📅 4 weeks</div>
            <div>🕒 24 hours (2 days/week × 3 hours/day)</div>
            <div>🎯 Outcome: Professional social media portfolio</div>
          </div>
        </section>

        {/* Key Topics */}
        <section className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Key Topics</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Creating engaging content</li>
              <li>• Photography and video tips</li>
              <li>• Writing compelling product descriptions</li>
              <li>• Utilizing relevant hashtags</li>
              <li>• Managing client inquiries through direct messaging</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Course Outcome</h3>
            <p className="text-gray-700">
              Students will be equipped to set up and manage a professional social media portfolio
              that effectively converts followers into paying customers.
            </p>
          </div>
        </section>

        {/* Weekly Breakdown */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Weekly Breakdown</h3>
          <div className="space-y-6">
            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="text-xl font-semibold text-gray-900">Week 1: Brand & Visual Identity</h4>
              <ul className="text-gray-700 mt-2 space-y-1">
                <li>• Define brand voice and ideal customer</li>
                <li>• Create 3 Cricut designs aligned with your brand</li>
                <li>• Photo studio basics using mobile devices</li>
                <li>• Project: Brand Identity Kit (logo, pattern, product mockup)</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="text-xl font-semibold text-gray-900">Week 2: Content Strategy & Captions</h4>
              <ul className="text-gray-700 mt-2 space-y-1">
                <li>• Build content pillars for your business</li>
                <li>• Write compelling product descriptions</li>
                <li>• Hashtag research and content planning</li>
                <li>• Project: 30‑Day Content Calendar</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="text-xl font-semibold text-gray-900">Week 3: Platform Growth & Engagement</h4>
              <ul className="text-gray-700 mt-2 space-y-1">
                <li>• Instagram Reels, TikTok trends, Pinterest strategy</li>
                <li>• Client inquiry responses and DM workflows</li>
                <li>• Community engagement and collaborations</li>
                <li>• Project: Post and analyze 5 pieces of content</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="text-xl font-semibold text-gray-900">Week 4: Portfolio & Showcase</h4>
              <ul className="text-gray-700 mt-2 space-y-1">
                <li>• Curate your social media portfolio</li>
                <li>• Final evaluation and showcase preparation</li>
                <li>• Presentation skills for client pitching</li>
                <li>• Final Project: Portfolio Showcase</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
