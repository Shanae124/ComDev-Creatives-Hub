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

        {/* Sample Lesson (Real Content) */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Sample Lesson: Brand Voice & Visual Identity</h3>
          <p className="text-gray-700 mb-4">
            Your brand voice is the personality behind every caption, reply, and call‑to‑action. Before you
            post a single image, you need to decide how you want to sound to your audience—friendly and
            warm, bold and premium, or playful and fun. This matters because people buy from creators they
            feel connected to, and consistency builds that connection.
          </p>
          <p className="text-gray-700 mb-4">
            Visual identity makes that connection immediate. The colors, fonts, and layout you use should
            feel like they belong together across Instagram posts, product labels, story covers, and
            packaging. A simple rule: pick one primary color, one supporting color, and one accent color,
            then choose two fonts (one for headings, one for body text). Stick to those choices for at least
            30 days so your audience starts to recognize you instantly.
          </p>
          <p className="text-gray-700 mb-6">
            In today’s lesson, you’ll build a mini brand kit. You’ll create a logo mark or wordmark in a
            square format, a repeatable pattern that can be used as a background, and a product mockup that
            shows your design in real life. This kit will be used throughout the course for your social posts
            and portfolio.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-semibold mb-1">Deliverable 1</div>
              Logo mark or wordmark (1080×1080)
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-semibold mb-1">Deliverable 2</div>
              Brand pattern or texture (1080×1080)
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-semibold mb-1">Deliverable 3</div>
              Product mockup using your design
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Sample Lesson: Captions That Convert</h3>
          <p className="text-gray-700 mb-4">
            Great captions do more than describe a product—they guide the reader to take action.
            Start with a hook that speaks to a real problem: “Need centerpieces that look luxe but
            stay on budget?” Then explain the value using plain, conversational language.
            Your goal is to help a customer visualize the outcome, not just the item.
          </p>
          <p className="text-gray-700 mb-4">
            A simple structure you can reuse every time is Hook → Benefit → Proof → CTA.
            The benefit explains why your design matters (saves time, looks premium, fits the theme),
            proof gives a quick example (client reaction, turnaround time, durability), and the CTA
            tells them exactly what to do next (DM to book, click the link, request a quote).
          </p>
          <p className="text-gray-700 mb-6">
            In this lesson, you’ll write three captions for the same product: one for Instagram,
            one for a Pinterest pin description, and one for a short‑form video. This exercise teaches
            you how to adapt the same message for different platforms while keeping your brand voice consistent.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-semibold mb-1">Template</div>
              Hook → Benefit → Proof → CTA
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-semibold mb-1">Goal</div>
              Drive DMs or bookings
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-semibold mb-1">Deliverable</div>
              3 platform‑specific captions
            </div>
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
