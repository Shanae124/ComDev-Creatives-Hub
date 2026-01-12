const pool = require('./db');

async function seedCourses() {
  try {
    console.log('🌱 Seeding courses, modules, and lessons...\n');

    // Check if courses already exist
    const existingCourses = await pool.query('SELECT COUNT(*) FROM courses');
    if (existingCourses.rows[0].count > 0) {
      console.log('✅ Courses already exist in database.');
      process.exit(0);
    }

    // Create test users first (if they don't exist)
    const instructorResult = await pool.query(`
      INSERT INTO users (name, email, password, role, email_verified)
      VALUES ('Ms. Johnson', 'instructor@example.com', 'hashed', 'instructor', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);

    const studentResult = await pool.query(`
      INSERT INTO users (name, email, password, role, email_verified)
      VALUES ('Alice Student', 'student@example.com', 'hashed', 'student', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);

    const adminResult = await pool.query(`
      INSERT INTO users (name, email, password, role, email_verified)
      VALUES ('Admin User', 'admin@example.com', 'hashed', 'admin', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);

    // Get instructor ID
    const instructorCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['instructor@example.com']
    );
    const instructorId = instructorCheck.rows[0].id;

    const studentCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['student@example.com']
    );
    const studentId = studentCheck.rows[0].id;

    // Create sample courses
    const courses = [
      {
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of HTML, CSS, and JavaScript',
        created_by: instructorId,
        status: 'published'
      },
      {
        title: 'Advanced JavaScript Concepts',
        description: 'Master async/await, closures, and design patterns',
        created_by: instructorId,
        status: 'published'
      },
      {
        title: 'React.js for Beginners',
        description: 'Build interactive UIs with React components and hooks',
        created_by: instructorId,
        status: 'published'
      },
      {
        title: 'Database Design & SQL',
        description: 'Learn relational databases and write complex queries',
        created_by: instructorId,
        status: 'published'
      },
      {
        title: 'Introduction to Python',
        description: 'Start your programming journey with Python basics',
        created_by: instructorId,
        status: 'published'
      }
    ];

    let courseIds = [];
    for (const course of courses) {
      const result = await pool.query(
        `INSERT INTO courses (title, description, created_by, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [course.title, course.description, course.created_by, course.status]
      );
      courseIds.push(result.rows[0].id);
      console.log(`✅ Created course: ${course.title}`);
    }

    // Create modules for first course (Web Development)
    const modules = [
      {
        courseId: courseIds[0],
        title: 'HTML Basics',
        description: 'Introduction to HTML structure and semantics'
      },
      {
        courseId: courseIds[0],
        title: 'CSS Styling',
        description: 'Master CSS for beautiful layouts and designs'
      },
      {
        courseId: courseIds[0],
        title: 'JavaScript Introduction',
        description: 'Learn JavaScript fundamentals'
      }
    ];

    let moduleIds = [];
    for (const module of modules) {
      const result = await pool.query(
        `INSERT INTO modules (course_id, title, description)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [module.courseId, module.title, module.description]
      );
      moduleIds.push(result.rows[0].id);
      console.log(`  📚 Created module: ${module.title}`);
    }

    // Create lessons for first module
    const lessons = [
      {
        moduleId: moduleIds[0],
        title: 'What is HTML?',
        content: '<h2>Understanding HTML</h2><p>HTML is the standard markup language for web pages.</p>'
      },
      {
        moduleId: moduleIds[0],
        title: 'HTML Tags and Elements',
        content: '<h2>Common HTML Tags</h2><p>Learn about div, p, h1-h6, a, img, and more.</p>'
      },
      {
        moduleId: moduleIds[0],
        title: 'Forms and Input Elements',
        content: '<h2>Web Forms</h2><p>Create interactive forms to collect user input.</p>'
      }
    ];

    for (const lesson of lessons) {
      await pool.query(
        `INSERT INTO lessons (module_id, title, content_html, lesson_type)
         VALUES ($1, $2, $3, $4)`,
        [lesson.moduleId, lesson.title, lesson.content, 'reading']
      );
      console.log(`    📖 Created lesson: ${lesson.title}`);
    }

    // Enroll student in first course
    await pool.query(
      `INSERT INTO enrollments (user_id, course_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, course_id) DO UPDATE SET status = 'active'`,
      [studentId, courseIds[0], 'active']
    );
    console.log(`\n✅ Enrolled student in: ${courses[0].title}`);

    console.log('\n✨ Database seeded successfully!\n');
    console.log('Test accounts created:');
    console.log('  📧 Instructor: instructor@example.com');
    console.log('  📧 Student: student@example.com');
    console.log('  📧 Admin: admin@example.com');
    console.log('\nYou can now see courses in the dashboard!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedCourses();
