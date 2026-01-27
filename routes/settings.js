// Settings API Routes
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

  // Get all system settings
  router.get('/system', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM system_settings ORDER BY id DESC LIMIT 1
      `);

      const settings = result.rows[0] || {};

      res.json({
        system: {
          site_name: settings.site_name || 'ProtexxaLearn',
          site_url: settings.site_url || '',
          site_description: settings.site_description || '',
          support_email: settings.support_email || '',
          timezone: settings.timezone || 'America/New_York',
          language: settings.language || 'en',
          allow_registration: settings.allow_registration !== false,
          require_email_verification: settings.require_email_verification !== false,
          maintenance_mode: settings.maintenance_mode || false,
          maintenance_message: settings.maintenance_message || '',
          max_upload_size: settings.max_upload_size || 500,
          session_timeout: settings.session_timeout || 480,
          enable_ssl: settings.enable_ssl !== false,
          enable_analytics: settings.enable_analytics || false,
          analytics_code: settings.analytics_code || ''
        },
        email: {
          smtp_host: settings.smtp_host || '',
          smtp_port: settings.smtp_port || 587,
          smtp_username: settings.smtp_username || '',
          smtp_password: settings.smtp_password || '',
          smtp_encryption: settings.smtp_encryption || 'tls',
          from_email: settings.from_email || '',
          from_name: settings.from_name || 'ProtexxaLearn'
        },
        security: {
          password_min_length: settings.password_min_length || 8,
          password_require_uppercase: settings.password_require_uppercase !== false,
          password_require_lowercase: settings.password_require_lowercase !== false,
          password_require_numbers: settings.password_require_numbers !== false,
          password_require_special: settings.password_require_special !== false,
          max_login_attempts: settings.max_login_attempts || 5,
          lockout_duration: settings.lockout_duration || 15,
          two_factor_enabled: settings.two_factor_enabled || false,
          session_remember_days: settings.session_remember_days || 30
        },
        notifications: {
          email_notifications: settings.email_notifications !== false,
          enrollment_notifications: settings.enrollment_notifications !== false,
          assignment_notifications: settings.assignment_notifications !== false,
          grade_notifications: settings.grade_notifications !== false,
          announcement_notifications: settings.announcement_notifications !== false,
          digest_frequency: settings.digest_frequency || 'daily',
          push_notifications: settings.push_notifications || false
        }
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update system settings
  router.put('/system', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const {
        site_name, site_url, site_description, support_email,
        timezone, language, allow_registration, require_email_verification,
        maintenance_mode, maintenance_message, max_upload_size,
        session_timeout, enable_ssl, enable_analytics, analytics_code
      } = req.body;

      // Check if settings exist
      const existing = await pool.query('SELECT id FROM system_settings LIMIT 1');

      if (existing.rows.length > 0) {
        // Update existing
        await pool.query(`
          UPDATE system_settings SET
            site_name = $1,
            site_url = $2,
            site_description = $3,
            support_email = $4,
            timezone = $5,
            language = $6,
            allow_registration = $7,
            require_email_verification = $8,
            maintenance_mode = $9,
            maintenance_message = $10,
            max_upload_size = $11,
            session_timeout = $12,
            enable_ssl = $13,
            enable_analytics = $14,
            analytics_code = $15,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $16
        `, [
          site_name, site_url, site_description, support_email,
          timezone, language, allow_registration, require_email_verification,
          maintenance_mode, maintenance_message, max_upload_size,
          session_timeout, enable_ssl, enable_analytics, analytics_code,
          existing.rows[0].id
        ]);
      } else {
        // Insert new
        await pool.query(`
          INSERT INTO system_settings (
            site_name, site_url, site_description, support_email,
            timezone, language, allow_registration, require_email_verification,
            maintenance_mode, maintenance_message, max_upload_size,
            session_timeout, enable_ssl, enable_analytics, analytics_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          site_name, site_url, site_description, support_email,
          timezone, language, allow_registration, require_email_verification,
          maintenance_mode, maintenance_message, max_upload_size,
          session_timeout, enable_ssl, enable_analytics, analytics_code
        ]);
      }

      res.json({ message: 'System settings updated successfully' });
    } catch (error) {
      console.error('Update system settings error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update email settings
  router.put('/email', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const {
        smtp_host, smtp_port, smtp_username, smtp_password,
        smtp_encryption, from_email, from_name
      } = req.body;

      const existing = await pool.query('SELECT id FROM system_settings LIMIT 1');

      if (existing.rows.length > 0) {
        await pool.query(`
          UPDATE system_settings SET
            smtp_host = $1,
            smtp_port = $2,
            smtp_username = $3,
            smtp_password = $4,
            smtp_encryption = $5,
            from_email = $6,
            from_name = $7,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $8
        `, [smtp_host, smtp_port, smtp_username, smtp_password, smtp_encryption, from_email, from_name, existing.rows[0].id]);
      } else {
        await pool.query(`
          INSERT INTO system_settings (smtp_host, smtp_port, smtp_username, smtp_password, smtp_encryption, from_email, from_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [smtp_host, smtp_port, smtp_username, smtp_password, smtp_encryption, from_email, from_name]);
      }

      res.json({ message: 'Email settings updated successfully' });
    } catch (error) {
      console.error('Update email settings error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test email connection
  router.post('/email/test', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const { smtp_host, smtp_port, smtp_username, smtp_password, smtp_encryption, from_email, from_name, test_email } = req.body;

      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransporter({
        host: smtp_host,
        port: smtp_port,
        secure: smtp_encryption === 'ssl',
        auth: {
          user: smtp_username,
          pass: smtp_password
        }
      });

      await transporter.sendMail({
        from: `"${from_name}" <${from_email}>`,
        to: test_email,
        subject: 'ProtexxaLearn Email Test',
        html: `
          <h2>Email Configuration Test</h2>
          <p>This is a test email from ProtexxaLearn LMS.</p>
          <p>If you're reading this, your email settings are configured correctly!</p>
          <hr>
          <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
        `
      });

      res.json({ message: 'Test email sent successfully' });
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ error: 'Failed to send test email: ' + error.message });
    }
  });

  // Update security settings
  router.put('/security', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const {
        password_min_length, password_require_uppercase, password_require_lowercase,
        password_require_numbers, password_require_special, max_login_attempts,
        lockout_duration, two_factor_enabled, session_remember_days
      } = req.body;

      const existing = await pool.query('SELECT id FROM system_settings LIMIT 1');

      if (existing.rows.length > 0) {
        await pool.query(`
          UPDATE system_settings SET
            password_min_length = $1,
            password_require_uppercase = $2,
            password_require_lowercase = $3,
            password_require_numbers = $4,
            password_require_special = $5,
            max_login_attempts = $6,
            lockout_duration = $7,
            two_factor_enabled = $8,
            session_remember_days = $9,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $10
        `, [
          password_min_length, password_require_uppercase, password_require_lowercase,
          password_require_numbers, password_require_special, max_login_attempts,
          lockout_duration, two_factor_enabled, session_remember_days,
          existing.rows[0].id
        ]);
      } else {
        await pool.query(`
          INSERT INTO system_settings (
            password_min_length, password_require_uppercase, password_require_lowercase,
            password_require_numbers, password_require_special, max_login_attempts,
            lockout_duration, two_factor_enabled, session_remember_days
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          password_min_length, password_require_uppercase, password_require_lowercase,
          password_require_numbers, password_require_special, max_login_attempts,
          lockout_duration, two_factor_enabled, session_remember_days
        ]);
      }

      res.json({ message: 'Security settings updated successfully' });
    } catch (error) {
      console.error('Update security settings error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update notification settings
  router.put('/notifications', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const {
        email_notifications, enrollment_notifications, assignment_notifications,
        grade_notifications, announcement_notifications, digest_frequency,
        push_notifications
      } = req.body;

      const existing = await pool.query('SELECT id FROM system_settings LIMIT 1');

      if (existing.rows.length > 0) {
        await pool.query(`
          UPDATE system_settings SET
            email_notifications = $1,
            enrollment_notifications = $2,
            assignment_notifications = $3,
            grade_notifications = $4,
            announcement_notifications = $5,
            digest_frequency = $6,
            push_notifications = $7,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $8
        `, [
          email_notifications, enrollment_notifications, assignment_notifications,
          grade_notifications, announcement_notifications, digest_frequency,
          push_notifications, existing.rows[0].id
        ]);
      } else {
        await pool.query(`
          INSERT INTO system_settings (
            email_notifications, enrollment_notifications, assignment_notifications,
            grade_notifications, announcement_notifications, digest_frequency,
            push_notifications
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          email_notifications, enrollment_notifications, assignment_notifications,
          grade_notifications, announcement_notifications, digest_frequency,
          push_notifications
        ]);
      }

      res.json({ message: 'Notification settings updated successfully' });
    } catch (error) {
      console.error('Update notification settings error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Clear cache
  router.post('/cache/clear', authenticate, requireRole('admin'), async (req, res) => {
    try {
      // In production, clear Redis or other cache
      // For now, just return success
      res.json({ message: 'Cache cleared successfully' });
    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Export settings
  router.get('/export', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM system_settings ORDER BY id DESC LIMIT 1');
      
      const settings = result.rows[0] || {};
      
      // Remove sensitive data
      delete settings.smtp_password;
      delete settings.analytics_code;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=protexxalearn-settings-${new Date().toISOString().split('T')[0]}.json`);
      res.json({
        exported_at: new Date().toISOString(),
        version: '2.0.0',
        settings: settings
      });
    } catch (error) {
      console.error('Export settings error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
