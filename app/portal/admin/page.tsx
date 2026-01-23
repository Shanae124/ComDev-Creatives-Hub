'use client'

import Link from 'next/link'
import { Shield, Users, Puzzle, Settings, BookOpen, BarChart3 } from 'lucide-react'

export default function AdminPortalPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-slate-600 dark:text-slate-400">Administrative tools and configuration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PortalCard href="/admin" icon={<Shield className="w-6 h-6" />} title="Admin Dashboard" desc="Overview and stats" />
          <PortalCard href="/admin/users" icon={<Users className="w-6 h-6" />} title="Users" desc="Manage user accounts" />
          <PortalCard href="/admin/plugins" icon={<Puzzle className="w-6 h-6" />} title="Plugins" desc="Extend LMS capabilities" />
          <PortalCard href="/admin/settings" icon={<Settings className="w-6 h-6" />} title="Settings" desc="System and course settings" />
          <PortalCard href="/admin/courses" icon={<BookOpen className="w-6 h-6" />} title="Courses" desc="Manage courses and modules" />
          <PortalCard href="/admin/impersonate" icon={<BarChart3 className="w-6 h-6" />} title="Impersonate" desc="Support users by switching profiles" />
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
