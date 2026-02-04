'use client'

import { useRouter } from 'next/navigation'

export default function ToolsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Tools & Apps</h1>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Back to Hub
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="bg-gradient-to-r from-primary-600 to-community-orange rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Everything You Need to Create & Post</h2>
              <p className="text-white/90">
                These tools help you design, edit, schedule, and manage your social media business.
              </p>
            </div>
            <button
              onClick={() => router.push('/tools/design-studio')}
              className="px-5 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              Open Design Studio
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Embedded Editor Preview</h3>
              <p className="text-sm text-gray-600">Quick edits inside the hub (Photopea).</p>
            </div>
            <button
              onClick={() => router.push('/tools/design-studio')}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg"
            >
              Launch Editor
            </button>
          </div>
          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
            <iframe
              title="Photopea Preview"
              src="https://www.photopea.com/"
              className="w-full h-64"
              allow="clipboard-read; clipboard-write"
            />
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Design & Branding</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Canva (graphics, flyers, stories)</li>
              <li>• Cricut Design Space (cut files & templates)</li>
              <li>• Adobe Express (quick branding kits)</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.canva.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg">Open Canva</a>
              <a href="https://express.adobe.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg">Adobe Express</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Fonts & Typography</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Google Fonts (clean, readable, free)</li>
              <li>• Adobe Fonts (premium styles)</li>
              <li>• Fontshare (modern pairings)</li>
              <li>• Typewolf (pairing inspiration)</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://fonts.google.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg">Google Fonts</a>
              <a href="https://fonts.adobe.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg">Adobe Fonts</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Photo & Video Editing</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• CapCut (short‑form video editing)</li>
              <li>• InShot (mobile video editing)</li>
              <li>• Snapseed (photo touch‑ups)</li>
              <li>• Lightroom Mobile (color correction)</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.capcut.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg">CapCut</a>
              <a href="https://www.adobe.com/products/photoshop-lightroom.html" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg">Lightroom</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Assets & Mockups</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Remove.bg (clean product cutouts)</li>
              <li>• Smartmockups (mockup previews)</li>
              <li>• Pexels (free photo assets)</li>
              <li>• Coolors (brand palettes)</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.remove.bg/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg">Remove.bg</a>
              <a href="https://www.smartmockups.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg">Smartmockups</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Scheduling & Publishing</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Meta Business Suite (Facebook & Instagram)</li>
              <li>• TikTok Studio (posting & analytics)</li>
              <li>• Pinterest (pins & scheduling)</li>
              <li>• Later or Buffer (multi‑platform scheduling)</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Client Engagement & Sales</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Instagram Direct Messages (client inquiries)</li>
              <li>• WhatsApp Business (quick responses)</li>
              <li>• Linktree (link in bio)</li>
              <li>• Etsy, Shopify, or Payhip (selling)</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Planning & Organization</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Google Drive (file storage)</li>
              <li>• Notion or Trello (content planning)</li>
              <li>• Google Sheets (pricing and inventory)</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Analytics & Growth</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Instagram Insights</li>
              <li>• TikTok Analytics</li>
              <li>• Pinterest Analytics</li>
              <li>• Google Trends (content ideas)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
