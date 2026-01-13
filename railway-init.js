#!/usr/bin/env node
/**
 * One-shot Railway Deployment Initializer
 * Connects to Railway Postgres and sets up everything
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = "postgresql://postgres:zDgEvcYUlLTuYaHIeOnUVrpcBuRuVXdW@switchyard.proxy.rlwy.net:45083/railway";

console.log('\n🚀 ProtexxaLearn Railway Initialization\n');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initializeRailway() {
  try {
    console.log('1️⃣ Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Connected to Railway Postgres\n');
    client.release();
    
    // Read and execute initdb.js
    console.log('2️⃣ Executing schema initialization...');
    const initdbPath = path.join(__dirname, 'initdb.js');
    const initdbCode = fs.readFileSync(initdbPath, 'utf8');
    
    // Extract the pool creation and replace with our pool
    const schemaQueries = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        verification_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_num INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        lesson_type VARCHAR(50) DEFAULT 'reading',
        order_num INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
      CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
      CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
      CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
    `;

    const queries = schemaQueries.split(';').filter(q => q.trim());
    for (const query of queries) {
      if (query.trim()) {
        await pool.query(query);
      }
    }
    console.log('✅ Schema created successfully\n');

    // Create test users
    console.log('3️⃣ Creating test users...');
    const bcrypt = require('bcryptjs');
    const testUsers = [
      { email: 'admin@test.com', name: 'Admin User', role: 'admin', password: 'Password123' },
      { email: 'instructor@test.com', name: 'Instructor User', role: 'instructor', password: 'Password123' },
      { email: 'student@test.com', name: 'Student User', role: 'student', password: 'Password123' }
    ];

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      try {
        await pool.query(
          'INSERT INTO users (email, password, name, role, is_verified) VALUES ($1, $2, $3, $4, true)',
          [user.email, hashedPassword, user.name, user.role]
        );
        console.log(`  ✓ Created ${user.email}`);
      } catch (err) {
        if (err.code === '23505') { // Unique constraint
          console.log(`  ~ ${user.email} already exists`);
        } else {
          throw err;
        }
      }
    }
    console.log('✅ Test users ready\n');

    console.log('🎉 Railway initialization complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. Go to: https://railway.app/project/d80e12d6-a675-4152-8e2a-e282c32e4712');
    console.log('   2. Click Postgres → Variables → Copy DATABASE_URL');
    console.log('   3. Click protexxalearn → Variables → Add DATABASE_URL');
    console.log('   4. Save (auto-redeploy will start)');
    console.log('   5. Test: https://protexxalearn.up.railway.app/login');
    console.log('   6. Use: admin@test.com / Password123\n');

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

initializeRailway();
