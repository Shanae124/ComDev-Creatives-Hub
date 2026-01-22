import { NextRequest, NextResponse } from 'next/server'
import pool from '@/db'

// GET gradebook for a course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const studentId = searchParams.get('studentId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Get all students in course
    let studentQuery = `
      SELECT DISTINCT u.id, u.name, u.email, e.enrolled_at
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      WHERE e.course_id = $1 AND e.status = 'active'
    `
    const studentParams: any[] = [courseId]

    if (studentId) {
      studentQuery += ` AND u.id = $2`
      studentParams.push(studentId)
    }

    studentQuery += ' ORDER BY u.name ASC'

    const studentsResult = await pool.query(studentQuery, studentParams)

    // For each student, get their grades
    const gradebook = await Promise.all(
      studentsResult.rows.map(async (student) => {
        // Get assignment grades
        const assignmentGrades = await pool.query(
          `SELECT ag.grade, a.title FROM assignment_grades ag
           JOIN assignments a ON ag.assignment_id = a.id
           WHERE ag.student_id = $1 AND a.course_id = $2
           ORDER BY a.due_date ASC`,
          [student.id, courseId]
        )

        // Get quiz grades
        const quizGrades = await pool.query(
          `SELECT qa.score, q.title FROM quiz_attempts qa
           JOIN quizzes q ON qa.quiz_id = q.id
           WHERE qa.student_id = $1 AND q.course_id = $2
           ORDER BY qa.attempt_date DESC`,
          [student.id, courseId]
        )

        // Get exam grades
        const examGrades = await pool.query(
          `SELECT eg.grade, e.title FROM exam_grades eg
           JOIN exams e ON eg.exam_id = e.id
           WHERE eg.student_id = $1 AND e.course_id = $2`,
          [student.id, courseId]
        )

        // Calculate averages
        const avgAssignment = assignmentGrades.rows.length > 0
          ? assignmentGrades.rows.reduce((sum, r) => sum + r.grade, 0) / assignmentGrades.rows.length
          : 0

        const avgQuiz = quizGrades.rows.length > 0
          ? quizGrades.rows.reduce((sum, r) => sum + r.score, 0) / quizGrades.rows.length
          : 0

        const avgExam = examGrades.rows.length > 0
          ? examGrades.rows.reduce((sum, r) => sum + r.grade, 0) / examGrades.rows.length
          : 0

        // Calculate final grade (40% assignments, 30% quizzes, 30% exams)
        const finalGrade = (avgAssignment * 0.4 + avgQuiz * 0.3 + avgExam * 0.3)

        return {
          student: student,
          assignments: assignmentGrades.rows,
          quizzes: quizGrades.rows,
          exams: examGrades.rows,
          averages: {
            assignment: Math.round(avgAssignment * 10) / 10,
            quiz: Math.round(avgQuiz * 10) / 10,
            exam: Math.round(avgExam * 10) / 10,
            final: Math.round(finalGrade * 10) / 10,
          },
        }
      })
    )

    return NextResponse.json(gradebook)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Record a grade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, courseId, type, itemId, grade } = body

    if (!studentId || !courseId || !type || !itemId || grade === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let query, params

    if (type === 'assignment') {
      query = `
        INSERT INTO assignment_grades (student_id, assignment_id, grade, graded_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, assignment_id) 
        DO UPDATE SET grade = $3, graded_at = CURRENT_TIMESTAMP
        RETURNING *
      `
      params = [studentId, itemId, grade]
    } else if (type === 'quiz') {
      query = `
        INSERT INTO quiz_attempts (student_id, quiz_id, score, attempt_date)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *
      `
      params = [studentId, itemId, grade]
    } else if (type === 'exam') {
      query = `
        INSERT INTO exam_grades (student_id, exam_id, grade, graded_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, exam_id)
        DO UPDATE SET grade = $3, graded_at = CURRENT_TIMESTAMP
        RETURNING *
      `
      params = [studentId, itemId, grade]
    } else {
      return NextResponse.json(
        { error: 'Invalid grade type' },
        { status: 400 }
      )
    }

    const result = await pool.query(query, params)
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update a grade
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { gradeId, type, grade } = body

    if (!gradeId || !type || grade === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let query

    if (type === 'assignment') {
      query = `
        UPDATE assignment_grades 
        SET grade = $2, graded_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `
    } else if (type === 'exam') {
      query = `
        UPDATE exam_grades 
        SET grade = $2, graded_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `
    } else {
      return NextResponse.json(
        { error: 'Invalid grade type' },
        { status: 400 }
      )
    }

    const result = await pool.query(query, [gradeId, grade])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
