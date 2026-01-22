const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create course (instructor only)
router.post('/', authMiddleware, requireRole(['instructor', 'admin']), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title required' });
    }

    const result = await pool.query(
      'INSERT INTO courses (title, description, instructor_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description || '', req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.first_name, u.last_name, u.email
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      ORDER BY c.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course with modules
router.get('/:id', async (req, res) => {
  try {
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const modulesResult = await pool.query(
      'SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index ASC',
      [req.params.id]
    );

    const course = courseResult.rows[0];
    course.modules = modulesResult.rows;

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course
router.put('/:id', authMiddleware, requireRole(['instructor', 'admin']), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Check if user owns the course or is admin
    const courseResult = await pool.query('SELECT instructor_id FROM courses WHERE id = $1', [req.params.id]);
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (courseResult.rows[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'UPDATE courses SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, description, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course
router.delete('/:id', authMiddleware, requireRole(['instructor', 'admin']), async (req, res) => {
  try {
    const courseResult = await pool.query('SELECT instructor_id FROM courses WHERE id = $1', [req.params.id]);
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (courseResult.rows[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
