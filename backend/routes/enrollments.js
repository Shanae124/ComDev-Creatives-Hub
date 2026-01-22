const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Enroll user in course
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID required' });
    }

    const result = await pool.query(
      `INSERT INTO enrollments (user_id, course_id, status) 
       VALUES ($1, $2, 'active')
       ON CONFLICT (user_id, course_id) 
       DO UPDATE SET status = 'active' 
       RETURNING *`,
      [req.user.id, courseId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's enrollments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.title, c.description, u.first_name, u.last_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON c.instructor_id = u.id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course enrollments (instructor only)
router.get('/course/:courseId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.first_name, u.last_name, u.email
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       WHERE e.course_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.params.courseId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
