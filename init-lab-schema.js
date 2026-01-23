#!/usr/bin/env node

/**
 * Initialize lab schema on Railway database
 */

const pool = require('./db');
const fs = require('fs');

async function initLabSchema() {
  try {
    console.log('🔧 Initializing lab schema on Railway...\n');

    // Read SQL file
    const sqlFile = __dirname + '/initdb-labs.sql';
    if (!fs.existsSync(sqlFile)) {
      console.error('❌ SQL file not found:', sqlFile);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlFile, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (!statement.trim()) continue;
      try {
        await pool.query(statement);
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists')) {
          console.error('Query error:', err.message);
          throw err;
        }
      }
    }

    console.log('✅ Lab schema initialized successfully!\n');

    // Verify tables
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'lab%'
      ORDER BY table_name
    `);

    console.log('Created lab tables:');
    result.rows.forEach(r => console.log('  ✓ ' + r.table_name));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

initLabSchema();
