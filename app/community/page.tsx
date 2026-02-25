'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CommunityPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Community & Support</h1>
              <p className="text-gray-600 mt-2">Get help, ask questions, and connect with peers</p>
            </div>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="mb-12 card p-8 bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">You're Not Alone</h2>
          <p className="text-gray-700">
            This community is full of creative entrepreneurs like you. Ask questions, share your work, celebrate wins, and learn from others' experiences.
          </p>
        </section>

        {/* Community Areas */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Connect & Learn</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Main Forum */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Course Discussions</h3>
              <p className="text-gray-700 mb-6">
                Ask questions about weekly lessons, get feedback on your projects, and discuss course content with peers and instructors.
              </p>
              <button
                onClick={() => router.push('/student/discussions')}
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
              >
                Join Discussions
              </button>
            </div>

            {/* Cricut Help */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Technical Help & Troubleshooting</h3>
              <p className="text-gray-700 mb-6">
                Having trouble with your Cricut? Design software issues? Get step-by-step help from instructors and experienced community members.
              </p>
              <div className="space-y-2">
                <a
                  href="https://help.cricut.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-4 py-2 text-center border border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition"
                >
                  Cricut Help Center
                </a>
                <a
                  href="https://www.reddit.com/r/cricut/"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-4 py-2 text-center border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  r/cricut Reddit
                </a>
              </div>
            </div>

            {/* Portfolio Feedback */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Portfolio & Project Feedback</h3>
              <p className="text-gray-700 mb-6">
                Share your work and get constructive feedback from your cohort. Celebrate wins and learn from peer critiques.
              </p>
              <button
                onClick={() => router.push('/student/portfolio')}
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
              >
                Share Your Work
              </button>
            </div>

            {/* Collaboration */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ideas & Collaboration</h3>
              <p className="text-gray-700 mb-6">
                Find collaborators, discuss business ideas, and explore joint projects with other creatives in the course.
              </p>
              <button
                onClick={() => router.push('/student/discussions')}
                className="px-4 py-2 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition"
              >
                Start a Discussion
              </button>
            </div>
          </div>
        </section>

        {/* Request Help Form */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Get 1-on-1 Support</h2>
          <div className="card p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Instructor Help</h3>
            <p className="text-gray-700 mb-6">
              Have a specific question or blocker? Submit a help request and an instructor will follow up within 24 hours.
            </p>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 text-green-900 rounded-lg">
                <p className="font-semibold">Success!</p>
                <p className="text-sm mt-1">Your request was submitted. You'll hear from us soon.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Issue Type</label>
                <select
                  name="issueType"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select an issue type</option>
                  <option value="cricut">Cricut or Design Software</option>
                  <option value="project">Project or Assignment Help</option>
                  <option value="content">Content Strategy Question</option>
                  <option value="technical">Technical Platform Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">What's Your Question?</label>
                <textarea
                  name="details"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Please describe your question or issue. The more detail, the better we can help."
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
              >
                Submit Help Request
              </button>
            </form>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="card overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900">
                <span>How do I get feedback on my projects?</span>
                <span className="text-gray-500">▼</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                Share your work in the Course Discussions or Portfolio section. Instructors and peers will provide constructive feedback within 48 hours. We also do live feedback sessions during class.
              </div>
            </details>

            <details className="card overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900">
                <span>Can I collaborate with other students?</span>
                <span className="text-gray-500">▼</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                Absolutely! Use the Collaboration section to find peers interested in working together. Many students have formed creative partnerships through this course.
              </div>
            </details>

            <details className="card overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900">
                <span>What if I'm stuck on a technical issue?</span>
                <span className="text-gray-500">▼</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                Post in the Technical Help section with photos/videos of the issue. We have a dedicated instructor who monitors technical questions and responds quickly. You can also check the Cricut Help Center for official troubleshooting guides.
              </div>
            </details>

            <details className="card overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900">
                <span>Are there office hours or live help sessions?</span>
                <span className="text-gray-500">▼</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                Yes! We have two live office hour sessions per week where you can ask questions in real-time. Schedule times are posted in the course hub. All sessions are also recorded for on-demand access.
              </div>
            </details>

            <details className="card overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900">
                <span>Can I share my social media for feedback?</span>
                <span className="text-gray-500">▼</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                Yes! Share your Instagram, TikTok, or Pinterest profile links in the community. Instructors and peers will analyze your content and give specific, actionable feedback on branding, captions, and engagement strategies.
              </div>
            </details>
          </div>
        </section>
      </main>
    </div>
  )
}
