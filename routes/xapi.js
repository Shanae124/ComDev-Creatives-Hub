// xAPI (Tin Can) API Routes
const express = require('express');
const router = express.Router();
const XAPIService = require('../services/xapi');
const { authenticate } = require('../middleware/auth');

module.exports = (pool) => {
  const xapiService = new XAPIService(pool);

  /**
   * Record xAPI statement
   * POST /api/xapi/statements
   */
  router.post('/statements', authenticate, async (req, res) => {
    try {
      const statement = req.body;

      // Validate required fields
      if (!statement.actor || !statement.verb || !statement.object) {
        return res.status(400).json({
          error: 'Statement must include actor, verb, and object'
        });
      }

      const result = await xapiService.recordStatement(statement);

      res.status(200).json({
        success: true,
        statementId: result.rows[0].id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get xAPI statements with filtering
   * GET /api/xapi/statements
   * Query params: actor, verb, activity, since, until, limit
   */
  router.get('/statements', authenticate, async (req, res) => {
    try {
      const filters = {
        actor: req.query.actor,
        verb: req.query.verb,
        activity: req.query.activity,
        since: req.query.since,
        until: req.query.until,
        limit: parseInt(req.query.limit) || 100
      };

      const statements = await xapiService.getStatements(filters);

      res.json({
        statements: statements.rows,
        more: statements.rows.length === filters.limit ? '/api/xapi/statements?...' : ''
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get statements for specific actor
   * GET /api/xapi/statements/actor/:email
   */
  router.get('/statements/actor/:email', authenticate, async (req, res) => {
    try {
      const statements = await xapiService.getActorStatements(req.params.email);
      res.json({ statements: statements.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get statements by verb
   * GET /api/xapi/statements/verb/:verbId
   */
  router.get('/statements/verb/:verbId', authenticate, async (req, res) => {
    try {
      const statements = await xapiService.getVerbStatements(
        decodeURIComponent(req.params.verbId)
      );
      res.json({ statements: statements.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Search statements
   * GET /api/xapi/statements/search?q=query
   */
  router.get('/statements/search', authenticate, async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter q is required' });
      }

      const statements = await xapiService.searchStatements(query);
      res.json({ statements: statements.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get actor activity summary
   * GET /api/xapi/actors/:email/summary
   */
  router.get('/actors/:email/summary', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          COUNT(*) as total_statements,
          COUNT(DISTINCT (verb->>'id')) as unique_verbs,
          COUNT(DISTINCT (object->>'id')) as unique_activities,
          MIN(timestamp) as first_activity,
          MAX(timestamp) as last_activity
         FROM xapi_statements
         WHERE actor->>'mbox' = $1`,
        [`mailto:${req.params.email}`]
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get activity completion statistics
   * GET /api/xapi/activities/:activityId/stats
   */
  router.get('/activities/:activityId/stats', authenticate, async (req, res) => {
    try {
      const activityId = decodeURIComponent(req.params.activityId);

      const result = await pool.query(
        `SELECT 
          COUNT(DISTINCT (actor->>'mbox')) as unique_learners,
          COUNT(*) as total_statements,
          COUNT(CASE WHEN verb->>'id' = 'http://adlnet.gov/expapi/verbs/completed' THEN 1 END) as completions,
          AVG(CASE WHEN result->'score'->>'scaled' IS NOT NULL 
              THEN (result->'score'->>'scaled')::DECIMAL 
              ELSE NULL END) as avg_score
         FROM xapi_statements
         WHERE object->>'id' = $1`,
        [activityId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get recent activity stream
   * GET /api/xapi/stream/recent
   */
  router.get('/stream/recent', authenticate, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;

      const result = await pool.query(
        `SELECT * FROM xapi_statements 
         ORDER BY timestamp DESC 
         LIMIT $1`,
        [limit]
      );

      res.json({ statements: result.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
