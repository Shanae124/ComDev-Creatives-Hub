const pool = require('./db');

async function checkDatabase() {
  try {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Database tables:');
    result.rows.forEach(r => console.log('  ✓ ' + r.table_name));
    
    // Check if labs table exists
    const labsCheck = result.rows.find(r => r.table_name === 'labs');
    console.log(labsCheck ? '\n✅ Labs table exists' : '\n⚠️  Labs table NOT found');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDatabase();
