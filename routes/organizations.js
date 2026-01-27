// Organizations API Routes
const express = require('express');
const router = express.Router();
const OrganizationService = require('../services/organization');
const { authenticate, requirePermission } = require('../middleware/auth');

module.exports = (pool) => {
  const orgService = new OrganizationService(pool);

  /**
   * Create new organization
   * POST /api/organizations
   */
  router.post('/', authenticate, async (req, res) => {
    try {
      const org = await orgService.createOrganization({
        ...req.body,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        organization: org
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get organization details
   * GET /api/organizations/:id
   */
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM organizations WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Update organization
   * PATCH /api/organizations/:id
   */
  router.patch('/:id', authenticate, async (req, res) => {
    try {
      // Check permission
      const hasPermission = await orgService.checkPermission(
        req.user.id,
        req.params.id,
        'org.manage'
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (req.body.name) {
        updates.push(`name = $${paramCount++}`);
        values.push(req.body.name);
      }
      if (req.body.settings) {
        updates.push(`settings = $${paramCount++}`);
        values.push(JSON.stringify(req.body.settings));
      }
      if (req.body.branding) {
        updates.push(`branding = $${paramCount++}`);
        values.push(JSON.stringify(req.body.branding));
      }
      if (req.body.status) {
        updates.push(`status = $${paramCount++}`);
        values.push(req.body.status);
      }

      updates.push(`updated_at = NOW()`);
      values.push(req.params.id);

      const result = await pool.query(
        `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Create custom role
   * POST /api/organizations/:id/roles
   */
  router.post('/:id/roles', authenticate, async (req, res) => {
    try {
      const hasPermission = await orgService.checkPermission(
        req.user.id,
        req.params.id,
        'roles.manage'
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const role = await orgService.createCustomRole(req.params.id, req.body);
      res.status(201).json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Add user to organization
   * POST /api/organizations/:id/users
   */
  router.post('/:id/users', authenticate, async (req, res) => {
    try {
      const hasPermission = await orgService.checkPermission(
        req.user.id,
        req.params.id,
        'users.manage'
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const { userId, roleName } = req.body;
      const orgUser = await orgService.addUserToOrganization(
        req.params.id,
        userId,
        roleName
      );

      res.status(201).json(orgUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get user permissions in organization
   * GET /api/organizations/:id/users/:userId/permissions
   */
  router.get('/:id/users/:userId/permissions', authenticate, async (req, res) => {
    try {
      const permissions = await orgService.getUserPermissions(
        req.params.userId,
        req.params.id
      );

      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get organization analytics
   * GET /api/organizations/:id/analytics
   */
  router.get('/:id/analytics', authenticate, async (req, res) => {
    try {
      const hasPermission = await orgService.checkPermission(
        req.user.id,
        req.params.id,
        'reports.view'
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const analytics = await orgService.getOrganizationAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get organization course catalog
   * GET /api/organizations/:id/catalog
   */
  router.get('/:id/catalog', authenticate, async (req, res) => {
    try {
      const catalog = await orgService.getOrganizationCatalog(
        req.params.id,
        req.query
      );
      res.json(catalog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Create cohort
   * POST /api/organizations/:id/cohorts
   */
  router.post('/:id/cohorts', authenticate, async (req, res) => {
    try {
      const hasPermission = await orgService.checkPermission(
        req.user.id,
        req.params.id,
        'users.manage'
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const cohort = await orgService.createCohort(req.params.id, req.body);
      res.status(201).json(cohort);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Add users to cohort
   * POST /api/organizations/cohorts/:cohortId/members
   */
  router.post('/cohorts/:cohortId/members', authenticate, async (req, res) => {
    try {
      const { userIds } = req.body;
      const result = await orgService.addUsersToCohort(
        req.params.cohortId,
        userIds
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Enroll cohort in courses
   * POST /api/organizations/cohorts/:cohortId/enroll
   */
  router.post('/cohorts/:cohortId/enroll', authenticate, async (req, res) => {
    try {
      const { courseIds } = req.body;
      const result = await orgService.enrollCohortInCourses(
        req.params.cohortId,
        courseIds
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
