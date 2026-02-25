'use client'

import { useRouter } from 'next/navigation'
import courseData from '@/content/courses/cdd-comprehensive-social-media.json'
import { useState } from 'react'

interface Chapter {
  id: string
  title: string
  topics: string[]
  keyTakeaways: string[]
  resources: string[]
}

interface Module {
  id: string
  title: string
  subtitle: string
  chapters: Chapter[]
}

export default function CoursesPage() {
  const router = useRouter()
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  
  const modules = courseData.modules as Module[]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{courseData.title}</h1>
              <p className="text-gray-600 mt-2">{courseData.subtitle}</p>
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div>
                  <div className="text-sm text-gray-600">Global Users</div>
                  <div className="font-semibold text-gray-900 text-lg">{courseData.keyStats.globalUsers}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Daily Screen Time</div>
                  <div className="font-semibold text-gray-900 text-lg">{courseData.keyStats.avgScreenTime}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Commerce Growth</div>
                  <div className="font-semibold text-gray-900 text-lg">{courseData.keyStats.socialCommerceGrowth}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Marketing ROI</div>
                  <div className="font-semibold text-gray-900 text-lg">{courseData.keyStats.marketersReportingROI}</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Overview */}
        <section className="mb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {courseData.description}
              </p>
              <p className="text-gray-700 leading-relaxed">
                This comprehensive manual has been fully updated for 2025–2026 with chapters on TikTok, Threads, AI-powered content tools, social commerce strategies, and creator economy monetization. Every module includes practical tactics and real-world data.
              </p>
            </div>

            {/* Course Stats Card */}
            <div className="card p-6 h-fit">
              <h3 className="font-semibold text-gray-900 mb-4">Course Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Total Modules</div>
                  <div className="font-semibold text-gray-900">{courseData.totalModules} modules</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Chapters</div>
                  <div className="font-semibold text-gray-900">{courseData.totalChapters} chapters</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Edition</div>
                  <div className="font-semibold text-gray-900">Sixth Edition (2025–2026)</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Format</div>
                  <div className="font-semibold text-gray-900">Self-paced + On-demand</div>
                </div>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full mt-6 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Course Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Curriculum</h2>
          <div className="space-y-3">
            {modules.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 text-left transition"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg">{module.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{module.subtitle}</div>
                    <div className="text-xs text-gray-500 mt-2">{module.chapters.length} chapters • {module.chapters.reduce((acc, ch) => acc + ch.topics.length, 0)} topics</div>
                  </div>
                  <span className={`ml-4 text-gray-500 transition-transform ${expandedModule === module.id ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {expandedModule === module.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-4">
                    {module.chapters.map((chapter) => (
                      <div key={chapter.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left transition"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{chapter.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{chapter.topics.length} topics • {chapter.keyTakeaways.length} key takeaways</div>
                          </div>
                          <span className={`ml-2 text-gray-500 transition-transform ${expandedChapter === chapter.id ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        
                        {expandedChapter === chapter.id && (
                          <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-2">Topics Covered:</h5>
                              <ul className="space-y-1">
                                {chapter.topics.map((topic, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-primary-600 mt-1">•</span>
                                    <span>{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-2">Key Takeaways:</h5>
                              <ul className="space-y-1">
                                {chapter.keyTakeaways.slice(0, 4).map((takeaway, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-primary-600 font-bold">✓</span>
                                    <span>{takeaway}</span>
                                  </li>
                                ))}
                                {chapter.keyTakeaways.length > 4 && (
                                  <li className="text-sm text-gray-600 italic">+ {chapter.keyTakeaways.length - 4} more key takeaways</li>
                                )}
                              </ul>
                            </div>
                            
                            {chapter.resources.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Resources:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {chapter.resources.map((resource, idx) => (
                                    <span key={idx} className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                                      {resource}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Master Social Media Marketing?</h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Access all {courseData.totalModules} modules, {courseData.totalChapters} chapters, and hundreds of resources. Learn platform strategies, create professional content, and drive real business results.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Start Learning Free Today
          </button>
        </section>
      </main>
    </div>
  )
}
