import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'ComDev Creatives Hub | Professional Learning Platform',
  description: 'Master social media marketing and creative design through project-based learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        {/* Global Header/Navigation */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-9 h-9 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  CD
                </div>
                <span className="hidden sm:inline font-bold text-gray-900 text-lg">ComDev Creatives</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-6">
                <Link href="/courses" className="nav-link text-sm">Courses</Link>
                <Link href="/resources" className="nav-link text-sm">Resources</Link>
                <Link href="/community" className="nav-link text-sm">Community</Link>
                <Link href="/tools/design-studio" className="nav-link text-sm">Tools</Link>
              </nav>

              {/* Auth Buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition hidden sm:inline-block"
                >
                  Join
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen bg-white">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white font-semibold mb-4">ComDev Creatives</h3>
                <p className="text-sm text-gray-400">Building community through creative entrepreneurship.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/courses" className="text-gray-400 hover:text-white transition">Courses</Link></li>
                  <li><Link href="/tools" className="text-gray-400 hover:text-white transition">Tools</Link></li>
                  <li><Link href="/resources" className="text-gray-400 hover:text-white transition">Resources</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Community</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/community" className="text-gray-400 hover:text-white transition">Discussions</Link></li>
                  <li><Link href="/student/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Department</h4>
                <p className="text-sm text-gray-400">Community Development<br />Empowering Creative Entrepreneurs</p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>© {new Date().getFullYear()} Community Development Department. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
