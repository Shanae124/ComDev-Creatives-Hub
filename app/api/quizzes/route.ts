import { NextRequest, NextResponse } from 'next/server'
import pool from '@/db'

// GET all quizzes or by course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const instructorId = searchParams.get('instructorId')

    let query = `
      SELECT q.*, 
             COUNT(DISTINCT qq.id) as question_count,
             COUNT(DISTINCT qa.id) as total_attempts
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE q.deleted_at IS NULL
    `
    const params: any[] = []
    let paramCount = 1

    if (courseId) {
      query += ` AND q.course_id = $${paramCount}`
      params.push(courseId)
      paramCount++
    }

    if (instructorId) {
      query += ` AND q.created_by = $${paramCount}`
      params.push(instructorId)
      paramCount++
    }

    query += ' GROUP BY q.id ORDER BY q.created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new quiz
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      courseId,
      title,
      description,
      timeLimit,
      attempts,
      shuffleQuestions,
      showCorrectAnswers,
      createdBy,
      status,
    } = body

    if (!courseId || !title) {
      return NextResponse.json(
        { error: 'Course ID and title are required' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO quizzes (
        course_id, title, description, time_limit, max_attempts,
        shuffle_questions, show_correct_answers, created_by, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await pool.query(query, [
      courseId,
      title,
      description || '',
      timeLimit || 30,
      attempts || -1, // -1 = unlimited
      shuffleQuestions || false,
      showCorrectAnswers || true,
      createdBy,
      status || 'draft',
    ])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update quiz
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, timeLimit, attempts, shuffleQuestions, showCorrectAnswers, status } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE quizzes 
      SET title = $2, description = $3, time_limit = $4, max_attempts = $5,
          shuffle_questions = $6, show_correct_answers = $7, status = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `

    const result = await pool.query(query, [
      id,
      title,
      description,
      timeLimit,
      attempts,
      shuffleQuestions,
      showCorrectAnswers,
      status,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Soft delete quiz
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE quizzes 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `

    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
