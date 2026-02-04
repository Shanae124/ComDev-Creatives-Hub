const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get all projects for a module
router.get('/module/:moduleId', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM projects WHERE module_id = $1
    `, [req.params.moduleId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, m.title as module_title, m.course_id
      FROM projects p
      JOIN modules m ON p.module_id = m.id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

module.exports = router;
