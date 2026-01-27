// Question Bank API Routes
const express = require('express');
const router = express.Router();
const QuestionBankService = require('../services/questionBank');
const { authenticate } = require('../middleware/auth');

module.exports = (pool) => {
  const questionBank = new QuestionBankService(pool);

  /**
   * Create question
   * POST /api/questions
   */
  router.post('/', authenticate, async (req, res) => {
    try {
      const question = await questionBank.createQuestion({
        ...req.body,
        createdBy: req.user.id
      });

      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get question by ID
   * GET /api/questions/:id
   */
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM questions WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Search questions
   * GET /api/questions?q=search&type=multiple_choice&difficulty=medium
   */
  router.get('/', authenticate, async (req, res) => {
    try {
      const { q, type, difficulty, category, orgId } = req.query;

      const filters = {
        query: q,
        type,
        difficulty,
        category,
        orgId: orgId || req.user.orgId
      };

      const questions = await questionBank.searchQuestions(q, filters);
      res.json(questions.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get random questions
   * POST /api/questions/random
   */
  router.post('/random', authenticate, async (req, res) => {
    try {
      const { count, difficulty, category, tags } = req.body;

      const questions = await questionBank.getRandomQuestions({
        count,
        difficulty,
        category,
        tags,
        orgId: req.user.orgId
      });

      res.json(questions.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get questions by category
   * GET /api/questions/category/:category
   */
  router.get('/category/:category', authenticate, async (req, res) => {
    try {
      const questions = await questionBank.getQuestionsByCategory(
        req.params.category
      );
      res.json(questions.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Create question pool
   * POST /api/questions/pools
   */
  router.post('/pools', authenticate, async (req, res) => {
    try {
      const pool_result = await questionBank.createPool(
        req.body.name,
        req.body.criteria
      );

      res.status(201).json(pool_result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get questions from pool
   * GET /api/questions/pools/:poolId/questions
   */
  router.get('/pools/:poolId/questions', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT q.* FROM questions q
         JOIN pool_questions pq ON q.id = pq.question_id
         WHERE pq.pool_id = $1`,
        [req.params.poolId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Update question
   * PATCH /api/questions/:id
   */
  router.patch('/:id', authenticate, async (req, res) => {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = [
        'text', 'options', 'correct_answer', 'acceptable_answers',
        'difficulty', 'category', 'tags', 'points', 'explanation'
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
        `UPDATE questions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Delete question
   * DELETE /api/questions/:id
   */
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      await pool.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Import questions from QTI
   * POST /api/questions/import/qti
   */
  router.post('/import/qti', authenticate, async (req, res) => {
    try {
      const { qtiXml, orgId } = req.body;

      const questions = await questionBank.importQTI(qtiXml, orgId);
      res.status(201).json({
        success: true,
        imported: questions.length,
        questions
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Export questions to QTI
   * POST /api/questions/export/qti
   */
  router.post('/export/qti', authenticate, async (req, res) => {
    try {
      const { questionIds } = req.body;

      const qtiXml = await questionBank.exportQTI(questionIds);
      
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename=questions.xml');
      res.send(qtiXml);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
