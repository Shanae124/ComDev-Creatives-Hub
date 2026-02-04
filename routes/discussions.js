const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get discussions for a module
router.get('/module/:moduleId', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.*, 
        u.first_name || ' ' || u.last_name as author_name,
        u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) as reply_count
      FROM discussions d
      JOIN users u ON d.author_id = u.id
      WHERE d.module_id = $1
      ORDER BY d.created_at DESC
    `, [req.params.moduleId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// Create discussion
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { moduleId, submissionId, title, content } = req.body;

    const result = await db.query(`
      INSERT INTO discussions (module_id, submission_id, author_id, title, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [moduleId, submissionId || null, req.user.id, title, content]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

// Get discussion with replies
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const discussionResult = await db.query(`
      SELECT d.*, 
        u.first_name || ' ' || u.last_name as author_name,
        u.avatar_url as author_avatar,
        u.role as author_role
      FROM discussions d
      JOIN users u ON d.author_id = u.id
      WHERE d.id = $1
    `, [req.params.id]);

    if (discussionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const discussion = discussionResult.rows[0];

    // Get replies
    const repliesResult = await db.query(`
      SELECT r.*, 
        u.first_name || ' ' || u.last_name as author_name,
        u.avatar_url as author_avatar,
        u.role as author_role
      FROM discussion_replies r
      JOIN users u ON r.author_id = u.id
      WHERE r.discussion_id = $1
      ORDER BY r.created_at ASC
    `, [req.params.id]);

    discussion.replies = repliesResult.rows;
    res.json(discussion);
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// Reply to discussion
router.post('/:id/replies', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    const result = await db.query(`
      INSERT INTO discussion_replies (discussion_id, author_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [req.params.id, req.user.id, content]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

module.exports = router;
