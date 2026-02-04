'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const slides = [
  {
    title: 'Why Social Media Matters for Product‑Based Businesses',
    subtitle: 'Introductory Session',
    body: 'Social media is your digital storefront. Customers decide whether to trust you before they ever message or buy. Great visuals and clear messaging build confidence fast.',
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'What Social Media Does for You',
    subtitle: 'The Business View',
    body: 'It is a marketing channel, a customer communication tool, a brand showcase, and a sales support platform — all in one place.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'Leverage Social Media Intentionally',
    subtitle: 'Be Clear, Not Random',
    body: 'Every post should have a purpose: show quality, build trust, educate, or invite contact. Consistency beats frequency.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'Choose the Right Platforms',
    subtitle: 'Start Simple',
    body: 'Beginners should focus on 1–2 platforms that match their product. Instagram and TikTok are visual; Facebook supports community and sales conversations.',
    image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec0559b?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'Types of Social Media Content',
    subtitle: 'What to Post',
    body: 'Use a mix of product photos, short videos, behind‑the‑scenes, and customer proof. This builds both trust and momentum.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'Today’s Action',
    subtitle: 'Get Started',
    body: 'Pick your main platform. Define your first 3 content ideas. Start with one clear post this week.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1400&auto=format&fit=crop'
  }
]

export default function IntroSlidesPage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)

  const slide = slides[index]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-black/60 backdrop-blur border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Intro Slides: Social Media Foundations</h1>
          <button
            onClick={() => router.push('/slides')}
            className="px-3 py-2 text-xs border border-white/20 rounded-lg hover:bg-white/10"
          >
            Back to Slides
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img src={slide.image} alt={slide.title} className="w-full h-[420px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="absolute inset-0 p-10 flex flex-col justify-end">
            <div className="text-sm uppercase tracking-widest text-white/70">{slide.subtitle}</div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">{slide.title}</h2>
            <p className="text-white/85 max-w-3xl mt-3 text-lg">{slide.body}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
            className="px-4 py-2 rounded-lg border border-white/20 disabled:opacity-40"
          >
            Previous
          </button>
          <div className="text-sm text-white/70">
            Slide {index + 1} of {slides.length}
          </div>
          <button
            onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}
            disabled={index === slides.length - 1}
            className="px-4 py-2 rounded-lg border border-white/20 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  )
}
