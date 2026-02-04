'use client'

import { useRouter } from 'next/navigation'
import course from '../../content/courses/cdd-social-media.json'

const mediaReferences = [
  {
    title: 'Product Photography: Craft a Perfect Setup (Shopify)',
    description: 'Visual guide for clean, professional product photos.',
    url: 'https://www.shopify.com/blog/product-photography'
  },
  {
    title: 'Font Pairing Inspiration (Playbook)',
    description: 'Examples of clean font combinations for branding.',
    url: 'https://www.playbook.com/'
  },
  {
    title: 'Font Pairing Principles (Adobe Design)',
    description: 'Principles for pairing decorative and readable fonts.',
    url: 'https://adobe.design/'
  },
  {
    title: 'Instagram Carousel Ideas (Oraco)',
    description: 'Examples of engaging product posts.',
    url: 'https://oraco.com.au/'
  },
  {
    title: 'Product Launch Content Ideas',
    description: 'Examples of launch posts and engagement tactics.',
    url: 'https://contentstadium.com/'
  },
  {
    title: 'Metrics & Reporting Tools',
    description: 'Simple reporting tools to track performance.',
    url: 'https://statusbrew.com/'
  }
]

export default function ManualPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Training Manual</h1>
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
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">{course.title}</h2>
              <p className="text-white/90 mb-4">{course.subtitle}</p>
              <div className="text-sm text-white/80">Facilitator: {course.facilitator}</div>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/20 shadow-lg bg-white/10">
              <img
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop"
                alt="Social media marketing workspace"
                className="w-full h-56 object-cover"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Table of Contents</h3>
          <div className="grid md:grid-cols-2 gap-3 text-gray-700 text-sm">
            {course.modules.map((module) => (
              <div key={module.title} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                {module.title}
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          {course.modules.map((module) => (
            <div key={module.title} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                <img
                  src={module.image.src}
                  alt={module.image.alt}
                  className="w-full h-40 object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{module.title}</h3>
              <p className="text-gray-600 mb-3">{module.subtitle}</p>
              <p className="text-gray-700 mb-4">{module.overview}</p>
              <div className="space-y-3">
                {module.lessons.map((lesson) => (
                  <div key={lesson.title} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="font-semibold text-gray-900">{lesson.title}</div>
                    <div className="text-sm text-gray-700 mt-1">{lesson.body}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Media & Visuals</h3>
          <p className="text-sm text-gray-600 mb-4">
            Visual examples used throughout the course for photography, branding, and content creation.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
                alt="Content planning workspace"
                className="w-full h-40 object-cover"
              />
              <div className="p-3 text-sm text-gray-700">Content planning and scheduling</div>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop"
                alt="Portrait branding"
                className="w-full h-40 object-cover"
              />
              <div className="p-3 text-sm text-gray-700">Brand visuals and identity</div>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop"
                alt="Product styling"
                className="w-full h-40 object-cover"
              />
              <div className="p-3 text-sm text-gray-700">Product styling and photography</div>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop"
                alt="Video creation"
                className="w-full h-40 object-cover"
              />
              <div className="p-3 text-sm text-gray-700">Short‑form video creation</div>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop"
                alt="Client engagement"
                className="w-full h-40 object-cover"
              />
              <div className="p-3 text-sm text-gray-700">Client engagement and messaging</div>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop"
                alt="Metrics and analytics"
                className="w-full h-40 object-cover"
              />
              <div className="p-3 text-sm text-gray-700">Metrics and performance tracking</div>
            </div>
          </div>
        </section>

        <section className="mt-10 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Media & Visual References</h3>
          <p className="text-sm text-gray-600 mb-4">
            Curated reference links used to support learning. These open in a new tab.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {mediaReferences.map((media) => (
              <a
                key={media.title}
                href={media.url}
                target="_blank"
                rel="noreferrer"
                className="block bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="font-semibold text-gray-900">{media.title}</div>
                <div className="text-sm text-gray-600">{media.description}</div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
