// Multi-tenant Organization Service
const { Pool } = require('pg');

class OrganizationService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Create a new organization (tenant)
   */
  async createOrganization(data) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Create organization
      const orgResult = await client.query(
        `INSERT INTO organizations 
         (name, slug, domain, subdomain, settings, branding, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          data.name,
          data.slug,
          data.domain || null,
          data.subdomain || null,
          data.settings ? JSON.stringify(data.settings) : JSON.stringify({
            timezone: 'UTC',
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            currency: 'USD'
          }),
          data.branding ? JSON.stringify(data.branding) : JSON.stringify({
            logoUrl: null,
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6'
          }),
          data.status || 'active',
          data.createdBy
        ]
      );

      const orgId = orgResult.rows[0].id;

      // Create default roles for organization
      await this.createDefaultRoles(client, orgId);

      // Create default admin user if provided
      if (data.adminUser) {
        await this.createOrganizationAdmin(client, orgId, data.adminUser);
      }

      await client.query('COMMIT');
      return orgResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create default roles for organization
   */
  async createDefaultRoles(client, orgId) {
    const defaultRoles = [
      {
        name: 'org_admin',
        displayName: 'Organization Administrator',
        description: 'Full administrative access to organization',
        permissions: [
          'org.manage', 'users.manage', 'courses.manage', 'content.manage',
          'roles.manage', 'reports.view', 'settings.manage', 'billing.manage'
        ],
        isSystemRole: true
      },
      {
        name: 'course_admin',
        displayName: 'Course Administrator',
        description: 'Manage courses and content',
        permissions: [
          'courses.create', 'courses.edit', 'courses.delete', 'content.manage',
          'enrollments.manage', 'reports.view'
        ],
        isSystemRole: true
      },
      {
        name: 'instructor',
        displayName: 'Instructor',
        description: 'Teach courses and grade assignments',
        permissions: [
          'courses.view', 'courses.edit_own', 'content.edit_own',
          'assignments.grade', 'discussions.moderate', 'reports.view_own'
        ],
        isSystemRole: true
      },
      {
        name: 'teaching_assistant',
        displayName: 'Teaching Assistant',
        description: 'Assist with teaching and grading',
        permissions: [
          'courses.view', 'assignments.grade', 'discussions.moderate',
          'learners.view'
        ],
        isSystemRole: true
      },
      {
        name: 'learner',
        displayName: 'Learner',
        description: 'Access and complete courses',
        permissions: [
          'courses.view_enrolled', 'content.view', 'assignments.submit',
          'discussions.participate', 'profile.manage'
        ],
        isSystemRole: true
      },
      {
        name: 'auditor',
        displayName: 'Auditor',
        description: 'View courses without completing assignments',
        permissions: [
          'courses.view_enrolled', 'content.view'
        ],
        isSystemRole: true
      }
    ];

    for (const role of defaultRoles) {
      await client.query(
        `INSERT INTO organization_roles 
         (org_id, name, display_name, description, permissions, is_system_role)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orgId,
          role.name,
          role.displayName,
          role.description,
          JSON.stringify(role.permissions),
          role.isSystemRole
        ]
      );
    }
  }

  /**
   * Create organization admin user
   */
  async createOrganizationAdmin(client, orgId, adminData) {
    // Assumes user already exists, just add to org
    await client.query(
      `INSERT INTO organization_users (org_id, user_id, role_name, status)
       VALUES ($1, $2, 'org_admin', 'active')`,
      [orgId, adminData.userId]
    );
  }

  /**
   * Check if user has permission in organization
   */
  async checkPermission(userId, orgId, permission) {
    const result = await this.pool.query(
      `SELECT 
        r.permissions,
        ou.role_name
       FROM organization_users ou
       JOIN organization_roles r ON ou.org_id = r.org_id AND ou.role_name = r.name
       WHERE ou.user_id = $1 AND ou.org_id = $2 AND ou.status = 'active'`,
      [userId, orgId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const permissions = JSON.parse(result.rows[0].permissions);
    
    // Check for exact match or wildcard
    return permissions.includes(permission) || 
           permissions.includes(permission.split('.')[0] + '.*') ||
           permissions.includes('*');
  }

  /**
   * Get user's effective permissions in organization
   */
  async getUserPermissions(userId, orgId) {
    const result = await this.pool.query(
      `SELECT 
        r.permissions,
        r.name as role_name,
        r.display_name
       FROM organization_users ou
       JOIN organization_roles r ON ou.org_id = r.org_id AND ou.role_name = r.name
       WHERE ou.user_id = $1 AND ou.org_id = $2 AND ou.status = 'active'`,
      [userId, orgId]
    );

    if (result.rows.length === 0) {
      return {
        roles: [],
        permissions: []
      };
    }

    // Combine permissions from all roles
    const allPermissions = new Set();
    const roles = [];

    result.rows.forEach(row => {
      roles.push({
        name: row.role_name,
        displayName: row.display_name
      });
      
      const perms = JSON.parse(row.permissions);
      perms.forEach(p => allPermissions.add(p));
    });

    return {
      roles,
      permissions: Array.from(allPermissions)
    };
  }

  /**
   * Add user to organization with role
   */
  async addUserToOrganization(orgId, userId, roleName) {
    const result = await this.pool.query(
      `INSERT INTO organization_users (org_id, user_id, role_name, status, joined_at)
       VALUES ($1, $2, $3, 'active', NOW())
       ON CONFLICT (org_id, user_id)
       DO UPDATE SET role_name = $3, status = 'active'
       RETURNING *`,
      [orgId, userId, roleName]
    );

    return result.rows[0];
  }

  /**
   * Create custom role for organization
   */
  async createCustomRole(orgId, roleData) {
    const result = await this.pool.query(
      `INSERT INTO organization_roles 
       (org_id, name, display_name, description, permissions, is_system_role)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING *`,
      [
        orgId,
        roleData.name,
        roleData.displayName,
        roleData.description,
        JSON.stringify(roleData.permissions)
      ]
    );

    return result.rows[0];
  }

  /**
   * Get organization by domain/subdomain
   */
  async getOrganizationByDomain(domain) {
    const result = await this.pool.query(
      `SELECT * FROM organizations 
       WHERE (domain = $1 OR subdomain = $1) AND status = 'active'`,
      [domain]
    );

    return result.rows[0] || null;
  }

  /**
   * Get organization settings
   */
  async getOrganizationSettings(orgId) {
    const result = await this.pool.query(
      `SELECT settings, branding FROM organizations WHERE id = $1`,
      [orgId]
    );

    if (result.rows.length === 0) {
      throw new Error('Organization not found');
    }

    return {
      settings: result.rows[0].settings,
      branding: result.rows[0].branding
    };
  }

  /**
   * Update organization branding
   */
  async updateBranding(orgId, branding) {
    await this.pool.query(
      `UPDATE organizations SET branding = $1 WHERE id = $2`,
      [JSON.stringify(branding), orgId]
    );

    return { success: true };
  }

  /**
   * Get organization catalog (courses visible to org)
   */
  async getOrganizationCatalog(orgId, filters = {}) {
    let query = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM enrollments e 
         JOIN organization_users ou ON e.user_id = ou.user_id 
         WHERE e.course_id = c.id AND ou.org_id = $1) as enrollment_count
      FROM courses c
      WHERE c.org_id = $1 OR c.is_public = true
    `;

    const params = [orgId];

    if (filters.status) {
      params.push(filters.status);
      query += ` AND c.status = $${params.length}`;
    }

    if (filters.category) {
      params.push(filters.category);
      query += ` AND c.category_id = $${params.length}`;
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Create organization cohort/group
   */
  async createCohort(orgId, cohortData) {
    const result = await this.pool.query(
      `INSERT INTO organization_cohorts 
       (org_id, name, description, start_date, end_date, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        orgId,
        cohortData.name,
        cohortData.description,
        cohortData.startDate,
        cohortData.endDate,
        cohortData.settings ? JSON.stringify(cohortData.settings) : null
      ]
    );

    return result.rows[0];
  }

  /**
   * Add users to cohort
   */
  async addUsersToCohort(cohortId, userIds) {
    const values = userIds.map(userId => `(${cohortId}, ${userId})`).join(',');
    
    await this.pool.query(
      `INSERT INTO cohort_members (cohort_id, user_id)
       VALUES ${values}
       ON CONFLICT DO NOTHING`
    );

    return { success: true, count: userIds.length };
  }

  /**
   * Auto-enroll cohort in courses
   */
  async enrollCohortInCourses(cohortId, courseIds) {
    // Get all cohort members
    const members = await this.pool.query(
      `SELECT user_id FROM cohort_members WHERE cohort_id = $1`,
      [cohortId]
    );

    // Enroll each member in each course
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const member of members.rows) {
        for (const courseId of courseIds) {
          await client.query(
            `INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
             VALUES ($1, $2, 'active', NOW())
             ON CONFLICT (user_id, course_id) DO NOTHING`,
            [member.user_id, courseId]
          );
        }
      }

      await client.query('COMMIT');
      return { success: true, enrolled: members.rows.length * courseIds.length };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get organization analytics
   */
  async getOrganizationAnalytics(orgId) {
    const result = await this.pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM organization_users WHERE org_id = $1 AND status = 'active') as total_users,
        (SELECT COUNT(*) FROM courses WHERE org_id = $1) as total_courses,
        (SELECT COUNT(*) FROM enrollments e 
         JOIN organization_users ou ON e.user_id = ou.user_id 
         WHERE ou.org_id = $1) as total_enrollments,
        (SELECT COUNT(*) FROM enrollments e 
         JOIN organization_users ou ON e.user_id = ou.user_id 
         WHERE ou.org_id = $1 AND e.status = 'completed') as completed_enrollments,
        (SELECT AVG(score) FROM quiz_attempts qa
         JOIN organization_users ou ON qa.user_id = ou.user_id
         WHERE ou.org_id = $1 AND qa.status = 'completed') as avg_quiz_score`,
      [orgId]
    );

    return result.rows[0];
  }
}

module.exports = OrganizationService;
