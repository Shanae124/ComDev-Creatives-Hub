'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const raw = await response.text()
      let data: any = {}
      if (raw) {
        try {
          data = JSON.parse(raw)
        } catch {
          data = {}
        }
      }

      if (!response.ok) {
        throw new Error(data.error || `Reset failed (${response.status})`)
      }

      setSuccess('Password updated successfully. Redirecting to login...')
      setTimeout(() => router.push('/login'), 1200)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-6">Update your password to continue using your account.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            required
            placeholder="Current password"
            value={formData.currentPassword}
            onChange={(event) => setFormData({ ...formData, currentPassword: event.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            required
            placeholder="New password"
            value={formData.newPassword}
            onChange={(event) => setFormData({ ...formData, newPassword: event.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            required
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
