'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-10 flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
              CDD
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-3">
                ComDev <span className="text-primary-600">Creatives Hub</span>
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Community Development Department
              </p>
              <p className="text-sm text-gray-500 mt-2">Empowering Creative Entrepreneurs</p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Social Media Marketing for Crafters (4 Weeks)
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Learn branding, promotion, and client engagement for the event décor industry through
              <strong> hands-on creation</strong>—no PowerPoint slides, just real work that builds your portfolio.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2">Design Projects</h3>
              <p className="text-gray-600">Create real Cricut designs and build your brand identity</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Social Media Mastery</h3>
              <p className="text-gray-600">Learn Instagram, TikTok & Pinterest strategies that work</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Peer Collaboration</h3>
              <p className="text-gray-600">Get feedback, share ideas, and learn together</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-primary-600 text-white rounded-lg font-bold text-lg hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-bold text-lg hover:bg-primary-50 transition"
            >
              Sign In
            </button>
          </div>

          {/* Program Overview */}
          <div className="mt-16 grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-left">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Key Topics</h3>
              <ul className="space-y-3 text-gray-700">
                <li>• Creating engaging content</li>
                <li>• Photography and video tips</li>
                <li>• Writing compelling product descriptions</li>
                <li>• Utilizing relevant hashtags</li>
                <li>• Managing client inquiries via direct messaging</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-left">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Outcome</h3>
              <p className="text-gray-700 leading-relaxed">
                Students will be equipped to set up and manage a professional social media
                portfolio that effectively converts followers into paying customers.
              </p>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">What Makes Us Different</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="font-bold mb-1">No Boring Slides</h4>
                  <p className="text-gray-600 text-sm">Learn by doing, not reading PowerPoints</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="font-bold mb-1">Real Portfolio Pieces</h4>
                  <p className="text-gray-600 text-sm">Every project builds your professional portfolio</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="font-bold mb-1">Practical Skills</h4>
                  <p className="text-gray-600 text-sm">Apply what you learn immediately to your business</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="font-bold mb-1">Community Support</h4>
                  <p className="text-gray-600 text-sm">Learn alongside other creative entrepreneurs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Community Development Department. Empowering Creative Entrepreneurs.
          </p>
        </div>
      </footer>
    </div>
  )
}
