// SSO Authentication API Routes
const express = require('express');
const router = express.Router();
const SSOService = require('../services/sso');
const { authenticate } = require('../middleware/auth');

module.exports = (pool) => {
  const ssoService = new SSOService(pool);

  /**
   * Register SSO provider
   * POST /api/auth/sso/providers
   */
  router.post('/providers', authenticate, async (req, res) => {
    try {
      const provider = await ssoService.registerProvider(
        req.body.orgId,
        req.body
      );

      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Configure SAML provider
   * POST /api/auth/sso/providers/saml
   */
  router.post('/providers/saml', authenticate, async (req, res) => {
    try {
      const provider = await ssoService.configureSAML(
        req.body.orgId,
        req.body
      );

      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Configure OIDC provider
   * POST /api/auth/sso/providers/oidc
   */
  router.post('/providers/oidc', authenticate, async (req, res) => {
    try {
      const provider = await ssoService.configureOIDC(
        req.body.orgId,
        req.body
      );

      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Quick configure Google SSO
   * POST /api/auth/sso/providers/google
   */
  router.post('/providers/google', authenticate, async (req, res) => {
    try {
      const provider = await ssoService.configureGoogle(
        req.body.orgId,
        req.body.credentials
      );

      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Quick configure Microsoft SSO
   * POST /api/auth/sso/providers/microsoft
   */
  router.post('/providers/microsoft', authenticate, async (req, res) => {
    try {
      const provider = await ssoService.configureMicrosoft(
        req.body.orgId,
        req.body.credentials
      );

      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get organization's SSO providers
   * GET /api/auth/sso/providers?orgId=123
   */
  router.get('/providers', async (req, res) => {
    try {
      const { orgId } = req.query;
      
      if (!orgId) {
        return res.status(400).json({ error: 'orgId is required' });
      }

      const providers = await ssoService.getOrganizationProviders(orgId);
      res.json(providers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Initiate SSO login
   * GET /api/auth/sso/login/:providerId
   */
  router.get('/login/:providerId', async (req, res) => {
    try {
      const { orgId, returnUrl } = req.query;

      if (!orgId) {
        return res.status(400).json({ error: 'orgId is required' });
      }

      const loginData = await ssoService.initiateSSOLogin(
        orgId,
        req.params.providerId,
        returnUrl || '/dashboard'
      );

      // Store code verifier in session if OIDC
      if (loginData.codeVerifier) {
        req.session.codeVerifier = loginData.codeVerifier;
      }

      res.redirect(loginData.url);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * OIDC callback handler
   * GET /api/auth/sso/callback/oidc
   */
  router.get('/callback/oidc', async (req, res) => {
    try {
      const { code, state } = req.query;

      if (!code || !state) {
        return res.status(400).json({ error: 'Missing code or state' });
      }

      const codeVerifier = req.session.codeVerifier;
      const result = await ssoService.handleOIDCCallback(
        code,
        state,
        codeVerifier
      );

      // Create session for user
      req.session.user = result.user;
      req.session.tokens = result.tokens;

      // Clean up
      delete req.session.codeVerifier;

      res.redirect(result.returnUrl);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * SAML callback handler
   * POST /api/auth/sso/callback/saml
   */
  router.post('/callback/saml', async (req, res) => {
    try {
      const { SAMLResponse, RelayState } = req.body;

      if (!SAMLResponse || !RelayState) {
        return res.status(400).json({ error: 'Missing SAML response' });
      }

      const result = await ssoService.handleSAMLCallback(
        SAMLResponse,
        RelayState
      );

      // Create session for user
      req.session.user = result.user;

      res.redirect(result.returnUrl);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Test SSO provider configuration
   * GET /api/auth/sso/providers/:providerId/test
   */
  router.get('/providers/:providerId/test', authenticate, async (req, res) => {
    try {
      const testResult = await ssoService.testProvider(req.params.providerId);
      res.json(testResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Update SSO provider
   * PATCH /api/auth/sso/providers/:id
   */
  router.patch('/providers/:id', authenticate, async (req, res) => {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (req.body.provider_name) {
        updates.push(`provider_name = $${paramCount++}`);
        values.push(req.body.provider_name);
      }
      if (req.body.config) {
        updates.push(`config = $${paramCount++}`);
        values.push(JSON.stringify(req.body.config));
      }
      if (req.body.status) {
        updates.push(`status = $${paramCount++}`);
        values.push(req.body.status);
      }
      if (req.body.metadata) {
        updates.push(`metadata = $${paramCount++}`);
        values.push(JSON.stringify(req.body.metadata));
      }

      updates.push(`updated_at = NOW()`);
      values.push(req.params.id);

      const result = await pool.query(
        `UPDATE sso_providers SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Delete SSO provider
   * DELETE /api/auth/sso/providers/:id
   */
  router.delete('/providers/:id', authenticate, async (req, res) => {
    try {
      await pool.query('DELETE FROM sso_providers WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get SSO login audit log
   * GET /api/auth/sso/logs?orgId=123
   */
  router.get('/logs', authenticate, async (req, res) => {
    try {
      const { orgId, userId, limit } = req.query;

      let query = 'SELECT * FROM sso_logins WHERE 1=1';
      const params = [];

      if (orgId) {
        params.push(orgId);
        query += ` AND org_id = $${params.length}`;
      }
      if (userId) {
        params.push(userId);
        query += ` AND user_id = $${params.length}`;
      }

      query += ' ORDER BY login_at DESC';

      if (limit) {
        params.push(parseInt(limit));
        query += ` LIMIT $${params.length}`;
      }

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
