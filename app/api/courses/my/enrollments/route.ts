import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { readDb } from '@/lib/mock-db'

export const runtime = 'nodejs'

function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get('authorization') || ''
  return auth.startsWith('Bearer ') ? auth.replace('Bearer ', '') : null
}

function getDecodedToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key') as {
      id?: number
      tv?: number
      pwv?: number
    }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json([], { status: 200 })
    }

    const decoded = getDecodedToken(token)
    if (!decoded?.id) {
      return NextResponse.json([], { status: 200 })
    }

    const db = await readDb()

    if ((decoded.tv || 0) !== db.security.tokenVersion) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }

    const currentUser = db.users.find((entry) => Number(entry.id) === Number(decoded.id))
    if (!currentUser) {
      return NextResponse.json([], { status: 200 })
    }

    if ((decoded.pwv || 0) !== (currentUser.password_version || 1)) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }

    const userId = decoded.id
    if (!userId) {
      return NextResponse.json([], { status: 200 })
    }
    const enrolled = db.enrollments.filter((enrollment) => Number(enrollment.student_id) === Number(userId))

    const result = enrolled
      .map((enrollment) => {
        const course = db.courses.find((entry) => Number(entry.id) === Number(enrollment.course_id))
        if (!course) return null

        const instructor = db.users.find((entry) => Number(entry.id) === Number(course.instructor_id))

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          instructor_name: instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Instructor',
          progress: enrollment.progress || 0,
        }
      })
      .filter(Boolean)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
