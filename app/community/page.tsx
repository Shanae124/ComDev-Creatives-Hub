'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CommunityPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Cricut Help & How‑Tos</h1>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Back to Hub
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="bg-gradient-to-r from-primary-600 to-community-purple rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Troubleshooting & Community Solutions</h2>
          <p className="text-white/90">
            Find fixes for common Cricut issues and learn from the community.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Official Guides</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Cricut Design Space Help Center</li>
              <li>• Print Then Cut troubleshooting</li>
              <li>• Calibration and blade setup</li>
              <li>• Material settings & cut pressure</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://help.cricut.com/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cricut Help Center</a>
              <a href="https://help.cricut.com/hc/en-us/sections/360002553934-Calibration" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Calibration</a>
              <a href="https://help.cricut.com/hc/en-us/sections/360002554014-Materials" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Materials</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Community Solutions</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• r/cricut — troubleshooting and tips</li>
              <li>• r/cricutcrafting — project ideas and fixes</li>
              <li>• Ask for help using the form below</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.reddit.com/r/cricut/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">r/cricut</a>
              <a href="https://www.reddit.com/r/cricutcrafting/" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">r/cricutcrafting</a>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Request Troubleshooting Help</h4>
              {submitted && (
                <div className="mb-3 rounded-lg bg-green-50 text-green-700 text-sm px-3 py-2">
                  Thanks! Your request was submitted. An instructor will follow up.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  name="issueType"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select issue type</option>
                  <option value="cutting">Cutting / Material Issues</option>
                  <option value="print">Print Then Cut</option>
                  <option value="design">Design Space / Software</option>
                  <option value="hardware">Machine / Hardware</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  name="details"
                  placeholder="Describe the issue and what you've tried"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Submit Help Request
                </button>
              </form>
            </div>
          </div>
        </div>

        <section className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Troubleshooting FAQs</h3>
            <div className="space-y-3">
              <details className="group rounded-xl border border-gray-100 p-3">
                <summary className="cursor-pointer font-semibold text-gray-900">Print Then Cut not aligned</summary>
                <p className="mt-2 text-sm text-gray-700">Re‑calibrate, use good lighting for scanning, and ensure the sensor marks are not glossy.</p>
              </details>
              <details className="group rounded-xl border border-gray-100 p-3">
                <summary className="cursor-pointer font-semibold text-gray-900">Vinyl lifting or tearing</summary>
                <p className="mt-2 text-sm text-gray-700">Try a new blade, lower cut pressure one level, and use strong transfer tape.</p>
              </details>
              <details className="group rounded-xl border border-gray-100 p-3">
                <summary className="cursor-pointer font-semibold text-gray-900">Design looks stretched</summary>
                <p className="mt-2 text-sm text-gray-700">Check canvas size, lock proportions, and avoid resizing by dragging only one side.</p>
              </details>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
            <h3 className="text-xl font-bold mb-4">Featured Creators (Instagram)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add Instagram Reel or post links to feature great examples here.
            </p>
            <div className="grid gap-3">
              <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                Paste Instagram Reel URL here → will embed on this card.
              </div>
              <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                Paste Instagram Post URL here → will embed on this card.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
