const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, 
        u.first_name || ' ' || u.last_name as instructor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.is_published = true
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course by ID with modules
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const courseResult = await db.query(`
      SELECT c.*, 
        u.first_name || ' ' || u.last_name as instructor_name,
        u.avatar_url as instructor_avatar
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
    `, [req.params.id]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseResult.rows[0];

    // Get modules with lessons and projects
    const modulesResult = await db.query(`
      SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index
    `, [req.params.id]);

    const modules = await Promise.all(modulesResult.rows.map(async (module) => {
      const lessonsResult = await db.query(`
        SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_index
      `, [module.id]);

      const projectsResult = await db.query(`
        SELECT * FROM projects WHERE module_id = $1
      `, [module.id]);

      return {
        ...module,
        lessons: lessonsResult.rows,
        projects: projectsResult.rows
      };
    }));

    course.modules = modules;
    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Enroll in course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    await db.query(`
      INSERT INTO enrollments (course_id, student_id)
      VALUES ($1, $2)
      ON CONFLICT (course_id, student_id) DO NOTHING
    `, [req.params.id, req.user.id]);

    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Get student's enrolled courses
router.get('/my/enrollments', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, e.progress, e.enrolled_at,
        u.first_name || ' ' || u.last_name as instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

module.exports = router;
