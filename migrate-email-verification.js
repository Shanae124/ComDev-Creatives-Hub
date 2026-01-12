const pool = require("./db");

async function migrate() {
  try {
    console.log('🔄 Adding email verification columns to users table...');
    
    // Add email_verified column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Added email_verified column');
    
    // Add verification_token column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS verification_token TEXT
    `);
    console.log('✅ Added verification_token column');
    
    // Add verification_token_expires column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP
    `);
    console.log('✅ Added verification_token_expires column');
    
    // Create index on verification_token
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_verification_token 
      ON users(verification_token)
    `);
    console.log('✅ Created index on verification_token');
    
    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
