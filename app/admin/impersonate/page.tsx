'use client'

import React, { useEffect, useState } from 'react'
import {
  Eye,
  Search,
  UserCheck,
  Clock,
  LogOut,
  Filter,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import apiClient, { adminAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'

export default function ImpersonatePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const { startImpersonation, user } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [impersonationLog, setImpersonationLog] = useState([
    {
      id: 1,
      admin: 'Admin User',
      user: 'Alice Johnson (student@example.com)',
      startTime: '2024-01-20 14:30',
      endTime: '2024-01-20 14:45',
      duration: '15 min',
      actions: 'Viewed grades, checked assignments',
    },
    {
      id: 2,
      admin: 'Admin User',
      user: 'Bob Smith (instructor@example.com)',
      startTime: '2024-01-19 10:00',
      endTime: '2024-01-19 10:20',
      duration: '20 min',
      actions: 'Reviewed course settings',
    },
  ])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await apiClient.get('/users')
        const normalized = (data || []).map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: 'active' }))
        setUsers(normalized)
      } catch (e) {
        console.error('Failed to load users', e)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleImpersonate = async (targetUser: any) => {
    try {
      const { data } = await adminAPI.impersonate(targetUser.id)
      setSelectedUser(targetUser)
      setIsImpersonating(true)
      startImpersonation({ id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role }, data.token)
    } catch (e) {
      console.error('Failed to impersonate user', e)
      alert('Failed to impersonate user')
    }
  }

  const handleEndImpersonation = async () => {
    try {
      const { data } = await adminAPI.stopImpersonation()
      setIsImpersonating(false)
      setSelectedUser(null)
      // Nav bar banner handles store update on stop
    } catch (e) {
      console.error('Failed to end impersonation', e)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Impersonate User</h1>
          <p className="text-slate-600 dark:text-slate-400">Login as another user to provide support or troubleshoot issues</p>
          <p className="text-xs text-slate-500 mt-1">Your role: {user?.role}</p>
        </div>

        {isImpersonating ? (
          // Impersonation Active
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Currently Impersonating
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-2">
                  You are logged in as <strong>{selectedUser.name}</strong> ({selectedUser.email})
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                  All actions will be attributed to this user. Be careful!
                </p>
                <div className="mt-4 flex gap-2">
                  <a href="/courses" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm">
                    <Eye className="w-4 h-4" /> View My Courses
                  </a>
                  <a href="/dashboard" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm dark:bg-slate-700 dark:hover:bg-slate-600">
                    Go to Dashboard
                  </a>
                </div>
              </div>
              <Button onClick={handleEndImpersonation} className="gap-2 bg-amber-600 hover:bg-amber-700">
                <LogOut className="w-4 h-4" />
                End Impersonation
              </Button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Search & Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Select User</h2>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Active Only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Students</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Instructors</span>
                </label>
              </div>

              {/* User List */}
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleImpersonate(user)}
                    disabled={isImpersonating && selectedUser?.id === user.id}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                      isImpersonating && selectedUser?.id === user.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">
                        {user.role}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Impersonation Log & Info */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Impersonation History
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Admin</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Start Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {impersonationLog.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{log.admin}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{log.user}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{log.startTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.duration}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{log.actions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Guidelines */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">Impersonation Guidelines</h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                <li>✓ Use impersonation to provide technical support or troubleshoot issues</li>
                <li>✓ All impersonation sessions are logged and audited</li>
                <li>✓ Inform users when you're impersonating them</li>
                <li>✗ Do not impersonate users without legitimate administrative reason</li>
                <li>✗ Do not modify user data while impersonating</li>
                <li>✗ Do not share impersonation credentials with other users</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
