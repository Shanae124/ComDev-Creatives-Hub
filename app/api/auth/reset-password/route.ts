import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { readDb, writeDb } from '@/lib/mock-db'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, currentPassword, newPassword } = body || {}

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Email, current password, and new password are required' }, { status: 400 })
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const db = await readDb()
    const normalizedEmail = String(email).trim().toLowerCase()
    const user = db.users.find((entry) => String(entry.email).toLowerCase() === normalizedEmail)

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(String(currentPassword), String(user.password))
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    user.password = await bcrypt.hash(String(newPassword), 10)
    user.password_version = (user.password_version || 1) + 1
    user.password_updated_at = new Date().toISOString()
    user.force_password_reset = false

    await writeDb(db)

    return NextResponse.json({ message: 'Password reset successful. Please sign in again.' })
  } catch {
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 })
  }
}
