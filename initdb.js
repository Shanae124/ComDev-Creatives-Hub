const pool = require("./db");
 
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      avatar_url TEXT,
      bio TEXT,
      email_verified BOOLEAN DEFAULT FALSE,
      verification_token TEXT,
      verification_token_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
 
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      content_html TEXT DEFAULT '',
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'draft',
      thumbnail_url TEXT,
      enrollment_capacity INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);

    -- Drop instructor_id constraint if it exists (from old schema)
    ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_instructor_id_fkey;
    ALTER TABLE courses DROP COLUMN IF EXISTS instructor_id;
 
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'active',
      role TEXT NOT NULL DEFAULT 'student',
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, course_id)
    );

    CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
 
    CREATE TABLE IF NOT EXISTS modules (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
 
    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content_html TEXT DEFAULT '',
      lesson_type TEXT NOT NULL DEFAULT 'reading',
      sort_order INTEGER NOT NULL DEFAULT 1,
      duration_minutes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
 
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'not_started',
      progress_percent INTEGER NOT NULL DEFAULT 0,
      time_spent_seconds INTEGER DEFAULT 0,
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, lesson_id)
    );

    CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
    CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);

    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description_html TEXT DEFAULT '',
      due_date TIMESTAMP,
      points_possible INTEGER NOT NULL DEFAULT 100,
      submission_type TEXT NOT NULL DEFAULT 'text',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_html TEXT,
      file_url TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (assignment_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

    CREATE TABLE IF NOT EXISTS grades (
      id SERIAL PRIMARY KEY,
      submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      points_earned DECIMAL(10, 2),
      feedback_html TEXT,
      graded_by INTEGER REFERENCES users(id),
      graded_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (assignment_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_grades_user_id ON grades(user_id);
    CREATE INDEX IF NOT EXISTS idx_grades_course_id ON grades(course_id);
    CREATE INDEX IF NOT EXISTS idx_grades_assignment_id ON grades(assignment_id);

    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      created_by INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_announcements_course_id ON announcements(course_id);

    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL UNIQUE,
      file_size INTEGER,
      mime_type TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_files_course_id ON files(course_id);
    CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      changes JSONB,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

    CREATE TABLE IF NOT EXISTS labs (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      lab_type TEXT DEFAULT 'interactive',
      html_content TEXT,
      status TEXT DEFAULT 'draft',
      difficulty TEXT DEFAULT 'intermediate',
      estimated_time INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_labs_course_id ON labs(course_id);
    CREATE INDEX IF NOT EXISTS idx_labs_module_id ON labs(module_id);
    CREATE INDEX IF NOT EXISTS idx_labs_status ON labs(status);

    CREATE TABLE IF NOT EXISTS lab_attempts (
      id SERIAL PRIMARY KEY,
      lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      attempt_number INTEGER DEFAULT 1,
      score INTEGER,
      status TEXT DEFAULT 'in_progress',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      time_spent_seconds INTEGER DEFAULT 0,
      notes TEXT,
      UNIQUE (lab_id, user_id, attempt_number)
    );

    CREATE INDEX IF NOT EXISTS idx_lab_attempts_lab_id ON lab_attempts(lab_id);
    CREATE INDEX IF NOT EXISTS idx_lab_attempts_user_id ON lab_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_lab_attempts_status ON lab_attempts(status);

    CREATE TABLE IF NOT EXISTS system_settings (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
  `);
 
  console.log("✅ Database schema updated successfully");
  process.exit();
}
 
init().catch(err => {
  console.error("❌ Database initialization failed:", err);
  process.exit(1);
});