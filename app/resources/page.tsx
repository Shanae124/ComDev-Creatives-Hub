'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResourcesPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')

  const captionLibrary = [
    '"Transform your brand from invisible to unforgettable. Custom designs that tell your story."',
    '"Your designs deserve an audience. Let\'s get your work in front of people who love it."',
    '"Consistency builds community. Weekly content, authentic voice, real connection."',
    '"Done better than perfect. Ship your ideas, get feedback, keep improving."'
  ]

  const generateHelp = () => {
    const text = prompt.toLowerCase()
    if (!text.trim()) {
      setResponse('Type a question to get help with captions, hashtags, content strategy, or design resources.')
      return
    }
    if (text.includes('caption') || text.includes('copy')) {
      setResponse(`Caption ideas:\n• ${captionLibrary.join('\n• ')}`)
    } else if (text.includes('hashtag') || text.includes('tag')) {
      setResponse('#SocialMediaForCrafters #CreativeEntrepreneur #InstaDesign #CricutMaker #HandmadeWithLove #SmallBusinessOwner #DesignStudio #ContentCreator #CreatorsUnited')
    } else {
      setResponse('Try asking about: captions, hashtags, or content strategy.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Resources & Tools</h1>
              <p className="text-gray-600 mt-2">Everything you need to create, post, and grow</p>
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
        {/* AI Helper Section */}
        <section className="mb-12 card p-8 bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Creator Helper</h2>
          <p className="text-gray-700 mb-6">
            Use this AI-powered helper to get instant caption, hashtag, and content strategy ideas. Perfect for when you're stuck or need fresh inspiration.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">What do you need help with?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: 'Give me captions for a Valentine's wine glass post' or 'What hashtags should I use?'"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={generateHelp}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
            >
              Generate Ideas
            </button>
            {response && (
              <div className="card p-4 bg-gray-50 border border-gray-300">
                <p className="text-sm text-gray-700 whitespace-pre-line">{response}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(response)}
                  className="mt-3 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition border border-primary-200"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Resource Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Core Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Fonts & Typography */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                Aa
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Typography & Fonts</h3>
              <p className="text-gray-700 mb-4">
                Discover free, high-quality fonts and learn typography principles for professional designs.
              </p>
              <div className="space-y-2">
                <a href="https://fonts.google.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Google Fonts
                </a>
                <a href="https://www.fontshare.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Fontshare
                </a>
                <a href="https://www.adobe.com/fonts/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Adobe Fonts
                </a>
              </div>
            </div>

            {/* Stock Images */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                🖼️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Stock Photos & Videos</h3>
              <p className="text-gray-700 mb-4">
                Free, high-resolution images and videos for your social media and design work.
              </p>
              <div className="space-y-2">
                <a href="https://unsplash.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Unsplash (Images)
                </a>
                <a href="https://www.pexels.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Pexels (Images & Videos)
                </a>
                <a href="https://mixkit.co/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Mixkit (Video Clips)
                </a>
              </div>
            </div>

            {/* Design Tools */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                ✏️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Design & Editing</h3>
              <p className="text-gray-700 mb-4">
                Professional tools for creating graphics, editing photos, and designing content.
              </p>
              <div className="space-y-2">
                <a href="https://www.canva.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Canva (Beginner-Friendly)
                </a>
                <a href="https://express.adobe.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Adobe Express (Powerful)
                </a>
                <a href="https://www.photopea.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Photopea (Advanced)
                </a>
              </div>
            </div>

            {/* Video Editing */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                🎬
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Video Editing</h3>
              <p className="text-gray-700 mb-4">
                Fast, easy tools for creating short-form videos for Instagram, TikTok, and reels.
              </p>
              <div className="space-y-2">
                <a href="https://www.capcut.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → CapCut (Free & Powerful)
                </a>
                <a href="https://inshot.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → InShot (Mobile-Friendly)
                </a>
                <a href="https://www.descript.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Descript (AI-Powered)
                </a>
              </div>
            </div>

            {/* Social Media Tools */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                📱
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Social Management</h3>
              <p className="text-gray-700 mb-4">
                Schedule posts, analyze metrics, and manage multiple platforms in one place.
              </p>
              <div className="space-y-2">
                <a href="https://business.facebook.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Meta Business Suite
                </a>
                <a href="https://www.later.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Later (Scheduling)
                </a>
                <a href="https://hootsuite.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Hootsuite (Analytics)
                </a>
              </div>
            </div>

            {/* Cricut Help */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                🔧
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cricut Resources</h3>
              <p className="text-gray-700 mb-4">
                Official Cricut help, troubleshooting guides, and community support forums.
              </p>
              <div className="space-y-2">
                <a href="https://help.cricut.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Cricut Help Center
                </a>
                <a href="https://www.reddit.com/r/cricut/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → r/cricut Community
                </a>
                <a href="https://design.cricut.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  → Cricut Design Space
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Guides */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Quick Learning Guides</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Caption Formula That Works</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold text-gray-900">Hook:</span> Start with curiosity or a question
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold text-gray-900">Benefit:</span> Tell them what they gain
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold text-gray-900">Proof:</span> Show evidence or results
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold text-gray-900">CTA:</span> Tell them exactly what to do next
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Content Pillars Template</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold text-gray-900">Behind-the-Scenes:</span> Process and story
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold text-gray-900">Product Showcase:</span> Features and benefits
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold text-gray-900">Community:</span> Customer wins and testimonials
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold text-gray-900">Education:</span> Tips, tutorials, and guidance
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
