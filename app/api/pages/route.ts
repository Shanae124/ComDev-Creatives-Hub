import { NextRequest, NextResponse } from 'next/server'
import pool from '@/db'

// GET all pages or by course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    let query = 'SELECT * FROM pages WHERE deleted_at IS NULL'
    const params: any[] = []

    if (courseId) {
      query += ' AND course_id = $1'
      params.push(courseId)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, title, htmlContent, cssContent, jsContent, status } = body

    if (!courseId || !title) {
      return NextResponse.json(
        { error: 'Course ID and title are required' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO pages (course_id, title, html_content, css_content, js_content, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await pool.query(query, [
      courseId,
      title,
      htmlContent || '',
      cssContent || '',
      jsContent || '',
      status || 'draft',
    ])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update page
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, htmlContent, cssContent, jsContent, status } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE pages 
      SET title = $2, html_content = $3, css_content = $4, js_content = $5, status = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `

    const result = await pool.query(query, [
      id,
      title,
      htmlContent,
      cssContent,
      jsContent,
      status,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Soft delete page
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE pages 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `

    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
