// Programs & Learning Paths API Routes
const express = require('express');
const router = express.Router();
const ProgramsService = require('../services/programs');
const { authenticate } = require('../middleware/auth');

module.exports = (pool) => {
  const programsService = new ProgramsService(pool);

  /**
   * Create program
   * POST /api/programs
   */
  router.post('/', authenticate, async (req, res) => {
    try {
      const program = await programsService.createProgram({
        ...req.body,
        createdBy: req.user.id
      });

      res.status(201).json(program);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get program details
   * GET /api/programs/:id
   */
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT p.*, 
          (SELECT COUNT(*) FROM program_courses WHERE program_id = p.id) as course_count,
          (SELECT COUNT(*) FROM program_enrollments WHERE program_id = p.id) as enrollment_count
         FROM programs p
         WHERE p.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Program not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get all programs for organization
   * GET /api/programs?orgId=123
   */
  router.get('/', authenticate, async (req, res) => {
    try {
      const { orgId, status } = req.query;
      
      let query = 'SELECT * FROM programs WHERE 1=1';
      const params = [];

      if (orgId) {
        params.push(orgId);
        query += ` AND org_id = $${params.length}`;
      }

      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Add course to program
   * POST /api/programs/:id/courses
   */
  router.post('/:id/courses', authenticate, async (req, res) => {
    try {
      const { courseId, prerequisites, dripDays, sortOrder } = req.body;

      await programsService.addCourseToProgram(
        req.params.id,
        courseId,
        prerequisites || [],
        dripDays || 0,
        sortOrder
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get courses in program with prerequisites
   * GET /api/programs/:id/courses
   */
  router.get('/:id/courses', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT pc.*, c.title, c.description, c.thumbnail
         FROM program_courses pc
         JOIN courses c ON pc.course_id = c.id
         WHERE pc.program_id = $1
         ORDER BY pc.sort_order`,
        [req.params.id]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Enroll in program
   * POST /api/programs/:id/enroll
   */
  router.post('/:id/enroll', authenticate, async (req, res) => {
    try {
      const enrollment = await programsService.enrollInProgram(
        req.user.id,
        req.params.id
      );

      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get user's program progress
   * GET /api/programs/:id/progress
   */
  router.get('/:id/progress', authenticate, async (req, res) => {
    try {
      const userId = req.query.userId || req.user.id;

      const progress = await programsService.calculateProgress(
        userId,
        req.params.id
      );

      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get next available lesson in program
   * GET /api/programs/:id/next-lesson
   */
  router.get('/:id/next-lesson', authenticate, async (req, res) => {
    try {
      const nextLesson = await programsService.getNextLesson(
        req.user.id,
        req.params.id
      );

      res.json(nextLesson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Check prerequisites for course
   * GET /api/programs/courses/:courseId/prerequisites
   */
  router.get('/courses/:courseId/prerequisites', authenticate, async (req, res) => {
    try {
      const canAccess = await programsService.checkPrerequisites(
        req.user.id,
        req.params.courseId
      );

      res.json({ canAccess });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get user's enrolled programs
   * GET /api/programs/user/enrollments
   */
  router.get('/user/enrollments', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT pe.*, p.name, p.description, p.status
         FROM program_enrollments pe
         JOIN programs p ON pe.program_id = p.id
         WHERE pe.user_id = $1
         ORDER BY pe.enrolled_at DESC`,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Update program
   * PATCH /api/programs/:id
   */
  router.patch('/:id', authenticate, async (req, res) => {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (req.body.name) {
        updates.push(`name = $${paramCount++}`);
        values.push(req.body.name);
      }
      if (req.body.description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(req.body.description);
      }
      if (req.body.status) {
        updates.push(`status = $${paramCount++}`);
        values.push(req.body.status);
      }

      updates.push(`updated_at = NOW()`);
      values.push(req.params.id);

      const result = await pool.query(
        `UPDATE programs SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Delete program
   * DELETE /api/programs/:id
   */
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      await pool.query('DELETE FROM programs WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
