const BrightspaceMigrator = require('./brightspaceMigrator');
const fetch = global.fetch || require('node-fetch');
const path = require('path');

async function run(imsccPath) {
  if (!imsccPath) {
    console.error('Usage: node importCourse.js <path-to-imscc>');
    process.exit(1);
  }

  const migrator = new BrightspaceMigrator(imsccPath);
  try {
    const data = await migrator.migrate();

    // Use backend API to create admin user, login, and create course
    const apiBase = process.env.API_BASE || 'http://localhost:3000';

    // 1) Register admin user (idempotent)
    const admin = { name: 'importer-admin', email: 'importer@local', password: 'Import3rPass!', role: 'admin' };
    try {
      const regRes = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin),
      });
      const regText = await regRes.text();
      console.log('Register response status=', regRes.status);
      console.log('Register response body=', regText);
      if (!regRes.ok) {
        console.warn('Register returned non-OK status');
      } else {
        console.log('Admin user created (or already exists)');
      }
    } catch (err) {
      console.warn('Could not create admin via API:', err.message);
      console.error('Full error:', err);
    }

    // 2) Login to get token
    console.log('Attempting login with email:', admin.email);
    let loginRes;
    try {
      loginRes = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: admin.email, password: admin.password }),
      });
    } catch (err) {
      console.error('Login fetch failed:', err.message);
      throw err;
    }

    const loginText = await loginRes.text();
    console.log('Login response status=', loginRes.status);
    console.log('Login response body=', loginText);

    if (!loginRes.ok) {
      throw new Error('Login failed with status ' + loginRes.status + ': ' + loginText);
    }

    let loginJson;
    try {
      loginJson = JSON.parse(loginText);
    } catch (err) {
      throw new Error('Failed to parse login response as JSON: ' + loginText);
    }

    const token = loginJson.token;
    if (!token) {
      throw new Error('No token in login response');
    }

    console.log('Obtained admin token');

    // 3) Create course
    const coursePayload = data.course || { title: 'Imported Course', description: '' };
    const createCourseRes = await fetch(`${apiBase}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(coursePayload),
    });

    if (!createCourseRes.ok) {
      console.error('Failed to create course:', await createCourseRes.text());
      process.exit(1);
    }

    const createdCourse = await createCourseRes.json();
    console.log('Created course id=', createdCourse.id, 'title=', createdCourse.title);

    // 4) Create modules and lessons
    const moduleMap = [];
    for (const [i, mod] of (data.modules || []).entries()) {
      const modRes = await fetch(`${apiBase}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ course_id: createdCourse.id, title: mod.title, description: mod.description || '', sort_order: mod.sort_order || i + 1 }),
      });
      const modJson = await modRes.json();
      moduleMap.push(modJson.id);
      console.log('  -> Created module:', modJson.title || modJson.id);
    }

    // If migrated lessons are present, attach them to first module
    for (const [i, lesson] of (data.lessons || []).entries()) {
      const module_id = moduleMap[i] || moduleMap[0] || null;
      const lessonPayload = {
        module_id: module_id,
        title: lesson.title,
        content_html: lesson.content_html || '',
        lesson_type: lesson.lesson_type || 'reading',
        sort_order: i + 1,
        duration_minutes: lesson.duration_minutes || 0,
      };

      if (!lessonPayload.module_id) continue;

      const lessonRes = await fetch(`${apiBase}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(lessonPayload),
      });

      const lessonJson = await lessonRes.json();
      console.log('  -> Created lesson:', lessonJson.title || lessonJson.id);
    }

    console.log('\nImport finished. Verify in the web UI.');
  } catch (err) {
    console.error('Import failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  const imscc = process.argv[2];
  run(imscc).then(() => {
    console.log('✅ All done!');
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
