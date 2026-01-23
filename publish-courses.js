const pool = require('./db');

async function publishCourses() {
  try {
    console.log('🌐 Publishing all courses...');

    // Ensure instructor_id populated
    await pool.query(`
      UPDATE courses
      SET instructor_id = created_by
      WHERE instructor_id IS NULL
    `);

    const result = await pool.query(`
      UPDATE courses
      SET status = 'published'
      WHERE status != 'published'
      RETURNING id, title, status
    `);

    if (result.rows.length === 0) {
      console.log('No courses needed publishing.');
    } else {
      console.log('Published courses:');
      result.rows.forEach(r => console.log(`  ✓ [${r.id}] ${r.title} -> ${r.status}`));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

publishCourses();
