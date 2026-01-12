const pool = require("./db");

/**
 * Seed database with test data for development
 */
async function seedDatabase() {
  console.log("🌱 Seeding database with test data...\n");

  try {
    // Create test users
    console.log("👥 Creating test users...");
    const users = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "$2b$10$YourHashedPasswordHere", // bcrypt hash
        role: "admin",
      },
      {
        name: "Jane Instructor",
        email: "jane@example.com",
        password: "$2b$10$YourHashedPasswordHere",
        role: "instructor",
      },
      {
        name: "John Student",
        email: "john@example.com",
        password: "$2b$10$YourHashedPasswordHere",
        role: "student",
      },
      {
        name: "Mary Student",
        email: "mary@example.com",
        password: "$2b$10$YourHashedPasswordHere",
        role: "student",
      },
    ];

    for (const user of users) {
      await pool.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING",
        [user.name, user.email, user.password, user.role]
      );
    }

    // Get user IDs
    const adminRes = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["admin@example.com"]
    );
    const instructorRes = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["jane@example.com"]
    );
    const admin_id = adminRes.rows[0]?.id;
    const instructor_id = instructorRes.rows[0]?.id;

    // Create test courses
    console.log("📚 Creating test courses...");
    const courses = [
      {
        title: "Introduction to Python",
        description: "Learn Python basics from scratch",
        created_by: instructor_id,
        content_html:
          "<h2>Welcome to Python 101</h2><p>This course will teach you the fundamentals of Python programming.</p>",
      },
      {
        title: "Web Development with React",
        description: "Build modern web applications with React",
        created_by: instructor_id,
        content_html:
          "<h2>React Fundamentals</h2><p>Master the React framework and build interactive UIs.</p>",
      },
      {
        title: "Database Design",
        description: "Learn relational database design and SQL",
        created_by: instructor_id,
        content_html:
          "<h2>Database Essentials</h2><p>Understand normalization, keys, and query optimization.</p>",
      },
    ];

    const courseIds = [];
    for (const course of courses) {
      const res = await pool.query(
        "INSERT INTO courses (title, description, content_html, created_by, status) VALUES ($1, $2, $3, $4, 'published') RETURNING id",
        [course.title, course.description, course.content_html, course.created_by]
      );
      courseIds.push(res.rows[0].id);
    }

    // Create modules
    console.log("📋 Creating modules...");
    const modules = [
      {
        course_id: courseIds[0],
        title: "Basics",
        description: "Python fundamentals",
      },
      {
        course_id: courseIds[0],
        title: "Data Structures",
        description: "Lists, tuples, dictionaries",
      },
      {
        course_id: courseIds[1],
        title: "Components",
        description: "React components",
      },
      {
        course_id: courseIds[2],
        title: "Design Principles",
        description: "Database design patterns",
      },
    ];

    const moduleIds = [];
    for (const module of modules) {
      const res = await pool.query(
        "INSERT INTO modules (course_id, title, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING id",
        [module.course_id, module.title, module.description, 1]
      );
      moduleIds.push(res.rows[0].id);
    }

    // Create lessons
    console.log("📖 Creating lessons...");
    const lessons = [
      {
        module_id: moduleIds[0],
        title: "Variables and Data Types",
        content_html:
          "<p>Learn about Python variables, integers, strings, and floats.</p>",
        duration_minutes: 30,
      },
      {
        module_id: moduleIds[0],
        title: "Control Flow",
        content_html:
          "<p>Master if statements, loops, and boolean logic.</p>",
        duration_minutes: 45,
      },
      {
        module_id: moduleIds[1],
        title: "Lists and Tuples",
        content_html: "<p>Work with collections in Python.</p>",
        duration_minutes: 40,
      },
      {
        module_id: moduleIds[2],
        title: "JSX Syntax",
        content_html: "<p>Understanding JSX and component rendering.</p>",
        duration_minutes: 35,
      },
      {
        module_id: moduleIds[3],
        title: "Normalization",
        content_html:
          "<p>Normal forms (1NF, 2NF, 3NF) explained with examples.</p>",
        duration_minutes: 50,
      },
    ];

    for (const lesson of lessons) {
      await pool.query(
        "INSERT INTO lessons (module_id, title, content_html, lesson_type, sort_order, duration_minutes) VALUES ($1, $2, $3, $4, 1, $5)",
        [
          lesson.module_id,
          lesson.title,
          lesson.content_html,
          "reading",
          lesson.duration_minutes,
        ]
      );
    }

    // Create assignments
    console.log("📝 Creating assignments...");
    const assignments = [
      {
        course_id: courseIds[0],
        title: "Python Quiz 1",
        description_html: "<p>Test your knowledge of Python basics.</p>",
        points_possible: 50,
        due_date: "2024-02-15",
      },
      {
        course_id: courseIds[1],
        title: "React Todo App",
        description_html: "<p>Build a todo application using React.</p>",
        points_possible: 100,
        due_date: "2024-03-01",
      },
    ];

    for (const assignment of assignments) {
      await pool.query(
        "INSERT INTO assignments (course_id, title, description_html, due_date, points_possible, submission_type) VALUES ($1, $2, $3, $4, $5, 'text')",
        [
          assignment.course_id,
          assignment.title,
          assignment.description_html,
          assignment.due_date,
          assignment.points_possible,
        ]
      );
    }

    // Create announcements
    console.log("📢 Creating announcements...");
    await pool.query(
      "INSERT INTO announcements (course_id, created_by, title, content_html) VALUES ($1, $2, $3, $4)",
      [
        courseIds[0],
        instructor_id,
        "Welcome to Python 101!",
        "<p>Welcome everyone! This course will be fun and challenging. Let's learn Python together!</p>",
      ]
    );

    console.log("\n✅ Database seeding completed successfully!\n");
    console.log("Test users created:");
    console.log("  📧 admin@example.com (admin)");
    console.log("  📧 jane@example.com (instructor)");
    console.log("  📧 john@example.com (student)");
    console.log("  📧 mary@example.com (student)");
    console.log(`\nCreated: ${courseIds.length} courses, ${moduleIds.length} modules, ${lessons.length} lessons`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
