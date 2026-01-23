const pool = require('./db');

async function enroll(userId, courseId){
  try{
    const res = await pool.query(`
      INSERT INTO enrollments (user_id, course_id, status)
      VALUES ($1,$2,'active')
      ON CONFLICT (user_id, course_id) DO UPDATE SET status='active', updated_at=NOW()
      RETURNING *
    `,[userId,courseId]);
    console.log('Enrolled:', res.rows[0]);
    process.exit(0);
  }catch(err){
    console.error('Enroll error:', err.message);
    process.exit(1);
  }
}

const userId = Number(process.argv[2] || 5); // default student@test.com
const courseId = Number(process.argv[3] || 1); // default DTS course

console.log(`Enrolling user ${userId} in course ${courseId}...`);
enroll(userId, courseId);
