// xAPI (Tin Can API) Service for Learning Record Store
const { Pool } = require('pg');
const crypto = require('crypto');

class XAPIService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Store xAPI statement
   * @param {object} statement - xAPI statement object
   */
  async storeStatement(statement) {
    try {
      // Generate statement ID if not provided
      const statementId = statement.id || this.generateUUID();
      
      // Validate statement structure
      this.validateStatement(statement);

      // Store statement
      const result = await this.pool.query(
        `INSERT INTO xapi_statements 
         (statement_id, actor, verb, object, result, context, timestamp, stored, authority)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
         RETURNING id`,
        [
          statementId,
          JSON.stringify(statement.actor),
          JSON.stringify(statement.verb),
          JSON.stringify(statement.object),
          statement.result ? JSON.stringify(statement.result) : null,
          statement.context ? JSON.stringify(statement.context) : null,
          statement.timestamp || new Date().toISOString(),
          statement.authority ? JSON.stringify(statement.authority) : null
        ]
      );

      // Update learner progress based on statement
      await this.updateProgressFromStatement(statement);

      return {
        id: statementId,
        stored: true,
        dbId: result.rows[0].id
      };
    } catch (error) {
      console.error('xAPI statement storage error:', error);
      throw new Error(`Failed to store xAPI statement: ${error.message}`);
    }
  }

  /**
   * Validate xAPI statement structure
   */
  validateStatement(statement) {
    if (!statement.actor) throw new Error('Statement must include actor');
    if (!statement.verb) throw new Error('Statement must include verb');
    if (!statement.object) throw new Error('Statement must include object');
    
    // Validate actor
    if (!statement.actor.mbox && !statement.actor.account) {
      throw new Error('Actor must have mbox or account');
    }

    // Validate verb
    if (!statement.verb.id) {
      throw new Error('Verb must have id');
    }

    // Validate object
    if (!statement.object.id) {
      throw new Error('Object must have id');
    }
  }

  /**
   * Generate UUID for statement ID
   */
  generateUUID() {
    return crypto.randomUUID();
  }

  /**
   * Query statements with filters
   */
  async queryStatements(filters = {}) {
    let query = 'SELECT * FROM xapi_statements WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Filter by actor
    if (filters.actor) {
      query += ` AND actor @> $${paramCount}`;
      params.push(JSON.stringify(filters.actor));
      paramCount++;
    }

    // Filter by verb
    if (filters.verb) {
      query += ` AND verb->>'id' = $${paramCount}`;
      params.push(filters.verb);
      paramCount++;
    }

    // Filter by activity (object)
    if (filters.activity) {
      query += ` AND object->>'id' = $${paramCount}`;
      params.push(filters.activity);
      paramCount++;
    }

    // Filter by date range
    if (filters.since) {
      query += ` AND timestamp >= $${paramCount}`;
      params.push(filters.since);
      paramCount++;
    }

    if (filters.until) {
      query += ` AND timestamp <= $${paramCount}`;
      params.push(filters.until);
      paramCount++;
    }

    // Pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query += ` ORDER BY timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);

    return {
      statements: result.rows.map(row => ({
        id: row.statement_id,
        actor: row.actor,
        verb: row.verb,
        object: row.object,
        result: row.result,
        context: row.context,
        timestamp: row.timestamp,
        stored: row.stored,
        authority: row.authority
      })),
      more: result.rows.length === limit ? `/statements?offset=${offset + limit}` : null
    };
  }

  /**
   * Get single statement by ID
   */
  async getStatement(statementId) {
    const result = await this.pool.query(
      `SELECT * FROM xapi_statements WHERE statement_id = $1`,
      [statementId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.statement_id,
      actor: row.actor,
      verb: row.verb,
      object: row.object,
      result: row.result,
      context: row.context,
      timestamp: row.timestamp,
      stored: row.stored,
      authority: row.authority
    };
  }

  /**
   * Update learner progress from xAPI statement
   */
  async updateProgressFromStatement(statement) {
    try {
      // Extract user ID from actor
      const userId = this.extractUserId(statement.actor);
      if (!userId) return;

      // Extract activity ID
      const activityId = statement.object.id;
      
      // Check verb type
      const verbId = statement.verb.id;
      
      // Common xAPI verbs
      const completedVerbs = [
        'http://adlnet.gov/expapi/verbs/completed',
        'http://adlnet.gov/expapi/verbs/passed'
      ];
      
      const progressedVerbs = [
        'http://adlnet.gov/expapi/verbs/progressed',
        'http://adlnet.gov/expapi/verbs/experienced'
      ];

      // Update progress tracking
      if (completedVerbs.includes(verbId)) {
        await this.markActivityComplete(userId, activityId, statement);
      } else if (progressedVerbs.includes(verbId)) {
        await this.updateActivityProgress(userId, activityId, statement);
      }

      // Store score if present
      if (statement.result?.score) {
        await this.updateActivityScore(userId, activityId, statement.result.score);
      }

    } catch (error) {
      console.error('Error updating progress from xAPI:', error);
      // Don't throw - we don't want to fail statement storage
    }
  }

  /**
   * Extract user ID from actor
   */
  extractUserId(actor) {
    // Try to extract from mbox
    if (actor.mbox) {
      const email = actor.mbox.replace('mailto:', '');
      return this.getUserIdByEmail(email);
    }

    // Try to extract from account
    if (actor.account?.name) {
      return actor.account.name;
    }

    return null;
  }

  /**
   * Get user ID by email
   */
  async getUserIdByEmail(email) {
    const result = await this.pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0]?.id || null;
  }

  /**
   * Mark activity as complete
   */
  async markActivityComplete(userId, activityId, statement) {
    await this.pool.query(
      `INSERT INTO xapi_activity_progress 
       (user_id, activity_id, status, completed_at, statement_id)
       VALUES ($1, $2, 'completed', NOW(), $3)
       ON CONFLICT (user_id, activity_id)
       DO UPDATE SET status = 'completed', completed_at = NOW(), statement_id = $3`,
      [userId, activityId, statement.id]
    );
  }

  /**
   * Update activity progress
   */
  async updateActivityProgress(userId, activityId, statement) {
    const progress = statement.result?.extensions?.['http://adlnet.gov/expapi/extensions/progress'] || 0;
    
    await this.pool.query(
      `INSERT INTO xapi_activity_progress 
       (user_id, activity_id, status, progress_percent, last_accessed)
       VALUES ($1, $2, 'in_progress', $3, NOW())
       ON CONFLICT (user_id, activity_id)
       DO UPDATE SET progress_percent = $3, last_accessed = NOW()`,
      [userId, activityId, progress]
    );
  }

  /**
   * Update activity score
   */
  async updateActivityScore(userId, activityId, score) {
    const scaledScore = score.scaled || (score.raw / score.max);
    
    await this.pool.query(
      `INSERT INTO xapi_activity_progress 
       (user_id, activity_id, score_raw, score_min, score_max, score_scaled)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, activity_id)
       DO UPDATE SET score_raw = $3, score_min = $4, score_max = $5, score_scaled = $6`,
      [userId, activityId, score.raw, score.min, score.max, scaledScore]
    );
  }

  /**
   * Get learner analytics from xAPI data
   */
  async getLearnerAnalytics(userId, filters = {}) {
    const courseFilter = filters.courseId ? 
      `AND object->>'id' LIKE '%/courses/${filters.courseId}%'` : '';

    const result = await this.pool.query(
      `SELECT 
        COUNT(*) as total_statements,
        COUNT(DISTINCT object->>'id') as unique_activities,
        COUNT(CASE WHEN verb->>'id' = 'http://adlnet.gov/expapi/verbs/completed' THEN 1 END) as completions,
        AVG((result->'score'->>'scaled')::float) as avg_score
       FROM xapi_statements
       WHERE actor->>'mbox' = (SELECT 'mailto:' || email FROM users WHERE id = $1)
       ${courseFilter}`,
      [userId]
    );

    return result.rows[0];
  }

  /**
   * Generate xAPI statement from platform action
   */
  generateStatement(actor, verb, object, result = null, context = null) {
    return {
      id: this.generateUUID(),
      actor: actor,
      verb: verb,
      object: object,
      result: result,
      context: context,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Common xAPI verb definitions
   */
  static VERBS = {
    COMPLETED: { 
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { 'en-US': 'completed' }
    },
    PASSED: {
      id: 'http://adlnet.gov/expapi/verbs/passed',
      display: { 'en-US': 'passed' }
    },
    FAILED: {
      id: 'http://adlnet.gov/expapi/verbs/failed',
      display: { 'en-US': 'failed' }
    },
    ATTEMPTED: {
      id: 'http://adlnet.gov/expapi/verbs/attempted',
      display: { 'en-US': 'attempted' }
    },
    EXPERIENCED: {
      id: 'http://adlnet.gov/expapi/verbs/experienced',
      display: { 'en-US': 'experienced' }
    },
    ANSWERED: {
      id: 'http://adlnet.gov/expapi/verbs/answered',
      display: { 'en-US': 'answered' }
    },
    PROGRESSED: {
      id: 'http://adlnet.gov/expapi/verbs/progressed',
      display: { 'en-US': 'progressed' }
    }
  };
}

module.exports = XAPIService;
