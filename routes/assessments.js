// Assessments API Routes
const express = require('express');
const router = express.Router();
const AssessmentEngine = require('../services/assessmentEngine');
const { authenticate } = require('../middleware/auth');

module.exports = (pool) => {
  const assessmentEngine = new AssessmentEngine(pool);

  /**
   * Create assessment
   * POST /api/assessments
   */
  router.post('/', authenticate, async (req, res) => {
    try {
      const assessment = await assessmentEngine.createAssessment(req.body);
      res.status(201).json(assessment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get assessment details
   * GET /api/assessments/:id
   */
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM assessments WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get assessments for course
   * GET /api/assessments?courseId=123
   */
  router.get('/', authenticate, async (req, res) => {
    try {
      const { courseId, moduleId, lessonId } = req.query;

      let query = 'SELECT * FROM assessments WHERE 1=1';
      const params = [];

      if (courseId) {
        params.push(courseId);
        query += ` AND course_id = $${params.length}`;
      }
      if (moduleId) {
        params.push(moduleId);
        query += ` AND module_id = $${params.length}`;
      }
      if (lessonId) {
        params.push(lessonId);
        query += ` AND lesson_id = $${params.length}`;
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Add questions to assessment
   * POST /api/assessments/:id/questions
   */
  router.post('/:id/questions', authenticate, async (req, res) => {
    try {
      const { questions } = req.body;

      await assessmentEngine.addQuestionsToAssessment(req.params.id, questions);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get assessment questions (for preview)
   * GET /api/assessments/:id/questions
   */
  router.get('/:id/questions', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT aq.*, q.text, q.type, q.difficulty
         FROM assessment_questions aq
         JOIN questions q ON aq.question_id = q.id
         WHERE aq.assessment_id = $1
         ORDER BY aq.sort_order`,
        [req.params.id]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Start assessment attempt
   * POST /api/assessments/:id/start
   */
  router.post('/:id/start', authenticate, async (req, res) => {
    try {
      const attempt = await assessmentEngine.startAttempt(
        req.user.id,
        req.params.id
      );

      res.status(201).json(attempt);
    } catch (error) {
      if (error.message.includes('Maximum attempts') || 
          error.message.includes('not yet available') ||
          error.message.includes('no longer available')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Submit answer
   * POST /api/assessments/attempts/:attemptId/answer
   */
  router.post('/attempts/:attemptId/answer', authenticate, async (req, res) => {
    try {
      const { questionId, answer } = req.body;

      await assessmentEngine.submitAnswer(
        req.params.attemptId,
        questionId,
        answer
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Auto-save progress
   * POST /api/assessments/attempts/:attemptId/save
   */
  router.post('/attempts/:attemptId/save', authenticate, async (req, res) => {
    try {
      const { answers } = req.body;

      await assessmentEngine.saveProgress(req.params.attemptId, answers);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Submit attempt for grading
   * POST /api/assessments/attempts/:attemptId/submit
   */
  router.post('/attempts/:attemptId/submit', authenticate, async (req, res) => {
    try {
      const results = await assessmentEngine.submitAttempt(req.params.attemptId);
      res.json(results);
    } catch (error) {
      if (error.message.includes('already submitted')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get attempt results
   * GET /api/assessments/attempts/:attemptId/results
   */
  router.get('/attempts/:attemptId/results', authenticate, async (req, res) => {
    try {
      const results = await assessmentEngine.getAttemptResults(
        req.params.attemptId,
        req.user.id
      );

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get user's attempts for assessment
   * GET /api/assessments/:id/attempts
   */
  router.get('/:id/attempts', authenticate, async (req, res) => {
    try {
      const attempts = await assessmentEngine.getUserAttempts(
        req.user.id,
        req.params.id
      );

      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get all attempts for assessment (instructor)
   * GET /api/assessments/:id/attempts/all
   */
  router.get('/:id/attempts/all', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT aa.*, u.name, u.email
         FROM assessment_attempts aa
         JOIN users u ON aa.user_id = u.id
         WHERE aa.assessment_id = $1
         ORDER BY aa.started_at DESC`,
        [req.params.id]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Update assessment
   * PATCH /api/assessments/:id
   */
  router.patch('/:id', authenticate, async (req, res) => {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = [
        'title', 'description', 'instructions', 'time_limit', 
        'pass_threshold', 'max_attempts', 'shuffle_questions',
        'shuffle_answers', 'show_feedback', 'show_correct_answers',
        'available_from', 'available_until', 'settings'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = $${paramCount++}`);
          values.push(
            typeof req.body[field] === 'object'
              ? JSON.stringify(req.body[field])
              : req.body[field]
          );
        }
      });

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(req.params.id);

      const result = await pool.query(
        `UPDATE assessments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Delete assessment
   * DELETE /api/assessments/:id
   */
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      await pool.query('DELETE FROM assessments WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
