const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'protexxalearn',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function runAdminMigration() {
  console.log('🚀 Running admin features database migration...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'initdb-admin.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Admin features migration completed successfully!');
    console.log('\nNew features available:');
    console.log('  - Attendance tracking');
    console.log('  - Student groups');
    console.log('  - Quizzes with question banks');
    console.log('  - Rubrics for grading');
    console.log('  - Checklists');
    console.log('  - Competencies tracking');
    console.log('  - Surveys and feedback');
    console.log('  - Awards/Badges system');
    console.log('  - Discussion forums');
    console.log('  - Calendar events');
    console.log('  - FAQ and Glossary');
    console.log('  - System settings management');
    console.log('  - Email logging');
    console.log('  - External tools integration');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runAdminMigration()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runAdminMigration };
