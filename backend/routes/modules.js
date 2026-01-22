const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Create module
router.post('/', async (req, res) => {
  try {
    const { courseId, title, orderIndex = 0 } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ error: 'Course ID and title required' });
    }

    const result = await pool.query(
      'INSERT INTO modules (course_id, title, order_index) VALUES ($1, $2, $3) RETURNING *',
      [courseId, title, orderIndex]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get module with lessons
router.get('/:id', async (req, res) => {
  try {
    const moduleResult = await pool.query('SELECT * FROM modules WHERE id = $1', [req.params.id]);
    
    if (moduleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const lessonsResult = await pool.query(
      'SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_index ASC',
      [req.params.id]
    );

    const module = moduleResult.rows[0];
    module.lessons = lessonsResult.rows;

    res.json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update module
router.put('/:id', async (req, res) => {
  try {
    const { title, orderIndex } = req.body;

    const result = await pool.query(
      'UPDATE modules SET title = COALESCE($1, title), order_index = COALESCE($2, order_index), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, orderIndex, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete module
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM modules WHERE id = $1', [req.params.id]);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
