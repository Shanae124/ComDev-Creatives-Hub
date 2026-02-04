const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get student's portfolio
router.get('/:studentId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, 
        u.first_name || ' ' || u.last_name as student_name,
        u.bio as student_bio
      FROM portfolio_items p
      JOIN users u ON p.student_id = u.id
      WHERE p.student_id = $1
      ORDER BY p.is_featured DESC, p.created_at DESC
    `, [req.params.studentId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Add portfolio item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { submissionId, title, description, images, projectUrl, tags } = req.body;

    const result = await db.query(`
      INSERT INTO portfolio_items (student_id, submission_id, title, description, images, project_url, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.user.id, submissionId || null, title, description, JSON.stringify(images), projectUrl, tags]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add portfolio item error:', error);
    res.status(500).json({ error: 'Failed to add portfolio item' });
  }
});

// Toggle featured status
router.put('/:id/featured', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE portfolio_items
      SET is_featured = NOT is_featured
      WHERE id = $1 AND student_id = $2
      RETURNING *
    `, [req.params.id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: 'Failed to update portfolio item' });
  }
});

module.exports = router;
