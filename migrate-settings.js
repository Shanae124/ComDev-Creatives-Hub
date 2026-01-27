// Settings Database Migration
const pool = require('./db');

async function migrateSettingsTable() {
  const client = await pool.connect();

  try {
    console.log('🔧 Creating system_settings table...\n');

    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        
        -- General Settings
        site_name VARCHAR(255) DEFAULT 'ProtexxaLearn',
        site_url VARCHAR(500),
        site_description TEXT,
        support_email VARCHAR(255),
        timezone VARCHAR(100) DEFAULT 'America/New_York',
        language VARCHAR(10) DEFAULT 'en',
        
        -- Registration & Access
        allow_registration BOOLEAN DEFAULT true,
        require_email_verification BOOLEAN DEFAULT true,
        maintenance_mode BOOLEAN DEFAULT false,
        maintenance_message TEXT,
        max_upload_size INTEGER DEFAULT 500,
        session_timeout INTEGER DEFAULT 480,
        
        -- Security Settings
        password_min_length INTEGER DEFAULT 8,
        password_require_uppercase BOOLEAN DEFAULT true,
        password_require_lowercase BOOLEAN DEFAULT true,
        password_require_numbers BOOLEAN DEFAULT true,
        password_require_special BOOLEAN DEFAULT true,
        max_login_attempts INTEGER DEFAULT 5,
        lockout_duration INTEGER DEFAULT 15,
        two_factor_enabled BOOLEAN DEFAULT false,
        session_remember_days INTEGER DEFAULT 30,
        
        -- Email Settings (SMTP)
        smtp_host VARCHAR(255),
        smtp_port INTEGER DEFAULT 587,
        smtp_username VARCHAR(255),
        smtp_password VARCHAR(500),
        smtp_encryption VARCHAR(10) DEFAULT 'tls',
        from_email VARCHAR(255),
        from_name VARCHAR(255) DEFAULT 'ProtexxaLearn',
        
        -- Notification Settings
        email_notifications BOOLEAN DEFAULT true,
        enrollment_notifications BOOLEAN DEFAULT true,
        assignment_notifications BOOLEAN DEFAULT true,
        grade_notifications BOOLEAN DEFAULT true,
        announcement_notifications BOOLEAN DEFAULT true,
        digest_frequency VARCHAR(20) DEFAULT 'daily',
        push_notifications BOOLEAN DEFAULT false,
        
        -- Advanced Settings
        enable_ssl BOOLEAN DEFAULT true,
        enable_analytics BOOLEAN DEFAULT false,
        analytics_code TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ system_settings table created successfully');

    // Insert default settings if table is empty
    const existing = await client.query('SELECT COUNT(*) FROM system_settings');
    
    if (parseInt(existing.rows[0].count) === 0) {
      console.log('\n📝 Inserting default settings...');
      
      await client.query(`
        INSERT INTO system_settings (
          site_name, site_url, site_description, support_email,
          timezone, language, allow_registration, require_email_verification
        ) VALUES (
          'ProtexxaLearn',
          'http://localhost:3000',
          'Enterprise Learning Management System',
          'support@protexxalearn.com',
          'America/New_York',
          'en',
          true,
          true
        )
      `);
      
      console.log('✅ Default settings inserted');
    }

    console.log('\n✅ Settings migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateSettingsTable()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
