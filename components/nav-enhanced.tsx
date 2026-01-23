'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bell,
  Search,
  Users,
  Puzzle,
  Eye,
  MessageSquare,
  BarChart3,
  FileText,
  Shield,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/auth-store'
import { adminAPI } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

export default function NavEnhanced() {
  const router = useRouter()
  const { user, logout, impersonating, stopImpersonation } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationCount] = useState(3)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isAdmin = user?.role === 'admin'
  const isInstructor = user?.role === 'instructor'

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
      {impersonating && (
        <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 px-4 py-2 border-b border-amber-200 dark:border-amber-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              You are impersonating another user. Actions reflect the impersonated account.
            </span>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={async () => {
                try {
                  const { data } = await adminAPI.stopImpersonation()
                  stopImpersonation(data.token)
                } catch (e) {
                  console.error('Failed to stop impersonation', e)
                }
              }}
            >
              End Impersonation
            </Button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:inline text-slate-900 dark:text-white">
                ProtexxaLearn
              </span>
            </Link>

            {/* Main Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
              <NavLink href="/courses" icon={<BookOpen className="w-4 h-4" />} label="Courses" />

              {isInstructor && (
                <>
                  <NavLink href="/admin/instructor" icon={<BarChart3 className="w-4 h-4" />} label="Grading" />
                  <NavLink href="/gradebook" icon={<BarChart3 className="w-4 h-4" />} label="Gradebook" />
                  <NavLink href="/pages-builder" icon={<FileText className="w-4 h-4" />} label="Pages" />
                  <NavLink href="/quizzes" icon={<Puzzle className="w-4 h-4" />} label="Quizzes" />
                </>
              )}

              {isAdmin && (
                <>
                  <NavLink href="/admin" icon={<Shield className="w-4 h-4" />} label="Admin" />
                  <NavLink href="/admin/users" icon={<Users className="w-4 h-4" />} label="Users" />
                  <NavLink href="/admin/plugins" icon={<Puzzle className="w-4 h-4" />} label="Plugins" />
                  <NavLink href="/portal/admin" icon={<Shield className="w-4 h-4" />} label="Admin Portal" />
                </>
              )}

              <NavLink href="/portal/student" icon={<Briefcase className="w-4 h-4" />} label="Student Portal" />

              <NavLink href="/support" icon={<HelpCircle className="w-4 h-4" />} label="Help" />
            </div>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm w-48"
              />
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="p-3 rounded border border-slate-200 dark:border-slate-700 mb-2">
                    <p className="font-medium">Assignment due tomorrow</p>
                    <p className="text-xs text-slate-500">Math 101: Problem Set 5</p>
                  </div>
                  <div className="p-3 rounded border border-slate-200 dark:border-slate-700">
                    <p className="font-medium">New message from instructor</p>
                    <p className="text-xs text-slate-500">Check your course announcements</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="text-xs text-slate-500 font-normal">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/impersonate" className="flex items-center gap-2 cursor-pointer">
                        <Eye className="w-4 h-4" />
                        <span>Impersonate User</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                  <LogOut className="w-4 h-4" />
                  <span onClick={handleLogout}>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2 pt-4">
              <MobileNavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
              <MobileNavLink href="/courses" icon={<BookOpen className="w-4 h-4" />} label="Courses" />

              {isInstructor && (
                <>
                  <MobileNavLink href="/admin/instructor" icon={<BarChart3 className="w-4 h-4" />} label="Grading" />
                  <MobileNavLink href="/gradebook" icon={<BarChart3 className="w-4 h-4" />} label="Gradebook" />
                  <MobileNavLink href="/pages-builder" icon={<FileText className="w-4 h-4" />} label="Pages" />
                  <MobileNavLink href="/quizzes" icon={<Puzzle className="w-4 h-4" />} label="Quizzes" />
                </>
              )}

              {isAdmin && (
                <>
                  <MobileNavLink href="/admin" icon={<Shield className="w-4 h-4" />} label="Admin" />
                  <MobileNavLink href="/admin/users" icon={<Users className="w-4 h-4" />} label="Users" />
                  <MobileNavLink href="/admin/plugins" icon={<Puzzle className="w-4 h-4" />} label="Plugins" />
                </>
              )}

                  <MobileNavLink href="/support" icon={<HelpCircle className="w-4 h-4" />} label="Help" />
                  <MobileNavLink href="/portal/student" icon={<Briefcase className="w-4 h-4" />} label="Student Portal" />
                  {isAdmin && <MobileNavLink href="/portal/admin" icon={<Shield className="w-4 h-4" />} label="Admin Portal" />}
              <MobileNavLink href="/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
    >
      {icon}
      {label}
    </Link>
  )
}

function MobileNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
    >
      {icon}
      {label}
    </Link>
  )
}
