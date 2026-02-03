'use client'

import { useRouter } from 'next/navigation'

export default function SlidesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Class Slides & Worksheets</h1>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Back to Hub
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Intro Slides (Today’s Session)</h2>
              <p className="text-sm text-gray-600">Why social media matters, how to leverage it, and which platforms to start with.</p>
            </div>
            <button
              onClick={() => router.push('/slides/intro')}
              className="px-5 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Open Slide Deck
            </button>
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary-600 to-community-orange rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Weekly Slides & Activities</h2>
          <p className="text-white/90">
            Download or view weekly slide decks and worksheets for each module.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { week: 'Week 1', title: 'Brand & Visual Identity', items: ['Brand voice worksheet', 'Cricut design checklist', 'Photo setup guide'] },
            { week: 'Week 2', title: 'Content Strategy & Captions', items: ['Content pillars worksheet', 'Caption formulas', 'Hashtag planner'] },
            { week: 'Week 3', title: 'Platform Growth & Engagement', items: ['Reels/TikTok shot list', 'DM response scripts', 'Engagement tracker'] },
            { week: 'Week 4', title: 'Portfolio & Showcase', items: ['Portfolio rubric', 'Showcase checklist', 'Client pitch outline'] }
          ].map((module) => (
            <div key={module.week} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 mb-3">
                {module.week}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{module.title}</h3>
              <ul className="space-y-2 text-gray-700">
                {module.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
