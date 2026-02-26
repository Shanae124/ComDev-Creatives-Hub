import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readDb, writeDb } from '@/lib/mock-db'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, role = 'student' } = body || {}

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const db = await readDb()
    const normalizedEmail = String(email).trim().toLowerCase()

    const existingUser = db.users.find((user) => String(user.email).toLowerCase() === normalizedEmail)
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(String(password), 10)
    const newUser = {
      id: db.users.length ? Math.max(...db.users.map((user) => Number(user.id) || 0)) + 1 : 1,
      email: normalizedEmail,
      password: hashedPassword,
      first_name: String(firstName).trim(),
      last_name: String(lastName).trim(),
      role: String(role),
      password_version: 1,
      password_updated_at: new Date().toISOString(),
      force_password_reset: false,
    }

    db.users.push(newUser)
    await writeDb(db)

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tv: db.security.tokenVersion,
        pwv: newUser.password_version,
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    )

    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
        },
        token,
      },
      { status: 201 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
