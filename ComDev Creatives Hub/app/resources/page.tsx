'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResourcesPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [previewText, setPreviewText] = useState('Valentine’s Wine Glasses')
  const [fontSize, setFontSize] = useState(28)

  const captionLibrary = [
    '“Toast to love 🥂✨ Personalized Valentine wine glasses for cozy nights in. DM to customize yours.”',
    '“Sip, sparkle, repeat 💕 These custom Valentine glasses make the sweetest gift. Limited spots this week!”',
    '“From plain to personal ✨ Valentine wine glasses made just for you. Message to order.”',
    '“Date‑night ready 🍷💕 Add names, dates, or a special message. Orders open now.”'
  ]

  const hashtagSets = [
    '#ValentinesDay #CustomGifts #CricutMaker #WineGlasses #Handmade #SmallBusiness #EventDecor #GiftIdeas #MadeWithLove #Personalized',
    '#ValentineGift #CustomTumblers #CricutCrafting #HandmadeGifts #CouplesGift #LocalMakers #CustomDesign #LoveSeason #ShopSmall #Creator'
  ]

  const scriptPrompts = [
    'Hook: “Watch this plain glass turn Valentine‑ready in 10 seconds.” → Process clips → Reveal → CTA “DM to customize.”',
    'Hook: “Your name + your favorite quote = the perfect Valentine gift.” → Design screen → Weeding → Final pour shot → CTA “Save this idea.”'
  ]

  const troubleshootTips = [
    'Cuts not clean? Re‑calibrate blade, increase pressure one level, and replace dull blade. Test on scrap.',
    'Vinyl not sticking? Clean glass with alcohol, avoid touching surface, and use strong transfer tape.'
  ]

  const generateHelp = () => {
    const text = prompt.toLowerCase()

    if (!text.trim()) {
      setResponse('Type a question to get help with captions, hashtags, scripts, or troubleshooting.')
      return
    }

    if (text.includes('caption') || text.includes('valentine') || text.includes('wine glass')) {
      setResponse(`Caption ideas:\n• ${captionLibrary.join('\n• ')}`)
      return
    }

    if (text.includes('hashtag')) {
      setResponse(`Hashtag sets:\n• ${hashtagSets.join('\n• ')}`)
      return
    }

    if (text.includes('calendar') || text.includes('content plan')) {
      setResponse('Content calendar idea: 3 pillars (Behind‑the‑Scenes, Product Spotlight, Customer Proof). Post 3×/week: Mon‑BTS, Wed‑Product, Fri‑Testimonial. Add 1 Reel weekly showing the making process.')
      return
    }

    if (text.includes('script') || text.includes('video')) {
      setResponse(`Short‑form script ideas:\n• ${scriptPrompts.join('\n• ')}`)
      return
    }

    if (text.includes('error') || text.includes('troubleshoot') || text.includes('issue')) {
      setResponse(`Troubleshooting tips:\n• ${troubleshootTips.join('\n• ')}`)
      return
    }

    setResponse('Try asking about: captions, hashtags, content calendar, video scripts, or troubleshooting errors.')
  }

  const copyOutput = async () => {
    if (!response) return
    await navigator.clipboard.writeText(response)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Resource Library</h1>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Back to Hub
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="bg-gradient-to-r from-primary-600 to-community-green rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">All‑in‑One Creator Toolkit</h2>
              <p className="text-white/90">
                Interactive tools, Cricut fixes, font libraries, and media resources to help you create better content faster.
              </p>
            </div>
            <button
              onClick={() => router.push('/manual')}
              className="px-5 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              Open Training Manual
            </button>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Interactive Practice</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Content Calendar Builder (in class templates)</li>
              <li>• Caption & Hashtag prompts</li>
              <li>• Post critique checklist</li>
              <li>• Short‑form video script prompts</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg">Open Content Planner</button>
              <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg">Checklist</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-2">AI Helper (Interactive)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get instant ideas for captions, hashtags, scripts, and troubleshooting. (Local helper)
            </p>
            <div className="space-y-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask for captions, hashtags, content calendar ideas, or troubleshooting help..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={generateHelp}
                className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Generate Help
              </button>
              {response && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                  <div className="whitespace-pre-line">{response}</div>
                  <button
                    onClick={copyOutput}
                    className="mt-3 px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    Copy Output
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Cricut Help & Fixes</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Cricut Design Space Help Center</li>
              <li>• Blade calibration and material settings</li>
              <li>• Print then Cut troubleshooting</li>
              <li>• Vinyl, HTV, and paper quick guides</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://help.cricut.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cricut Help</a>
              <a href="https://www.reddit.com/r/cricut/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">r/cricut</a>
              <a href="https://www.reddit.com/r/cricutcrafting/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">r/cricutcrafting</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Fonts & Media Libraries</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Google Fonts (free, commercial‑safe fonts)</li>
              <li>• Fontshare (curated free fonts)</li>
              <li>• Unsplash & Pexels (free photos)</li>
              <li>• Mixkit (free video clips)</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://fonts.google.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Google Fonts</a>
              <a href="https://www.fontshare.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Fontshare</a>
              <a href="https://unsplash.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Unsplash</a>
              <a href="https://www.pexels.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Pexels</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Typography & Visual Hierarchy</h3>
            <p className="text-gray-700 text-sm mb-4">
              Use clean font pairs for professional social posts. Mix a bold headline with a readable body font.
            </p>
            <div className="mb-3">
              <label className="text-xs text-gray-500">Preview Text</label>
              <input
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500">Font Size: {fontSize}px</label>
              <input
                type="range"
                min={18}
                max={44}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="grid gap-3">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="font-bold" style={{ fontSize }}>{previewText}</div>
                <div className="text-sm text-gray-600">Custom names • Limited batch • DM to order</div>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="text-3xl font-extrabold tracking-tight">Your Love Story</div>
                <div className="text-sm text-gray-600">Personalized glassware for date night</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-primary-50 text-primary-700">Headlines: Bold</span>
              <span className="px-3 py-1 text-xs rounded-full bg-primary-50 text-primary-700">Body: Clean</span>
              <span className="px-3 py-1 text-xs rounded-full bg-primary-50 text-primary-700">Spacing: Airy</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Content Creation Tools</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Canva, Adobe Express, Photopea</li>
              <li>• CapCut & InShot (video editing)</li>
              <li>• Meta Business Suite (scheduling)</li>
              <li>• TikTok Studio and Pinterest Analytics</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.canva.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Canva</a>
              <a href="https://express.adobe.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Adobe Express</a>
              <a href="https://www.photopea.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Photopea</a>
              <a href="https://www.capcut.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">CapCut</a>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Embedded Video Lesson</h3>
            <p className="text-sm text-gray-600 mb-3">Short example on creating a product post (placeholder video).</p>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <video controls className="w-full h-48 object-cover">
                <source src="https://samplelib.com/lib/preview/mp4/sample-5s.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
