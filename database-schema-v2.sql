-- ProtexxaLearn LMS - Complete Database Schema v2.0
-- Implements: Programs → Courses → Modules → Lessons hierarchy
-- Supports: SCORM, xAPI, Prerequisites, Multi-tenant, Advanced Permissions

-- ============================================================================
-- MULTI-TENANCY & ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    logo_url TEXT,
    theme_config JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_domain ON organizations(domain);

-- ============================================================================
-- ENHANCED USER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'learner',
    status VARCHAR(50) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- SSO / External Authentication
CREATE TABLE IF NOT EXISTS user_auth_providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    provider_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_auth_providers_user ON user_auth_providers(user_id);
CREATE INDEX idx_auth_providers_provider ON user_auth_providers(provider, provider_user_id);

-- MFA Support
CREATE TABLE IF NOT EXISTS user_mfa (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    method VARCHAR(50) NOT NULL,
    secret TEXT NOT NULL,
    backup_codes TEXT[],
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROGRAMS (Top-level learning paths)
-- ============================================================================

CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    banner_url TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    visibility VARCHAR(50) DEFAULT 'private',
    sequence_enforced BOOLEAN DEFAULT false,
    certificate_template_id INTEGER,
    created_by INTEGER REFERENCES users(id),
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE INDEX idx_programs_org ON programs(organization_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_slug ON programs(slug);

-- Program Prerequisites
CREATE TABLE IF NOT EXISTS program_prerequisites (
    id SERIAL PRIMARY KEY,
    program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    prerequisite_program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    required_completion_percentage INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, prerequisite_program_id)
);

-- ============================================================================
-- ENHANCED COURSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    content_html TEXT,
    thumbnail_url TEXT,
    banner_url TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    visibility VARCHAR(50) DEFAULT 'private',
    language VARCHAR(10) DEFAULT 'en',
    level VARCHAR(50),
    duration_minutes INTEGER,
    credits DECIMAL(5,2),
    passing_grade INTEGER DEFAULT 70,
    max_attempts INTEGER,
    certificate_template_id INTEGER,
    created_by INTEGER REFERENCES users(id),
    sort_order INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    is_template BOOLEAN DEFAULT false,
    cloned_from INTEGER REFERENCES courses(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    archived_at TIMESTAMP,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_courses_org ON courses(organization_id);
CREATE INDEX idx_courses_program ON courses(program_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_code ON courses(code);

-- Course Prerequisites
CREATE TABLE IF NOT EXISTS course_prerequisites (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    required_completion_percentage INTEGER DEFAULT 100,
    required_grade INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, prerequisite_course_id)
);

-- Course Versions (for safe publishing)
CREATE TABLE IF NOT EXISTS course_versions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    changes_summary TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    UNIQUE(course_id, version_number)
);

-- ============================================================================
-- ENHANCED MODULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    parent_module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    content_html TEXT,
    module_type VARCHAR(50) DEFAULT 'content',
    status VARCHAR(50) DEFAULT 'draft',
    is_required BOOLEAN DEFAULT true,
    unlock_date TIMESTAMP,
    lock_date TIMESTAMP,
    sort_order INTEGER DEFAULT 0,
    completion_requirement VARCHAR(50) DEFAULT 'view_all',
    completion_threshold INTEGER DEFAULT 100,
    estimated_duration INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_modules_parent ON modules(parent_module_id);
CREATE INDEX idx_modules_sort ON modules(course_id, sort_order);

-- Module Prerequisites
CREATE TABLE IF NOT EXISTS module_prerequisites (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    prerequisite_module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, prerequisite_module_id)
);

-- ============================================================================
-- ENHANCED LESSONS (Multiple Content Types)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    content_html TEXT,
    lesson_type VARCHAR(50) DEFAULT 'page',
    status VARCHAR(50) DEFAULT 'draft',
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    points INTEGER DEFAULT 0,
    
    -- Content Type Specific Fields
    video_url TEXT,
    video_provider VARCHAR(50),
    video_duration INTEGER,
    video_transcript TEXT,
    
    file_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    
    external_url TEXT,
    external_embed_code TEXT,
    
    scorm_package_url TEXT,
    scorm_version VARCHAR(20),
    scorm_identifier VARCHAR(255),
    
    h5p_content_id VARCHAR(255),
    h5p_embed_code TEXT,
    
    -- Completion Rules
    completion_type VARCHAR(50) DEFAULT 'view',
    completion_threshold INTEGER DEFAULT 100,
    completion_time_required INTEGER,
    
    -- Access Control
    unlock_date TIMESTAMP,
    lock_date TIMESTAMP,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_sort ON lessons(module_id, sort_order);
CREATE INDEX idx_lessons_scorm ON lessons(scorm_identifier) WHERE scorm_identifier IS NOT NULL;

-- ============================================================================
-- COHORTS & GROUPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cohorts (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    enrollment_type VARCHAR(50) DEFAULT 'manual',
    max_students INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cohorts_org ON cohorts(organization_id);
CREATE INDEX idx_cohorts_code ON cohorts(code);

CREATE TABLE IF NOT EXISTS cohort_members (
    id SERIAL PRIMARY KEY,
    cohort_id INTEGER REFERENCES cohorts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'learner',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cohort_id, user_id)
);

CREATE INDEX idx_cohort_members_cohort ON cohort_members(cohort_id);
CREATE INDEX idx_cohort_members_user ON cohort_members(user_id);

-- ============================================================================
-- ENHANCED ENROLLMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    cohort_id INTEGER REFERENCES cohorts(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active',
    enrollment_type VARCHAR(50) DEFAULT 'manual',
    role VARCHAR(50) DEFAULT 'learner',
    
    -- Progress Tracking
    progress_percentage INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    time_spent_seconds BIGINT DEFAULT 0,
    
    -- Completion
    completed_at TIMESTAMP,
    completion_percentage INTEGER DEFAULT 0,
    final_grade DECIMAL(5,2),
    
    -- Dates & Deadlines
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP,
    due_date TIMESTAMP,
    access_until TIMESTAMP,
    
    -- Attempts
    attempt_number INTEGER DEFAULT 1,
    max_attempts INTEGER,
    
    -- Drip Schedule
    drip_enabled BOOLEAN DEFAULT false,
    drip_config JSONB DEFAULT '{}',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, course_id, attempt_number)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_cohort ON enrollments(cohort_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- ============================================================================
-- LESSON PROGRESS & COMPLETION
-- ============================================================================

CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    
    status VARCHAR(50) DEFAULT 'not_started',
    progress_percent INTEGER DEFAULT 0,
    score DECIMAL(5,2),
    
    -- Time Tracking
    time_spent_seconds BIGINT DEFAULT 0,
    first_accessed_at TIMESTAMP,
    last_accessed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Position/Resume
    resume_data JSONB DEFAULT '{}',
    
    -- Attempts
    attempt_number INTEGER DEFAULT 1,
    max_attempts INTEGER,
    
    -- SCORM/xAPI Data
    scorm_data JSONB DEFAULT '{}',
    xapi_statements JSONB DEFAULT '[]',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, lesson_id, attempt_number)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(status);

-- ============================================================================
-- QUESTION BANKS & ASSESSMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS question_banks (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_question_banks_org ON question_banks(organization_id);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question_bank_id INTEGER REFERENCES question_banks(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL,
    title VARCHAR(500),
    question_text TEXT NOT NULL,
    question_html TEXT,
    explanation TEXT,
    
    -- Question Data (answers, options, etc.)
    question_data JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    points DECIMAL(5,2) DEFAULT 1,
    difficulty VARCHAR(50),
    tags TEXT[],
    category VARCHAR(100),
    
    -- Statistics
    times_used INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_bank ON questions(question_bank_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);

-- Quizzes/Assessments
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instructions TEXT,
    
    -- Settings
    time_limit_minutes INTEGER,
    max_attempts INTEGER,
    passing_score INTEGER DEFAULT 70,
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_answers BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT true,
    show_correct_answers_at TIMESTAMP,
    
    -- Availability
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    
    -- Points
    total_points DECIMAL(5,2) DEFAULT 0,
    
    -- Question Selection
    question_selection_type VARCHAR(50) DEFAULT 'all',
    questions_per_page INTEGER DEFAULT 1,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);

-- Quiz Questions (links questions to quizzes)
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    question_group VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    points_override DECIMAL(5,2),
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_question ON quiz_questions(question_id);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'in_progress',
    
    -- Scoring
    score DECIMAL(5,2) DEFAULT 0,
    points_earned DECIMAL(5,2) DEFAULT 0,
    points_possible DECIMAL(5,2) DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_spent_seconds INTEGER,
    
    -- Data
    answers JSONB DEFAULT '{}',
    feedback JSONB DEFAULT '{}',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(quiz_id, user_id, attempt_number)
);

CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);

-- ============================================================================
-- ASSIGNMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instructions TEXT,
    
    -- Settings
    submission_types TEXT[] DEFAULT ARRAY['file', 'text'],
    max_file_size_mb INTEGER DEFAULT 10,
    allowed_file_types TEXT[],
    max_attempts INTEGER,
    
    -- Grading
    points_possible DECIMAL(5,2) DEFAULT 100,
    grading_type VARCHAR(50) DEFAULT 'points',
    rubric_id INTEGER,
    
    -- Dates
    available_from TIMESTAMP,
    due_date TIMESTAMP,
    lock_date TIMESTAMP,
    
    -- Peer Review
    peer_reviews_required INTEGER DEFAULT 0,
    anonymous_peer_reviews BOOLEAN DEFAULT false,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_lesson ON assignments(lesson_id);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Submission Content
    submission_type VARCHAR(50),
    submission_text TEXT,
    file_urls TEXT[],
    
    -- Grading
    score DECIMAL(5,2),
    grade VARCHAR(50),
    feedback TEXT,
    graded_by INTEGER REFERENCES users(id),
    graded_at TIMESTAMP,
    
    -- Timing
    submitted_at TIMESTAMP,
    late BOOLEAN DEFAULT false,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(assignment_id, user_id, attempt_number)
);

CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_user ON assignment_submissions(user_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);

-- Rubrics
CREATE TABLE IF NOT EXISTS rubrics (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL DEFAULT '[]',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GRADEBOOK
-- ============================================================================

CREATE TABLE IF NOT EXISTS grade_categories (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    weight DECIMAL(5,2) DEFAULT 0,
    drop_lowest INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    gradable_type VARCHAR(50) NOT NULL,
    gradable_id INTEGER NOT NULL,
    category_id INTEGER REFERENCES grade_categories(id),
    
    score DECIMAL(5,2),
    points_possible DECIMAL(5,2),
    percentage DECIMAL(5,2),
    letter_grade VARCHAR(10),
    
    weight DECIMAL(5,2) DEFAULT 1,
    is_excused BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    
    graded_by INTEGER REFERENCES users(id),
    graded_at TIMESTAMP,
    
    comments TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grades_enrollment ON grades(enrollment_id);
CREATE INDEX idx_grades_gradable ON grades(gradable_type, gradable_id);

-- ============================================================================
-- CERTIFICATES & BADGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS certificate_templates (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_html TEXT NOT NULL,
    template_css TEXT,
    variables JSONB DEFAULT '{}',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES certificate_templates(id),
    
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255),
    
    certificate_html TEXT,
    pdf_url TEXT,
    
    verification_url TEXT,
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    revoke_reason TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);

CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    criteria TEXT,
    points_required INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evidence_url TEXT,
    UNIQUE(user_id, badge_id)
);

-- ============================================================================
-- PERMISSIONS & ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, slug)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    scope_type VARCHAR(50),
    scope_id INTEGER,
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_id, role_id, scope_type, scope_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id INTEGER,
    changes JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================================
-- COMMUNICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP,
    send_notification BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_course ON announcements(course_id);
CREATE INDEX idx_announcements_published ON announcements(published_at);

CREATE TABLE IF NOT EXISTS discussions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES discussions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500),
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discussions_course ON discussions(course_id);
CREATE INDEX idx_discussions_lesson ON discussions(lesson_id);
CREATE INDEX idx_discussions_parent ON discussions(parent_id);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    message TEXT,
    link_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================================================
-- xAPI / LEARNING RECORD STORE
-- ============================================================================

CREATE TABLE IF NOT EXISTS xapi_statements (
    id SERIAL PRIMARY KEY,
    statement_id UUID UNIQUE NOT NULL,
    actor JSONB NOT NULL,
    verb JSONB NOT NULL,
    object JSONB NOT NULL,
    result JSONB,
    context JSONB,
    timestamp TIMESTAMP NOT NULL,
    stored TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    authority JSONB,
    version VARCHAR(20),
    attachments JSONB,
    
    -- For querying
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    lesson_id INTEGER REFERENCES lessons(id),
    
    raw_statement JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_xapi_statement_id ON xapi_statements(statement_id);
CREATE INDEX idx_xapi_user ON xapi_statements(user_id);
CREATE INDEX idx_xapi_course ON xapi_statements(course_id);
CREATE INDEX idx_xapi_timestamp ON xapi_statements(timestamp);

-- ============================================================================
-- CONTENT PACKAGES (SCORM, IMS CC, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_packages (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    package_type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    version VARCHAR(50),
    
    -- Package Files
    manifest_url TEXT,
    package_url TEXT NOT NULL,
    extracted_path TEXT,
    
    -- Metadata
    identifier VARCHAR(255),
    schema VARCHAR(100),
    schema_version VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'processing',
    error_message TEXT,
    
    -- Package Data
    manifest JSONB,
    metadata JSONB DEFAULT '{}',
    
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_packages_org ON content_packages(organization_id);
CREATE INDEX idx_packages_course ON content_packages(course_id);
CREATE INDEX idx_packages_type ON content_packages(package_type);

-- ============================================================================
-- CALENDAR & EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    location VARCHAR(500),
    online_meeting_url TEXT,
    recurrence_rule TEXT,
    is_all_day BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_org ON calendar_events(organization_id);
CREATE INDEX idx_events_course ON calendar_events(course_id);
CREATE INDEX idx_events_user ON calendar_events(user_id);
CREATE INDEX idx_events_time ON calendar_events(start_time, end_time);

-- ============================================================================
-- WEBHOOKS & INTEGRATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    events TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    headers JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_logs (
    id SERIAL PRIMARY KEY,
    webhook_id INTEGER REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempts INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at);

-- ============================================================================
-- INITIALIZE DEFAULT DATA
-- ============================================================================

-- Default Organization
INSERT INTO organizations (name, slug, domain, is_active) 
VALUES ('ProtexxaLearn', 'protexxalearn', 'protexxalearn.com', true)
ON CONFLICT (slug) DO NOTHING;

-- System Roles
INSERT INTO roles (organization_id, name, slug, is_system, permissions) VALUES
(1, 'Super Admin', 'super_admin', true, '["*"]'),
(1, 'Organization Admin', 'org_admin', true, '["org:*", "course:*", "user:*"]'),
(1, 'Instructor', 'instructor', true, '["course:edit", "course:view", "grade:*", "content:*"]'),
(1, 'Teaching Assistant', 'ta', true, '["course:view", "grade:view", "discussion:moderate"]'),
(1, 'Learner', 'learner', true, '["course:view", "course:enroll", "assignment:submit"]'),
(1, 'Auditor', 'auditor', true, '["course:view", "report:view"]')
ON CONFLICT (organization_id, slug) DO NOTHING;

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

CREATE OR REPLACE VIEW v_course_progress AS
SELECT 
    e.id as enrollment_id,
    e.user_id,
    u.name as user_name,
    u.email as user_email,
    e.course_id,
    c.title as course_title,
    e.progress_percentage,
    e.status,
    e.enrolled_at,
    e.completed_at,
    e.final_grade,
    e.time_spent_seconds,
    COUNT(DISTINCT lp.id) as lessons_started,
    COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.id END) as lessons_completed
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
LEFT JOIN lesson_progress lp ON lp.enrollment_id = e.id
GROUP BY e.id, u.id, u.name, u.email, c.id, c.title;

CREATE OR REPLACE VIEW v_gradebook AS
SELECT
    e.id as enrollment_id,
    e.user_id,
    u.name as student_name,
    e.course_id,
    c.title as course_title,
    g.gradable_type,
    g.gradable_id,
    g.score,
    g.points_possible,
    g.percentage,
    g.letter_grade,
    gc.name as category_name,
    gc.weight as category_weight,
    g.graded_at,
    g.graded_by
FROM grades g
JOIN enrollments e ON g.enrollment_id = e.id
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
LEFT JOIN grade_categories gc ON g.category_id = gc.id;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;

-- Calculate enrollment progress
CREATE OR REPLACE FUNCTION calculate_enrollment_progress(enrollment_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_lessons
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN enrollments e ON e.course_id = c.id
    WHERE e.id = enrollment_id_param AND l.is_required = true;
    
    SELECT COUNT(*) INTO completed_lessons
    FROM lesson_progress lp
    WHERE lp.enrollment_id = enrollment_id_param 
    AND lp.status = 'completed';
    
    IF total_lessons > 0 THEN
        progress := (completed_lessons * 100) / total_lessons;
    ELSE
        progress := 0;
    END IF;
    
    UPDATE enrollments 
    SET progress_percentage = progress,
        completion_percentage = progress
    WHERE id = enrollment_id_param;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress when lesson is completed
CREATE OR REPLACE FUNCTION update_progress_on_lesson_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        PERFORM calculate_enrollment_progress(NEW.enrollment_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lesson_progress_update ON lesson_progress;
CREATE TRIGGER trigger_lesson_progress_update
    AFTER INSERT OR UPDATE ON lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_progress_on_lesson_complete();

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_courses_search ON courses USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_lessons_search ON lessons USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_enrollments_user_status ON enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_status ON lesson_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_grades_enrollment_category ON grades(enrollment_id, category_id);

COMMENT ON DATABASE current_database() IS 'ProtexxaLearn LMS - Enterprise Learning Management System v2.0';
