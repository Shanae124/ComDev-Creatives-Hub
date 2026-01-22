const fs = require('fs');
const path = require('path');
const pool = require('../db');
const { sanitizeHTML } = require('../security');

const COURSE_TITLE = 'Technical Communication Skills';
const COURSE_DESCRIPTION = 'Master the art of translating technical complexity into clear, actionable communication for stakeholders.';

async function getInstructorId() {
  const { rows } = await pool.query(
    `SELECT id
     FROM users
     WHERE role IN ('instructor', 'admin')
     ORDER BY CASE WHEN role = 'instructor' THEN 0 ELSE 1 END, id ASC
     LIMIT 1`
  );

  if (!rows.length) {
    throw new Error('No instructor/admin user found. Create one before adding the course.');
  }

  return rows[0].id;
}

async function upsertCourse() {
  const instructorId = await getInstructorId();
  const htmlPath = path.join(__dirname, '..', 'course-content', 'technical-communication-skills.html');
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const cleanedHtml = sanitizeHTML(rawHtml);

  const existing = await pool.query('SELECT id FROM courses WHERE title = $1 LIMIT 1', [COURSE_TITLE]);

  if (existing.rowCount) {
    const result = await pool.query(
      `UPDATE courses
         SET description = $2,
             content_html = $3,
             status = 'published',
             instructor_id = $4,
             created_by = COALESCE(created_by, $4),
             updated_at = NOW()
       WHERE title = $1
       RETURNING id`,
      [COURSE_TITLE, COURSE_DESCRIPTION, cleanedHtml, instructorId]
    );
    console.log(`Updated existing course '${COURSE_TITLE}' (id: ${result.rows[0].id}).`);
    return result.rows[0].id;
  }

  const insert = await pool.query(
    `INSERT INTO courses (title, description, content_html, created_by, instructor_id, status)
     VALUES ($1, $2, $3, $4, $4, 'published')
     RETURNING id` ,
    [COURSE_TITLE, COURSE_DESCRIPTION, cleanedHtml, instructorId]
  );
  console.log(`Created course '${COURSE_TITLE}' (id: ${insert.rows[0].id}).`);
  return insert.rows[0].id;
}

async function main() {
  try {
    const courseId = await upsertCourse();
    console.log(`Course ready to view at /courses/${courseId}.`);
  } catch (err) {
    console.error('Failed to add course:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
