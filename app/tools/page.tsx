'use client'

import { useRouter } from 'next/navigation'

const tools = [
  {
    category: 'Design & Branding',
    icon: '✏️',
    tools: [
      { name: 'Canva', desc: 'Graphics, flyers, social templates', url: 'https://www.canva.com/' },
      { name: 'Adobe Express', desc: 'Quick branding kits and graphics', url: 'https://express.adobe.com/' },
      { name: 'Cricut Design Space', desc: 'Cut files and design templates', url: 'https://design.cricut.com/' },
    ]
  },
  {
    category: 'Photo & Video Editing',
    icon: '🎬',
    tools: [
      { name: 'CapCut', desc: 'Short-form video editing', url: 'https://www.capcut.com/' },
      { name: 'InShot', desc: 'Mobile-friendly video editing', url: 'https://inshot.com/' },
      { name: 'Snapseed', desc: 'Photo touch-ups and filters', url: 'https://snapseed.online/' },
    ]
  },
  {
    category: 'Fonts & Typography',
    icon: 'Aa',
    tools: [
      { name: 'Google Fonts', desc: 'Free, professional fonts', url: 'https://fonts.google.com/' },
      { name: 'Fontshare', desc: 'Curated modern font pairs', url: 'https://www.fontshare.com/' },
      { name: 'Adobe Fonts', desc: 'Premium font library', url: 'https://fonts.adobe.com/' },
    ]
  },
  {
    category: 'Stock Assets',
    icon: '🖼️',
    tools: [
      { name: 'Unsplash', desc: 'Free high-quality photos', url: 'https://unsplash.com/' },
      { name: 'Pexels', desc: 'Free images and videos', url: 'https://www.pexels.com/' },
      { name: 'Mixkit', desc: 'Free video clips and effects', url: 'https://mixkit.co/' },
    ]
  },
  {
    category: 'Scheduling & Analytics',
    icon: '📊',
    tools: [
      { name: 'Meta Business Suite', desc: 'Facebook & Instagram posting', url: 'https://business.facebook.com/' },
      { name: 'TikTok Studio', desc: 'TikTok analytics & scheduling', url: 'https://www.tiktok.com/' },
      { name: 'Pinterest Analytics', desc: 'Track Pinterest performance', url: 'https://www.pinterest.com/' },
    ]
  },
  {
    category: 'Client & Sales Tools',
    icon: '💼',
    tools: [
      { name: 'Instagram DMs', desc: 'Direct client communication', url: 'https://www.instagram.com/' },
      { name: 'Linktree', desc: 'Link in bio page builder', url: 'https://linktr.ee/' },
      { name: 'Calendly', desc: 'Booking and scheduling', url: 'https://calendly.com/' },
    ]
  },
]

export default function ToolsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Tools & Apps</h1>
              <p className="text-gray-600 mt-2">Everything you need to create and manage your brand</p>
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
        {/* Featured Tool */}
        <section className="mb-12 card p-8 bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Design Studio</h2>
          <p className="text-gray-700 mb-6">
            Access our integrated design studio to create graphics, mockups, and social media assets right here in your learning hub.
          </p>
          <button
            onClick={() => router.push('/tools/design-studio')}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
          >
            Launch Design Studio
          </button>
        </section>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {tools.map((category) => (
            <div key={category.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
              </div>

              <div className="space-y-4">
                {category.tools.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="card p-4 hover:shadow-md transition block"
                  >
                    <h3 className="font-bold text-gray-900">{tool.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tool.desc}</p>
                    <span className="text-primary-600 text-sm font-medium mt-3 inline-block">
                      Open →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Getting Started */}
        <section className="mt-16 card p-8 bg-blue-50 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started with Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Step 1: Choose Your Tool</h3>
              <p className="text-sm text-gray-700">Pick the tool that best fits your task. For beginners, we recommend starting with Canva.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Step 2: Create & Experiment</h3>
              <p className="text-sm text-gray-700">Most tools are free to start. Sign up and explore the templates to get familiar with the interface.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Step 3: Share Feedback</h3>
              <p className="text-sm text-gray-700">Share your creations in the community forum to get constructive feedback from peers.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
