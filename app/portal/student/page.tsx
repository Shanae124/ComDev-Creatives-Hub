'use client'

import Link from 'next/link'
import { LayoutDashboard, BookOpen, Calendar, MessageSquare, Video } from 'lucide-react'

export default function StudentPortalPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Student Portal</h1>
          <p className="text-slate-600 dark:text-slate-400">Quick access to your learning tools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PortalCard href="/dashboard" icon={<LayoutDashboard className="w-6 h-6" />} title="Dashboard" desc="Overview of your activity" />
          <PortalCard href="/courses" icon={<BookOpen className="w-6 h-6" />} title="Courses" desc="Browse and access courses" />
          <PortalCard href="/calendar" icon={<Calendar className="w-6 h-6" />} title="Calendar" desc="View upcoming events" />
          <PortalCard href="/announcements" icon={<MessageSquare className="w-6 h-6" />} title="Announcements" desc="Course updates and news" />
          <PortalCard href="/meetings" icon={<Video className="w-6 h-6" />} title="Meetings" desc="Join live classes" />
        </div>
      </div>
    </div>
  )
}

function PortalCard({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href} className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm">{desc}</p>
    </Link>
  )
}
