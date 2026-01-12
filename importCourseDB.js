/**
 * Direct DB import - bypasses HTTP API to insert course data directly
 */
const pool = require('./db');
const BrightspaceMigrator = require('./brightspaceMigrator');

async function importDirectly(imsccPath) {
  if (!imsccPath) {
    console.error('Usage: node importCourseDB.js <path-to-imscc>');
    process.exit(1);
  }

  try {
    console.log('📦 Starting direct DB import...');
    const migrator = new BrightspaceMigrator(imsccPath);
    const data = await migrator.migrate();

    // 1) Create course directly
    const coursePayload = data.course || { title: 'Imported Course', description: '' };
    const courseRes = await pool.query(
      "INSERT INTO courses (title, description, content_html, created_by, status) VALUES ($1,$2,$3,$4,'published') RETURNING *",
      [coursePayload.title, coursePayload.description || '', coursePayload.content_html || '', 1]
    );
    const createdCourse = courseRes.rows[0];
    console.log('✅ Created course:', createdCourse.id, '-', createdCourse.title);

    // 2) Create modules
    const moduleMap = [];
    for (const [i, mod] of (data.modules || []).entries()) {
      const modRes = await pool.query(
        "INSERT INTO modules (course_id, title, description, sort_order) VALUES ($1,$2,$3,$4) RETURNING *",
        [createdCourse.id, mod.title || `Module ${i + 1}`, mod.description || '', mod.sort_order || i + 1]
      );
      moduleMap.push(modRes.rows[0].id);
      console.log('  ✓ Module:', modRes.rows[0].title || modRes.rows[0].id);
    }

    // 3) Create lessons
    let lessonCount = 0;
    for (const [i, lesson] of (data.lessons || []).entries()) {
      const module_id = moduleMap[i] || moduleMap[0] || null;
      if (!module_id) continue;
      await pool.query(
        "INSERT INTO lessons (module_id, title, content_html, lesson_type, sort_order, duration_minutes) VALUES ($1,$2,$3,$4,$5,$6)",
        [module_id, lesson.title || `Lesson ${i + 1}`, lesson.content_html || '', lesson.lesson_type || 'reading', lesson.sort_order || i + 1, lesson.duration_minutes || 0]
      );
      lessonCount++;
      console.log('    ✓ Lesson:', lesson.title || `Lesson ${i + 1}`);
    }

    console.log('\n✅ Import complete!');
    console.log(`📊 Summary:`);
    console.log(`   Course: ${createdCourse.title} (ID: ${createdCourse.id})`);
    console.log(`   Modules: ${moduleMap.length}`);
    console.log(`   Lessons: ${lessonCount}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  const imscc = process.argv[2];
  importDirectly(imscc);
}

module.exports = importDirectly;
