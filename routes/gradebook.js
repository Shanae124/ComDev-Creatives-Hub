// Gradebook API Routes
const express = require('express');
const router = express.Router();
const GradebookService = require('../services/gradebook');
const { authenticate } = require('../middleware/auth');

module.exports = (pool) => {
  const gradebookService = new GradebookService(pool);

  /**
   * Create gradebook for course
   * POST /api/gradebook/courses/:courseId/gradebook
   */
  router.post('/courses/:courseId/gradebook', authenticate, async (req, res) => {
    try {
      const gradebook = await gradebookService.createGradebook(
        req.params.courseId,
        req.body
      );

      res.status(201).json(gradebook);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get gradebook for course
   * GET /api/gradebook/courses/:courseId
   */
  router.get('/courses/:courseId', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM gradebooks WHERE course_id = $1',
        [req.params.courseId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Gradebook not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Create grade item (assignment, quiz, etc.)
   * POST /api/gradebook/items
   */
  router.post('/items', authenticate, async (req, res) => {
    try {
      const gradeItem = await gradebookService.createGradeItem(req.body);
      res.status(201).json(gradeItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get grade items for gradebook
   * GET /api/gradebook/:gradebookId/items
   */
  router.get('/:gradebookId/items', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT gi.*, gc.name as category_name
         FROM grade_items gi
         LEFT JOIN grade_categories gc ON gi.category_id = gc.id
         WHERE gi.gradebook_id = $1
         ORDER BY gi.due_date`,
        [req.params.gradebookId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Record grade for student
   * POST /api/gradebook/grades
   */
  router.post('/grades', authenticate, async (req, res) => {
    try {
      const grade = await gradebookService.recordGrade({
        ...req.body,
        gradedBy: req.user.id
      });

      res.status(201).json(grade);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Bulk record grades
   * POST /api/gradebook/grades/bulk
   */
  router.post('/grades/bulk', authenticate, async (req, res) => {
    try {
      const { grades } = req.body;
      const results = [];

      for (const gradeData of grades) {
        const grade = await gradebookService.recordGrade({
          ...gradeData,
          gradedBy: req.user.id
        });
        results.push(grade);
      }

      res.json({ success: true, grades: results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get student gradebook view
   * GET /api/gradebook/courses/:courseId/student
   */
  router.get('/courses/:courseId/student', authenticate, async (req, res) => {
    try {
      const userId = req.query.userId || req.user.id;
      const gradebook = await gradebookService.getStudentGradebook(
        userId,
        req.params.courseId
      );

      if (!gradebook) {
        return res.status(404).json({ error: 'Gradebook not found' });
      }

      res.json(gradebook);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get instructor gradebook view (all students)
   * GET /api/gradebook/courses/:courseId/instructor
   */
  router.get('/courses/:courseId/instructor', authenticate, async (req, res) => {
    try {
      const gradebook = await gradebookService.getInstructorGradebook(
        req.params.courseId
      );

      res.json(gradebook);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Export gradebook to CSV
   * GET /api/gradebook/courses/:courseId/export
   */
  router.get('/courses/:courseId/export', authenticate, async (req, res) => {
    try {
      const csv = await gradebookService.exportGradebook(req.params.courseId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=gradebook-${req.params.courseId}.csv`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Create grading rubric
   * POST /api/gradebook/rubrics
   */
  router.post('/rubrics', authenticate, async (req, res) => {
    try {
      const rubricId = await gradebookService.createRubric({
        ...req.body,
        createdBy: req.user.id
      });

      res.status(201).json({ id: rubricId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get rubric details
   * GET /api/gradebook/rubrics/:id
   */
  router.get('/rubrics/:id', authenticate, async (req, res) => {
    try {
      const rubric = await pool.query(
        'SELECT * FROM rubrics WHERE id = $1',
        [req.params.id]
      );

      if (rubric.rows.length === 0) {
        return res.status(404).json({ error: 'Rubric not found' });
      }

      const criteria = await pool.query(
        `SELECT rc.*, 
          (SELECT json_agg(rl.* ORDER BY rl.sort_order) 
           FROM rubric_levels rl 
           WHERE rl.criterion_id = rc.id) as levels
         FROM rubric_criteria rc
         WHERE rc.rubric_id = $1
         ORDER BY rc.sort_order`,
        [req.params.id]
      );

      res.json({
        ...rubric.rows[0],
        criteria: criteria.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Grade using rubric
   * POST /api/gradebook/grade-with-rubric
   */
  router.post('/grade-with-rubric', authenticate, async (req, res) => {
    try {
      const { gradeItemId, userId, rubricScores } = req.body;

      const grade = await gradebookService.gradeWithRubric(
        gradeItemId,
        userId,
        rubricScores
      );

      res.json(grade);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get grade statistics for item
   * GET /api/gradebook/items/:itemId/stats
   */
  router.get('/items/:itemId/stats', authenticate, async (req, res) => {
    try {
      const stats = await gradebookService.getGradeStatistics(req.params.itemId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Recalculate overall grades for course
   * POST /api/gradebook/courses/:courseId/recalculate
   */
  router.post('/courses/:courseId/recalculate', authenticate, async (req, res) => {
    try {
      const gradebook = await pool.query(
        'SELECT id FROM gradebooks WHERE course_id = $1',
        [req.params.courseId]
      );

      if (gradebook.rows.length === 0) {
        return res.status(404).json({ error: 'Gradebook not found' });
      }

      const students = await pool.query(
        `SELECT DISTINCT user_id FROM grades g
         JOIN grade_items gi ON g.grade_item_id = gi.id
         WHERE gi.gradebook_id = $1`,
        [gradebook.rows[0].id]
      );

      for (const student of students.rows) {
        // Get any grade item to trigger recalculation
        const gradeItem = await pool.query(
          `SELECT id FROM grade_items WHERE gradebook_id = $1 LIMIT 1`,
          [gradebook.rows[0].id]
        );

        if (gradeItem.rows.length > 0) {
          await gradebookService.calculateOverallGrade(
            student.user_id,
            gradeItem.rows[0].id
          );
        }
      }

      res.json({ success: true, recalculated: students.rows.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
