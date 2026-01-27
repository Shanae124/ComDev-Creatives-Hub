// SSO Authentication Service - SAML & OIDC Support
const { Pool } = require('pg');
const crypto = require('crypto');

class SSOService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Register SSO provider for organization
   */
  async registerProvider(orgId, providerData) {
    const result = await this.pool.query(
      `INSERT INTO sso_providers 
       (org_id, provider_type, provider_name, config, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        orgId,
        providerData.type, // 'saml', 'oidc', 'oauth2'
        providerData.name,
        JSON.stringify(providerData.config),
        providerData.status || 'active',
        JSON.stringify(providerData.metadata || {})
      ]
    );

    return result.rows[0];
  }

  /**
   * Configure SAML provider
   */
  async configureSAML(orgId, samlConfig) {
    const config = {
      entryPoint: samlConfig.entryPoint, // IdP login URL
      issuer: samlConfig.issuer, // SP entity ID
      certificate: samlConfig.certificate, // IdP certificate (X.509)
      signatureAlgorithm: samlConfig.signatureAlgorithm || 'sha256',
      identifierFormat: samlConfig.identifierFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      wantAssertionsSigned: samlConfig.wantAssertionsSigned !== false,
      wantResponseSigned: samlConfig.wantResponseSigned !== false,
      callbackUrl: samlConfig.callbackUrl || `${process.env.BASE_URL}/api/auth/saml/callback`,
      attributeMapping: samlConfig.attributeMapping || {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
        displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      }
    };

    return await this.registerProvider(orgId, {
      type: 'saml',
      name: samlConfig.name || 'SAML 2.0 Provider',
      config: config,
      metadata: {
        protocol: 'SAML 2.0',
        idpMetadataUrl: samlConfig.metadataUrl
      }
    });
  }

  /**
   * Configure OIDC provider (Google, Microsoft, etc.)
   */
  async configureOIDC(orgId, oidcConfig) {
    const config = {
      issuer: oidcConfig.issuer, // https://accounts.google.com, https://login.microsoftonline.com/tenant
      clientId: oidcConfig.clientId,
      clientSecret: oidcConfig.clientSecret,
      authorizationEndpoint: oidcConfig.authorizationEndpoint,
      tokenEndpoint: oidcConfig.tokenEndpoint,
      userInfoEndpoint: oidcConfig.userInfoEndpoint,
      jwksUri: oidcConfig.jwksUri,
      redirectUri: oidcConfig.redirectUri || `${process.env.BASE_URL}/api/auth/oidc/callback`,
      scope: oidcConfig.scope || 'openid profile email',
      responseType: oidcConfig.responseType || 'code',
      codeChallengeMethod: oidcConfig.codeChallengeMethod || 'S256', // PKCE
      attributeMapping: oidcConfig.attributeMapping || {
        email: 'email',
        firstName: 'given_name',
        lastName: 'family_name',
        displayName: 'name',
        picture: 'picture'
      }
    };

    return await this.registerProvider(orgId, {
      type: 'oidc',
      name: oidcConfig.name || 'OpenID Connect Provider',
      config: config,
      metadata: {
        protocol: 'OpenID Connect',
        wellKnownUrl: `${oidcConfig.issuer}/.well-known/openid-configuration`
      }
    });
  }

  /**
   * Configure Google OAuth2/OIDC
   */
  async configureGoogle(orgId, credentials) {
    return await this.configureOIDC(orgId, {
      name: 'Google',
      issuer: 'https://accounts.google.com',
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: 'https://www.googleapis.com/oauth2/v3/userinfo',
      jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
      scope: 'openid profile email'
    });
  }

  /**
   * Configure Microsoft Azure AD / Office 365
   */
  async configureMicrosoft(orgId, credentials) {
    const tenantId = credentials.tenantId || 'common';
    
    return await this.configureOIDC(orgId, {
      name: 'Microsoft',
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
      tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      userInfoEndpoint: 'https://graph.microsoft.com/oidc/userinfo',
      jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      scope: 'openid profile email'
    });
  }

  /**
   * Initiate SSO login
   */
  async initiateSSOLogin(orgId, providerId, returnUrl) {
    const provider = await this.pool.query(
      `SELECT * FROM sso_providers WHERE id = $1 AND org_id = $2 AND status = 'active'`,
      [providerId, orgId]
    );

    if (provider.rows.length === 0) {
      throw new Error('SSO provider not found or inactive');
    }

    const providerData = provider.rows[0];
    const config = providerData.config;

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in session/database
    await this.pool.query(
      `INSERT INTO sso_sessions 
       (state, provider_id, org_id, return_url, created_at, expires_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '10 minutes')`,
      [state, providerId, orgId, returnUrl]
    );

    if (providerData.provider_type === 'oidc') {
      return this.buildOIDCAuthUrl(config, state);
    } else if (providerData.provider_type === 'saml') {
      return this.buildSAMLAuthRequest(config, state);
    }

    throw new Error('Unsupported provider type');
  }

  /**
   * Build OIDC authorization URL
   */
  buildOIDCAuthUrl(config, state) {
    // Generate PKCE code verifier and challenge
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: config.responseType,
      scope: config.scope,
      redirect_uri: config.redirectUri,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: config.codeChallengeMethod,
      nonce: crypto.randomBytes(16).toString('hex')
    });

    return {
      url: `${config.authorizationEndpoint}?${params.toString()}`,
      codeVerifier: codeVerifier, // Store this for token exchange
      state: state
    };
  }

  /**
   * Build SAML authentication request
   */
  buildSAMLAuthRequest(config, state) {
    // In production, use a library like 'passport-saml' or 'samlify'
    // This is a simplified representation
    const samlRequest = {
      id: crypto.randomBytes(16).toString('hex'),
      issueInstant: new Date().toISOString(),
      destination: config.entryPoint,
      issuer: config.issuer,
      assertionConsumerServiceURL: config.callbackUrl
    };

    // Encode SAML request (Base64 + deflate compression in production)
    const encodedRequest = Buffer.from(JSON.stringify(samlRequest)).toString('base64');

    return {
      url: `${config.entryPoint}?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=${state}`,
      state: state
    };
  }

  /**
   * Handle SSO callback (OIDC authorization code flow)
   */
  async handleOIDCCallback(code, state, codeVerifier) {
    // Verify state
    const session = await this.pool.query(
      `SELECT * FROM sso_sessions 
       WHERE state = $1 AND expires_at > NOW()`,
      [state]
    );

    if (session.rows.length === 0) {
      throw new Error('Invalid or expired SSO session');
    }

    const sessionData = session.rows[0];

    // Get provider config
    const provider = await this.pool.query(
      `SELECT * FROM sso_providers WHERE id = $1`,
      [sessionData.provider_id]
    );

    const config = provider.rows[0].config;

    // Exchange code for tokens (would use HTTP client in production)
    const tokenResponse = await this.exchangeCodeForToken(config, code, codeVerifier);

    // Get user info
    const userInfo = await this.fetchUserInfo(config, tokenResponse.access_token);

    // Map attributes
    const mappedUser = this.mapAttributes(userInfo, config.attributeMapping);

    // Find or create user
    const user = await this.findOrCreateSSOUser(
      mappedUser,
      sessionData.org_id,
      sessionData.provider_id
    );

    // Clean up session
    await this.pool.query(
      `DELETE FROM sso_sessions WHERE state = $1`,
      [state]
    );

    return {
      user: user,
      returnUrl: sessionData.return_url,
      tokens: tokenResponse
    };
  }

  /**
   * Handle SAML callback
   */
  async handleSAMLCallback(samlResponse, relayState) {
    // Verify relay state (similar to OIDC state)
    const session = await this.pool.query(
      `SELECT * FROM sso_sessions 
       WHERE state = $1 AND expires_at > NOW()`,
      [relayState]
    );

    if (session.rows.length === 0) {
      throw new Error('Invalid or expired SAML session');
    }

    const sessionData = session.rows[0];

    // Get provider config
    const provider = await this.pool.query(
      `SELECT * FROM sso_providers WHERE id = $1`,
      [sessionData.provider_id]
    );

    const config = provider.rows[0].config;

    // Parse and validate SAML response (use 'passport-saml' in production)
    const assertion = this.parseSAMLResponse(samlResponse, config);

    // Map SAML attributes to user
    const mappedUser = this.mapAttributes(assertion.attributes, config.attributeMapping);

    // Find or create user
    const user = await this.findOrCreateSSOUser(
      mappedUser,
      sessionData.org_id,
      sessionData.provider_id
    );

    // Clean up session
    await this.pool.query(
      `DELETE FROM sso_sessions WHERE state = $1`,
      [relayState]
    );

    return {
      user: user,
      returnUrl: sessionData.return_url
    };
  }

  /**
   * Map SSO attributes to user model
   */
  mapAttributes(attributes, mapping) {
    const mapped = {};

    for (const [key, attributePath] of Object.entries(mapping)) {
      mapped[key] = attributes[attributePath] || attributes[key];
    }

    return mapped;
  }

  /**
   * Find or create user from SSO
   */
  async findOrCreateSSOUser(userData, orgId, providerId) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user exists
      let user = await client.query(
        `SELECT * FROM users WHERE email = $1`,
        [userData.email]
      );

      if (user.rows.length === 0) {
        // Create new user
        user = await client.query(
          `INSERT INTO users 
           (name, email, email_verified, auth_provider, auth_provider_id)
           VALUES ($1, $2, true, 'sso', $3)
           RETURNING *`,
          [
            userData.displayName || `${userData.firstName} ${userData.lastName}`,
            userData.email,
            providerId
          ]
        );
      }

      const userId = user.rows[0].id;

      // Link user to organization if not already
      await client.query(
        `INSERT INTO organization_users (org_id, user_id, role_name, status, joined_at)
         VALUES ($1, $2, 'learner', 'active', NOW())
         ON CONFLICT (org_id, user_id) DO NOTHING`,
        [orgId, userId]
      );

      // Record SSO login
      await client.query(
        `INSERT INTO sso_logins 
         (user_id, provider_id, org_id, login_at, attributes)
         VALUES ($1, $2, $3, NOW(), $4)`,
        [userId, providerId, orgId, JSON.stringify(userData)]
      );

      await client.query('COMMIT');

      return user.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Exchange authorization code for tokens (OIDC)
   * In production, use HTTP client (axios, node-fetch)
   */
  async exchangeCodeForToken(config, code, codeVerifier) {
    // Placeholder - implement with HTTP client
    return {
      access_token: 'mock_access_token',
      id_token: 'mock_id_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600
    };
  }

  /**
   * Fetch user info from OIDC provider
   * In production, use HTTP client
   */
  async fetchUserInfo(config, accessToken) {
    // Placeholder - implement with HTTP client
    return {
      email: 'user@example.com',
      given_name: 'John',
      family_name: 'Doe',
      name: 'John Doe',
      picture: 'https://example.com/avatar.jpg'
    };
  }

  /**
   * Parse SAML response
   * In production, use 'passport-saml' or similar library
   */
  parseSAMLResponse(samlResponse, config) {
    // Placeholder - implement with SAML library
    return {
      nameID: 'user@example.com',
      attributes: {
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'user@example.com',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname': 'John',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname': 'Doe',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'John Doe'
      }
    };
  }

  /**
   * Get organization SSO providers
   */
  async getOrganizationProviders(orgId) {
    const result = await this.pool.query(
      `SELECT 
        id,
        provider_type,
        provider_name,
        status,
        metadata,
        created_at
       FROM sso_providers
       WHERE org_id = $1
       ORDER BY created_at DESC`,
      [orgId]
    );

    return result.rows;
  }

  /**
   * Test SSO configuration
   */
  async testProvider(providerId) {
    const provider = await this.pool.query(
      `SELECT * FROM sso_providers WHERE id = $1`,
      [providerId]
    );

    if (provider.rows.length === 0) {
      throw new Error('Provider not found');
    }

    const providerData = provider.rows[0];
    const config = providerData.config;

    // Perform basic validation
    const errors = [];

    if (providerData.provider_type === 'oidc') {
      if (!config.clientId) errors.push('Missing client ID');
      if (!config.clientSecret) errors.push('Missing client secret');
      if (!config.issuer) errors.push('Missing issuer');
      if (!config.authorizationEndpoint) errors.push('Missing authorization endpoint');
      if (!config.tokenEndpoint) errors.push('Missing token endpoint');
    } else if (providerData.provider_type === 'saml') {
      if (!config.entryPoint) errors.push('Missing IdP entry point');
      if (!config.issuer) errors.push('Missing SP issuer');
      if (!config.certificate) errors.push('Missing IdP certificate');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      provider: {
        id: providerData.id,
        type: providerData.provider_type,
        name: providerData.provider_name
      }
    };
  }
}

module.exports = SSOService;
