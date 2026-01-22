const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Mark lesson as completed
router.post('/:lessonId/complete', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, true, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.id, req.params.lessonId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress for course
router.get('/course/:courseId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lp.*, l.title
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       WHERE m.course_id = $1 AND lp.user_id = $2
       ORDER BY lp.completed_at DESC`,
      [req.params.courseId, req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress for lesson
router.get('/:lessonId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM lesson_progress 
       WHERE lesson_id = $1 AND user_id = $2`,
      [req.params.lessonId, req.user.id]
    );

    res.json(result.rows[0] || { completed: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
