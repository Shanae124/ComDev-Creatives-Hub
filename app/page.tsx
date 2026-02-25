'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-gray-800 text-white py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Master Creative Entrepreneurship
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl">
              Project-based learning for ambitious creators. Build your portfolio, develop real skills, and connect with community—no fluff, just results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
              >
                Start Free
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition border border-white/20"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose ComDev Creatives?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Value Prop 1 */}
            <div className="card p-8">
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Project-Based Learning</h3>
              <p className="text-gray-700 leading-relaxed">
                Every assignment builds real portfolio pieces you can showcase to clients and employers.
              </p>
            </div>

            {/* Value Prop 2 */}
            <div className="card p-8">
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Practical Skills</h3>
              <p className="text-gray-700 leading-relaxed">
                Learn actionable strategies you can apply immediately to grow your business.
              </p>
            </div>

            {/* Value Prop 3 */}
            <div className="card p-8">
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Supportive Community</h3>
              <p className="text-gray-700 leading-relaxed">
                Learn alongside other creative entrepreneurs. Get feedback and share wins together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Offering */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Featured Course</h2>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl">
            Our inaugural program designed for creative entrepreneurs
          </p>

          <div className="card p-10">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Social Media Marketing for Crafters
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  A 4-week, hands-on course focused on branding, promotion, and client engagement for the event décor industry. Build your brand from concept to customer conversion.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-primary-600 font-semibold">📅</span>
                    <span className="text-gray-700"><strong>Duration:</strong> 4 weeks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary-600 font-semibold">⏱️</span>
                    <span className="text-gray-700"><strong>Time:</strong> 6 hours/week (2 sessions × 3 hours)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary-600 font-semibold">🎯</span>
                    <span className="text-gray-700"><strong>Outcome:</strong> Professional portfolio + brand strategy</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/courses')}
                  className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
                >
                  View Course Details
                </button>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-6">What You'll Learn</h4>
                <div className="space-y-3">
                  <div className="border-l-3 border-primary-600 pl-4">
                    <p className="font-semibold text-gray-900">Brand Development</p>
                    <p className="text-sm text-gray-600">Define your brand voice, visual identity, and positioning</p>
                  </div>
                  <div className="border-l-3 border-primary-600 pl-4">
                    <p className="font-semibold text-gray-900">Content Creation</p>
                    <p className="text-sm text-gray-600">Photography, video, copywriting, and visual design</p>
                  </div>
                  <div className="border-l-3 border-primary-600 pl-4">
                    <p className="font-semibold text-gray-900">Platform Strategy</p>
                    <p className="text-sm text-gray-600">Instagram, TikTok, Pinterest growth and engagement tactics</p>
                  </div>
                  <div className="border-l-3 border-primary-600 pl-4">
                    <p className="font-semibold text-gray-900">Customer Conversion</p>
                    <p className="text-sm text-gray-600">Turn followers into clients with strategic messaging</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Your Learning Journey
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enroll</h3>
              <p className="text-sm text-gray-600">Join a cohort and get access to course materials and community</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Learn</h3>
              <p className="text-sm text-gray-600">Complete weekly modules with hands-on design and strategy projects</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share</h3>
              <p className="text-sm text-gray-600">Get feedback from instructors and community peers on your work</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Launch</h3>
              <p className="text-sm text-gray-600">Complete the course with a portfolio-ready brand strategy</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Creative Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Join a community of ambitious creators building real businesses through strategic creativity.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-10 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition text-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  )
}
