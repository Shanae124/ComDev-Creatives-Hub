const pool = require('./db');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  try {
    console.log('🔑 Creating test users with real passwords...\n');

    // Password for all test accounts: "Password123" (meets validation: upper+lower+number)
    const hashedPassword = await bcrypt.hash('Password123', 10);

    // Create admin user
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, email_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $3, email_verified = true
    `, ['Admin User', 'admin@test.com', hashedPassword, 'admin', true]);
    console.log('✅ Admin: admin@test.com / Password123');

    // Create instructor user
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, email_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $3, email_verified = true
    `, ['Jane Instructor', 'instructor@test.com', hashedPassword, 'instructor', true]);
    console.log('✅ Instructor: instructor@test.com / Password123');

    // Create student user
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, email_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $3, email_verified = true
    `, ['John Student', 'student@test.com', hashedPassword, 'student', true]);
    console.log('✅ Student: student@test.com / Password123');

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📝 Login at: http://localhost:3001/login');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating test users:', err.message);
    process.exit(1);
  }
}

createTestUsers();
