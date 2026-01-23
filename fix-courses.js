const pool = require('./db');

async function fixCourses() {
  try {
    console.log('🔧 Fixing courses table...');
    
    // Remove the problematic constraint
    await pool.query(`
      ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_instructor_id_fkey;
    `);
    console.log('✓ Dropped instructor_id constraint');
    
    // Drop the column if it exists
    await pool.query(`
      ALTER TABLE courses DROP COLUMN IF EXISTS instructor_id;
    `);
    console.log('✓ Dropped instructor_id column');
    
    // Verify all courses have created_by set
    const nullCheck = await pool.query(`
      SELECT COUNT(*) as count FROM courses WHERE created_by IS NULL;
    `);
    
    if (nullCheck.rows[0].count > 0) {
      console.warn(`⚠️  Found ${nullCheck.rows[0].count} courses with NULL created_by`);
      // This shouldn't happen, but if it does we need admin intervention
    }
    
    console.log('✅ Courses table fixed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing courses:', err.message);
    process.exit(1);
  }
}

fixCourses();
