// Database schema initialization for new LMS features
// Run with: node scripts/init-lms-schema.js

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'protexa_learn',
});

async function initializeSchema() {
  try {
    console.log('Initializing LMS schema...');

    // Create pages table for page builder
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        html_content TEXT,
        css_content TEXT,
        js_content TEXT,
        status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        UNIQUE(course_id, title)
      );
    `);
    console.log('✓ Pages table created');

    // Create quizzes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        time_limit INTEGER DEFAULT 30, -- in minutes
        max_attempts INTEGER DEFAULT -1, -- -1 = unlimited
        shuffle_questions BOOLEAN DEFAULT FALSE,
        show_correct_answers BOOLEAN DEFAULT TRUE,
        show_correct_after_submission BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'draft', -- draft, published
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        UNIQUE(course_id, title)
      );
    `);
    console.log('✓ Quizzes table created');

    // Create quiz questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'multiple_choice', -- multiple_choice, true_false, essay, short_answer
        points INTEGER DEFAULT 1,
        order_index INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Quiz questions table created');

    // Create quiz answer options
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_answer_options (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
        option_text TEXT,
        is_correct BOOLEAN DEFAULT FALSE,
        order_index INTEGER,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Quiz answer options table created');

    // Create quiz attempts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
        student_id INTEGER NOT NULL REFERENCES users(id),
        score DECIMAL(5,2),
        max_score DECIMAL(5,2),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        time_spent_minutes INTEGER,
        attempt_number INTEGER DEFAULT 1,
        attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(quiz_id, student_id, attempt_number)
      );
    `);
    console.log('✓ Quiz attempts table created');

    // Create quiz responses
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id SERIAL PRIMARY KEY,
        attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES quiz_questions(id),
        answer_option_id INTEGER REFERENCES quiz_answer_options(id),
        answer_text TEXT,
        points_awarded DECIMAL(5,2),
        is_correct BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Quiz responses table created');

    // Create assignments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        max_points INTEGER DEFAULT 100,
        assignment_type VARCHAR(50) DEFAULT 'assignment', -- assignment, quiz, exam, project
        created_by INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'active', -- active, archived, draft
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, title)
      );
    `);
    console.log('✓ Assignments table created');

    // Create assignment submissions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        student_id INTEGER NOT NULL REFERENCES users(id),
        submission_url TEXT,
        submission_text TEXT,
        file_path VARCHAR(500),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        grade DECIMAL(5,2),
        feedback TEXT,
        graded_by INTEGER REFERENCES users(id),
        graded_at TIMESTAMP,
        UNIQUE(assignment_id, student_id)
      );
    `);
    console.log('✓ Assignment submissions table created');

    // Create assignment grades (aggregated)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignment_grades (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id),
        assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        grade DECIMAL(5,2) NOT NULL,
        graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, assignment_id)
      );
    `);
    console.log('✓ Assignment grades table created');

    // Create exams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        exam_date TIMESTAMP,
        duration_minutes INTEGER DEFAULT 120,
        max_points INTEGER DEFAULT 100,
        exam_type VARCHAR(50) DEFAULT 'midterm', -- midterm, final, makeup
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, title)
      );
    `);
    console.log('✓ Exams table created');

    // Create exam grades
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_grades (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id),
        exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
        grade DECIMAL(5,2) NOT NULL,
        graded_by INTEGER REFERENCES users(id),
        graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, exam_id)
      );
    `);
    console.log('✓ Exam grades table created');

    // Create gradebook configuration
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gradebook_config (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        assignment_weight DECIMAL(3,2) DEFAULT 0.40,
        quiz_weight DECIMAL(3,2) DEFAULT 0.30,
        exam_weight DECIMAL(3,2) DEFAULT 0.30,
        participation_weight DECIMAL(3,2) DEFAULT 0,
        grading_scale VARCHAR(500) DEFAULT 'A:90,B:80,C:70,D:60,F:0',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id)
      );
    `);
    console.log('✓ Gradebook config table created');

    // Create plugins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plugins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        version VARCHAR(20),
        author VARCHAR(255),
        author_url VARCHAR(500),
        plugin_url VARCHAR(500),
        icon_url VARCHAR(500),
        rating DECIMAL(2,1) DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        is_installed BOOLEAN DEFAULT FALSE,
        is_enabled BOOLEAN DEFAULT FALSE,
        is_beta BOOLEAN DEFAULT FALSE,
        category VARCHAR(100),
        price VARCHAR(50) DEFAULT 'free',
        settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Plugins table created');

    // Create plugin installations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plugin_installations (
        id SERIAL PRIMARY KEY,
        plugin_id INTEGER NOT NULL REFERENCES plugins(id),
        installed_by INTEGER NOT NULL REFERENCES users(id),
        installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        enabled_at TIMESTAMP,
        disabled_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        settings JSONB,
        UNIQUE(plugin_id)
      );
    `);
    console.log('✓ Plugin installations table created');

    // Create impersonation log
    await pool.query(`
      CREATE TABLE IF NOT EXISTS impersonation_log (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        impersonated_user_id INTEGER NOT NULL REFERENCES users(id),
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        actions_taken TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Impersonation log table created');

    // Create settings table for user preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(50) DEFAULT 'auto', -- light, dark, auto
        font_size VARCHAR(50) DEFAULT 'medium', -- small, medium, large
        notifications_enabled BOOLEAN DEFAULT TRUE,
        email_digest_frequency VARCHAR(50) DEFAULT 'daily', -- daily, weekly, none
        high_contrast BOOLEAN DEFAULT FALSE,
        reduce_motion BOOLEAN DEFAULT FALSE,
        profile_visibility VARCHAR(50) DEFAULT 'public', -- public, private, instructors_only
        allow_messages BOOLEAN DEFAULT TRUE,
        show_email BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ User settings table created');

    // Create activity log
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action_type VARCHAR(100), -- create, update, delete, login, view, etc
        entity_type VARCHAR(100), -- course, assignment, quiz, page, etc
        entity_id INTEGER,
        description TEXT,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at);
      CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);
    `);
    console.log('✓ Activity log table created');

    // Insert sample plugins
    await pool.query(`
      INSERT INTO plugins (name, slug, description, version, author, rating, downloads, category, price)
      VALUES 
        ('Advanced Quiz Analytics', 'advanced-quiz-analytics', 'Detailed analytics and reporting for quiz performance', '2.1.0', 'ProtexxaLearn Team', 4.8, 5200, 'Assessment', 'free'),
        ('Plagiarism Detector', 'plagiarism-detector', 'Detect plagiarism in student submissions', '1.5.0', 'External Developer', 4.5, 3100, 'Academic Integrity', 'free'),
        ('Video Conference Integration', 'video-conference-integration', 'Integrate Zoom, Google Meet, and WebEx', '3.0.0', 'ProtexxaLearn Team', 4.7, 4500, 'Communication', 'free'),
        ('Email Notifications Pro', 'email-notifications-pro', 'Advanced email notification system with templates', '1.0.0', 'ProtexxaLearn Team', 4.9, 6800, 'Communication', 'free'),
        ('Discussion Forum Plus', 'discussion-forum-plus', 'Enhanced discussion forum with moderation tools', '2.2.0', 'Community Developer', 4.6, 2900, 'Communication', '$29/year'),
        ('Certificate Generator', 'certificate-generator', 'Create and issue digital certificates', '1.8.0', 'ProtexxaLearn Team', 4.4, 1800, 'Assessment', 'free')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✓ Sample plugins inserted');

    console.log('✓ LMS schema initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing schema:', error);
    process.exit(1);
  }
}

initializeSchema();
