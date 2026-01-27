// Database Migration - Phase 2 Enterprise LMS Tables
const pool = require('./db'); // Use existing DB configuration

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting Phase 2 database migration...\n');

    // ========== ORGANIZATIONS & MULTI-TENANCY ==========
    console.log('📦 Creating organizations tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        domain VARCHAR(255) UNIQUE,
        subdomain VARCHAR(100) UNIQUE,
        settings JSONB DEFAULT '{}',
        branding JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'active',
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_org_slug ON organizations(slug);
      CREATE INDEX IF NOT EXISTS idx_org_domain ON organizations(domain);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_roles (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        description TEXT,
        permissions JSONB DEFAULT '[]',
        is_system_role BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(org_id, name)
      );

      CREATE INDEX IF NOT EXISTS idx_org_roles ON organization_roles(org_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_users (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_name VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(org_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_org_users ON organization_users(org_id, user_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_cohorts (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cohort_members (
        id SERIAL PRIMARY KEY,
        cohort_id INTEGER REFERENCES organization_cohorts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(cohort_id, user_id)
      );
    `);

    // ========== SCORM PACKAGES ==========
    console.log('📚 Creating SCORM tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS scorm_packages (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        org_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        version VARCHAR(50),
        scorm_version VARCHAR(20),
        package_path VARCHAR(500),
        extract_path VARCHAR(500),
        manifest_data JSONB,
        uploaded_by INTEGER REFERENCES users(id),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_scorm_course ON scorm_packages(course_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS scorm_scos (
        id SERIAL PRIMARY KEY,
        package_id INTEGER REFERENCES scorm_packages(id) ON DELETE CASCADE,
        identifier VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        launch_url VARCHAR(500),
        resource_type VARCHAR(100),
        prerequisites VARCHAR(255),
        max_time_allowed VARCHAR(50),
        time_limit_action VARCHAR(50),
        sort_order INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_sco_package ON scorm_scos(package_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS scorm_data (
        id SERIAL PRIMARY KEY,
        package_id INTEGER REFERENCES scorm_packages(id) ON DELETE CASCADE,
        sco_id INTEGER REFERENCES scorm_scos(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        data_key VARCHAR(255),
        data_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(package_id, sco_id, user_id, data_key)
      );

      CREATE INDEX IF NOT EXISTS idx_scorm_data ON scorm_data(package_id, user_id);
    `);

    // ========== xAPI / TIN CAN ==========
    console.log('📊 Creating xAPI tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS xapi_statements (
        id UUID PRIMARY KEY,
        actor JSONB NOT NULL,
        verb JSONB NOT NULL,
        object JSONB NOT NULL,
        result JSONB,
        context JSONB,
        timestamp TIMESTAMP NOT NULL,
        stored TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        authority JSONB,
        version VARCHAR(20) DEFAULT '1.0.3',
        attachments JSONB
      );

      CREATE INDEX IF NOT EXISTS idx_xapi_actor ON xapi_statements((actor->>'mbox'));
      CREATE INDEX IF NOT EXISTS idx_xapi_verb ON xapi_statements((verb->>'id'));
      CREATE INDEX IF NOT EXISTS idx_xapi_timestamp ON xapi_statements(timestamp);
    `);

    // ========== PROGRAMS & LEARNING PATHS ==========
    console.log('🎯 Creating programs tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_program_org ON programs(org_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS program_courses (
        id SERIAL PRIMARY KEY,
        program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        prerequisites JSONB DEFAULT '[]',
        drip_days INTEGER DEFAULT 0,
        is_required BOOLEAN DEFAULT true,
        UNIQUE(program_id, course_id)
      );

      CREATE INDEX IF NOT EXISTS idx_program_courses ON program_courses(program_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS program_enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(user_id, program_id)
      );

      CREATE INDEX IF NOT EXISTS idx_program_enrollment ON program_enrollments(user_id, program_id);
    `);

    // ========== QUESTION BANK & ASSESSMENTS ==========
    console.log('❓ Creating question bank tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        options JSONB,
        correct_answer TEXT,
        acceptable_answers JSONB,
        difficulty VARCHAR(20) DEFAULT 'medium',
        category VARCHAR(100),
        tags JSONB DEFAULT '[]',
        case_sensitive BOOLEAN DEFAULT false,
        points DECIMAL(5,2) DEFAULT 1,
        explanation TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_question_org ON questions(org_id);
      CREATE INDEX IF NOT EXISTS idx_question_type ON questions(type);
      CREATE INDEX IF NOT EXISTS idx_question_difficulty ON questions(difficulty);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS question_pools (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        criteria JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pool_questions (
        pool_id INTEGER REFERENCES question_pools(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        PRIMARY KEY (pool_id, question_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        instructions TEXT,
        time_limit INTEGER,
        pass_threshold DECIMAL(5,2) DEFAULT 70,
        max_attempts INTEGER,
        shuffle_questions BOOLEAN DEFAULT true,
        shuffle_answers BOOLEAN DEFAULT true,
        show_feedback BOOLEAN DEFAULT true,
        show_correct_answers BOOLEAN DEFAULT true,
        available_from TIMESTAMP,
        available_until TIMESTAMP,
        settings JSONB DEFAULT '{}',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_assessment_course ON assessments(course_id);
      CREATE INDEX IF NOT EXISTS idx_assessment_lesson ON assessments(lesson_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_questions (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        points DECIMAL(5,2) DEFAULT 1,
        UNIQUE(assessment_id, question_id)
      );

      CREATE INDEX IF NOT EXISTS idx_assessment_questions ON assessment_questions(assessment_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        due_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'in_progress',
        score DECIMAL(5,2),
        points_earned DECIMAL(10,2),
        points_possible DECIMAL(10,2),
        passed BOOLEAN,
        questions_data JSONB,
        graded_answers JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_attempt_user ON assessment_attempts(user_id, assessment_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS attempt_answers (
        id SERIAL PRIMARY KEY,
        attempt_id INTEGER REFERENCES assessment_attempts(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        answer JSONB NOT NULL,
        is_correct BOOLEAN,
        points_earned DECIMAL(5,2),
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(attempt_id, question_id)
      );

      CREATE INDEX IF NOT EXISTS idx_attempt_answers ON attempt_answers(attempt_id);
    `);

    // ========== GRADEBOOK ==========
    console.log('📝 Creating gradebook tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS gradebooks (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        settings JSONB DEFAULT '{}',
        calculation_method VARCHAR(50) DEFAULT 'weighted_categories',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS grade_categories (
        id SERIAL PRIMARY KEY,
        gradebook_id INTEGER REFERENCES gradebooks(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        drop_lowest INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_grade_categories ON grade_categories(gradebook_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS grade_items (
        id SERIAL PRIMARY KEY,
        gradebook_id INTEGER REFERENCES gradebooks(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES grade_categories(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        points_possible DECIMAL(10,2) NOT NULL,
        due_date TIMESTAMP,
        weight DECIMAL(5,2),
        is_extra_credit BOOLEAN DEFAULT false,
        grading_type VARCHAR(50) DEFAULT 'points',
        rubric_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_grade_items ON grade_items(gradebook_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        grade_item_id INTEGER REFERENCES grade_items(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        score DECIMAL(10,2),
        points_possible DECIMAL(10,2),
        percentage DECIMAL(5,2),
        letter_grade VARCHAR(5),
        status VARCHAR(50) DEFAULT 'pending',
        graded_by INTEGER REFERENCES users(id),
        graded_at TIMESTAMP,
        feedback TEXT,
        late_submission BOOLEAN DEFAULT false,
        submission_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(grade_item_id, user_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_grades_user ON grades(user_id);
      CREATE INDEX IF NOT EXISTS idx_grades_item ON grades(grade_item_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS overall_grades (
        id SERIAL PRIMARY KEY,
        gradebook_id INTEGER REFERENCES gradebooks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        overall_score DECIMAL(10,2),
        overall_percentage DECIMAL(5,2),
        overall_letter VARCHAR(5),
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(gradebook_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_overall_grades ON overall_grades(gradebook_id, user_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rubrics (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        total_points DECIMAL(10,2),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rubric_criteria (
        id SERIAL PRIMARY KEY,
        rubric_id INTEGER REFERENCES rubrics(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        points DECIMAL(5,2) NOT NULL,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS rubric_levels (
        id SERIAL PRIMARY KEY,
        criterion_id INTEGER REFERENCES rubric_criteria(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        points DECIMAL(5,2) NOT NULL,
        sort_order INTEGER DEFAULT 0
      );
    `);

    // ========== SSO AUTHENTICATION ==========
    console.log('🔐 Creating SSO tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS sso_providers (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        provider_type VARCHAR(50) NOT NULL,
        provider_name VARCHAR(255) NOT NULL,
        config JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_sso_provider ON sso_providers(org_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sso_sessions (
        id SERIAL PRIMARY KEY,
        state VARCHAR(255) UNIQUE NOT NULL,
        provider_id INTEGER REFERENCES sso_providers(id) ON DELETE CASCADE,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        return_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sso_session_state ON sso_sessions(state);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sso_logins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        provider_id INTEGER REFERENCES sso_providers(id) ON DELETE CASCADE,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attributes JSONB
      );

      CREATE INDEX IF NOT EXISTS idx_sso_logins ON sso_logins(user_id);
    `);

    // ========== ADD MISSING COLUMNS TO EXISTING TABLES ==========
    console.log('🔧 Updating existing tables...');
    
    await client.query(`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id),
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

      CREATE INDEX IF NOT EXISTS idx_course_org ON courses(org_id);
    `);

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50),
      ADD COLUMN IF NOT EXISTS auth_provider_id INTEGER;
    `);

    console.log('\n✅ Phase 2 migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - Organizations & Multi-tenancy ✓');
    console.log('   - SCORM Support ✓');
    console.log('   - xAPI/Tin Can ✓');
    console.log('   - Programs & Learning Paths ✓');
    console.log('   - Question Bank ✓');
    console.log('   - Assessments & Quizzes ✓');
    console.log('   - Gradebook ✓');
    console.log('   - SSO Authentication ✓\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
