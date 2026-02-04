import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'ComDev Creatives Hub | Community Development Learning Platform',
  description: 'Learn social media marketing and Cricut design through hands-on projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-primary-600">
              <span className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm">CD</span>
              <span>ComDev Creatives Hub</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-4 text-sm">
              <Link className="nav-link" href="/student/dashboard">Hub</Link>
              <Link className="nav-link" href="/courses">Courses</Link>
              <Link className="nav-link" href="/tools">Tools</Link>
              <Link className="nav-link" href="/tools/design-studio">Design Studio</Link>
              <Link className="nav-link" href="/resources">Resources</Link>
              <Link className="nav-link" href="/slides">Slides</Link>
              <Link className="nav-link" href="/manual">Manual</Link>
              <Link className="nav-link" href="/community">Help</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-3 py-2 text-xs font-semibold text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50">Sign In</Link>
              <Link href="/register" className="px-3 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700">Join</Link>
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}
