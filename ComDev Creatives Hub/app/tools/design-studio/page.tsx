'use client'

import { useRouter } from 'next/navigation'

export default function DesignStudioPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Design Studio</h1>
          <button
            onClick={() => router.push('/tools')}
            className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Back to Tools
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Designs Inside the Hub</h2>
          <p className="text-gray-700">
            The embedded editor below is fully functional and works in‑browser. You can also
            open professional tools (Canva, Adobe Express, Figma, CapCut) in new tabs.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Real Design Tools (Open in New Tab)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://www.canva.com/"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition text-center"
            >
              Canva
            </a>
            <a
              href="https://express.adobe.com/"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition text-center"
            >
              Adobe Express
            </a>
            <a
              href="https://www.figma.com/"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              Figma
            </a>
            <a
              href="https://www.capcut.com/"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              CapCut
            </a>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Embedded Editor (Photopea)</h3>
          <p className="text-gray-600 text-sm mb-4">
            Works fully in‑browser for PNG, JPG, PDF, PSD, and SVG edits. Great for quick social post designs.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <a
              href="https://www.photopea.com/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Open Full Editor
            </a>
            <a
              href="https://www.photopea.com/#iU6G5Yb3v"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Social Post (Square)
            </a>
            <a
              href="https://www.photopea.com/#jD4Qd2v8x"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Story (1080×1920)
            </a>
            <a
              href="https://www.photopea.com/#bH9Y1aT3n"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Pinterest Pin (1000×1500)
            </a>
          </div>

          <div className="aspect-[16/9] w-full rounded-lg overflow-hidden border border-gray-200">
            <iframe
              title="Photopea Editor"
              src="https://www.photopea.com/"
              className="w-full h-full"
              allow="clipboard-read; clipboard-write"
              allowFullScreen
            />
          </div>
        </section>
      </main>
    </div>
  )
}
