import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { readDb } from '@/lib/mock-db'

export const runtime = 'nodejs'

function getUserIdFromRequest(request: Request): number | null {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.replace('Bearer ', '') : null
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key') as { id?: number }
    return decoded.id || null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json([], { status: 200 })
    }

    const db = await readDb()
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
