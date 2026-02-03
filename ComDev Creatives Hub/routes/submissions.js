const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Submit project
router.post('/', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    const { projectId, title, description, submissionUrl } = req.body;

    // Process uploaded files
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size
    })) : [];

    const result = await db.query(`
      INSERT INTO submissions (project_id, student_id, title, description, files, submission_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'submitted')
      RETURNING *
    `, [projectId, req.user.id, title, description, JSON.stringify(files), submissionUrl]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Submit project error:', error);
    res.status(500).json({ error: 'Failed to submit project' });
  }
});

// Get submissions for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, 
        u.first_name || ' ' || u.last_name as student_name,
        u.avatar_url as student_avatar
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.project_id = $1
      ORDER BY s.submitted_at DESC
    `, [req.params.projectId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get student's submissions
router.get('/my/submissions', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, p.title as project_title, p.max_points,
        m.title as module_title
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      JOIN modules m ON p.module_id = m.id
      WHERE s.student_id = $1
      ORDER BY s.submitted_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get submission by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, 
        u.first_name || ' ' || u.last_name as student_name,
        u.avatar_url as student_avatar,
        p.title as project_title, p.description as project_description,
        p.max_points, p.rubric
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Grade submission (instructor only)
router.put('/:id/grade', authenticateToken, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    const result = await db.query(`
      UPDATE submissions
      SET grade = $1, feedback = $2, status = 'graded', graded_at = NOW(), graded_by = $3
      WHERE id = $4
      RETURNING *
    `, [grade, feedback, req.user.id, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

module.exports = router;
