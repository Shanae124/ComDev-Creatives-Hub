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

        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Fonts & Typography Library</h3>
          <p className="text-gray-700 mb-4">
            Build stronger branding with consistent typography. Use these libraries to find clean,
            readable fonts for social posts, logos, and product labels.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <a href="https://fonts.google.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Google Fonts</a>
            <a href="https://fonts.adobe.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition text-center">Adobe Fonts</a>
            <a href="https://www.fontshare.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Fontshare</a>
            <a href="https://www.fontsquirrel.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Font Squirrel</a>
            <a href="https://www.dafont.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">DaFont (Check Licenses)</a>
            <a href="https://www.typewolf.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Typewolf Pairings</a>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Font Pairing & Inspiration</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <a href="https://fontjoy.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Fontjoy Pairings</a>
              <a href="https://fontpair.co/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Font Pair</a>
              <a href="https://typ.io/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Typ.io Examples</a>
              <a href="https://www.behance.net/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Behance Typography</a>
              <a href="https://dribbble.com/tags/typography" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Dribbble Typography</a>
              <a href="https://www.fontspace.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">FontSpace</a>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Assets, Icons & Mockups</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <a href="https://www.remove.bg/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Remove.bg (Backgrounds)</a>
            <a href="https://www.smartmockups.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Smartmockups</a>
            <a href="https://thenounproject.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Noun Project</a>
            <a href="https://www.flaticon.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Flaticon</a>
            <a href="https://www.pexels.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Pexels Photos</a>
            <a href="https://coolors.co/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Coolors Palettes</a>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">SVGs, Patterns & Design Elements</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <a href="https://www.svgrepo.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">SVG Repo</a>
              <a href="https://www.vecteezy.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Vecteezy</a>
              <a href="https://www.freepik.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Freepik (Check Licenses)</a>
              <a href="https://www.heropatterns.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Hero Patterns</a>
              <a href="https://haikei.app/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Haikei Shapes</a>
              <a href="https://www.transparenttextures.com/" target="_blank" rel="noreferrer" className="px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition text-center">Transparent Textures</a>
            </div>
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
              href="https://www.photopea.com/#new"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              New Design
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
